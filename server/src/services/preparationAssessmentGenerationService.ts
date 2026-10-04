import { db } from '../config/firebaseAdmin';
import { z } from 'zod';
import { callGroq } from './groqService';
import { buildPreparationAssessmentPrompt } from '../prompts/preparationAssessmentPrompt';
import { 
  createAssessment, 
  saveAssessmentQuestions, 
  updateAssessmentStatus,
  markAssessmentFailed
} from './assessmentService';
import { Assessment, AssessmentQuestion, AssessmentGenerationAIOutput, AssessmentQuestionForUser, AssessmentType, AptitudeCategory } from '../types/assessment';
import { randomUUID } from 'crypto';

const AssessmentOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1)
});

const AssessmentQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(AssessmentOptionSchema).length(4, "Must have exactly 4 options"),
  correctOptionId: z.string().min(1),
  explanation: z.string().min(1),
  skill: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'])
}).refine(data => data.options.some(opt => opt.id === data.correctOptionId), {
  message: "correctOptionId must match one of the option IDs",
  path: ["correctOptionId"]
});

const PreparationAssessmentAIOutputSchema = z.object({
  questions: z.array(AssessmentQuestionSchema)
});

export const generatePreparationAssessment = async (
  userId: string,
  categorySlug: string,
  topic: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  questionCount: number,
  mode: 'PRACTICE' | 'TIMED'
): Promise<Assessment & { questions: AssessmentQuestionForUser[] }> => {
  // Map UI slug to internal type and title
  let type: AssessmentType = 'APTITUDE'; // fallback default
  let categoryEnum: AptitudeCategory | undefined;
  let title = 'Preparation Assessment';

  if (categorySlug === 'aptitude') {
    type = 'APTITUDE';
    categoryEnum = 'QUANTITATIVE';
    title = `Aptitude: ${topic}`;
  } else if (categorySlug === 'technical-mcqs') {
    type = 'TECHNICAL_MCQ';
    title = `Technical: ${topic}`;
  } else if (categorySlug === 'verbal-ability') {
    type = 'APTITUDE';
    categoryEnum = 'VERBAL';
    title = `Verbal: ${topic}`;
  } else if (categorySlug === 'logical-reasoning') {
    type = 'APTITUDE';
    categoryEnum = 'LOGICAL_REASONING';
    title = `Logical: ${topic}`;
  } else {
    throw new Error('Unsupported category slug');
  }

  const assessmentId = db.collection('assessments').doc().id;
  const now = new Date().toISOString();
  
  const assessment: Assessment = {
    id: assessmentId,
    userId,
    type,
    category: categoryEnum,
    status: 'GENERATING',
    difficulty,
    title,
    questionCount,
    mode, // Assuming we add mode to Assessment type
    topic, // Assuming we add topic to Assessment type
    createdAt: now,
    updatedAt: now
  };
  
  await createAssessment(assessment);

  const prompt = buildPreparationAssessmentPrompt(categorySlug, topic, questionCount, difficulty);
  let aiOutput: AssessmentGenerationAIOutput | null = null;
  let attempts = 0;

  while (attempts < 2 && !aiOutput) {
    attempts++;
    try {
      const rawText = await callGroq(prompt);
      
      let jsonText = rawText.trim();
      if (jsonText.startsWith('```json')) jsonText = jsonText.substring(7);
      if (jsonText.startsWith('```')) jsonText = jsonText.substring(3);
      if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);
      
      const parsed = JSON.parse(jsonText.trim());
      const validated = PreparationAssessmentAIOutputSchema.parse(parsed);
      
      aiOutput = validated;
    } catch (error) {
      console.warn(`Groq generation attempt ${attempts} failed:`, error);
      if (attempts >= 2) {
        await markAssessmentFailed(assessmentId);
        throw new Error('Failed to generate valid assessment from AI provider');
      }
    }
  }

  if (!aiOutput) {
    await markAssessmentFailed(assessmentId);
    throw new Error('Assessment generation failed.');
  }

  // Ensure exact count and unique IDs
  const finalQuestions = aiOutput.questions.slice(0, questionCount).map(q => ({
    ...q,
    id: randomUUID(),
    assessmentId,
    category: categoryEnum
  })) as AssessmentQuestion[];

  await saveAssessmentQuestions(assessmentId, finalQuestions);
  await updateAssessmentStatus(assessmentId, 'READY');

  const safeQuestions: AssessmentQuestionForUser[] = finalQuestions.map(q => ({
    id: q.id,
    assessmentId: q.assessmentId,
    question: q.question,
    options: q.options,
    skill: q.skill,
    difficulty: q.difficulty,
    category: q.category
  }));

  return {
    ...assessment,
    status: 'READY',
    questions: safeQuestions
  };
};
