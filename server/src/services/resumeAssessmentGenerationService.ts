import { db } from '../config/firebaseAdmin';
import { z } from 'zod';
import { callGroq } from './groqService';
import { buildResumeAssessmentPrompt } from '../prompts/resumeAssessmentPrompt';
import { buildResumeAssessmentContext } from './resumeAssessmentContextService';
import { 
  createAssessment, 
  saveAssessmentQuestions, 
  updateAssessmentStatus,
  markAssessmentFailed
} from './assessmentService';
import { Assessment, AssessmentQuestion, AssessmentGenerationAIOutput, AssessmentQuestionForUser } from '../types/assessment';
import { Resume } from '../types/resume';
import { randomUUID } from 'crypto';

// Step 6: Zod Schema Validation
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

const ResumeAssessmentAIOutputSchema = z.object({
  questions: z.array(AssessmentQuestionSchema)
});

export const generateResumeAssessment = async (
  userId: string, 
  resumeId: string
): Promise<Assessment & { questions: AssessmentQuestionForUser[] }> => {
  // 1. Fetch Resume and Verify Ownership
  const resumeDoc = await db.collection('resumes').doc(resumeId).get();
  if (!resumeDoc.exists) {
    throw new Error('Resume not found');
  }
  const resume = resumeDoc.data() as Resume;
  if (resume.userId !== userId) {
    throw new Error('Unauthorized: Resume does not belong to the user');
  }

  // 2. Build Context
  const context = buildResumeAssessmentContext(resume);
  const questionCount = 10;
  
  // 3. Create Assessment Record
  const assessmentId = db.collection('assessments').doc().id; // Auto-generate ID safely
  const now = new Date().toISOString();
  
  const assessment: Assessment = {
    id: assessmentId,
    userId,
    type: 'RESUME_MCQ',
    resumeId,
    status: 'GENERATING',
    difficulty: 'MEDIUM',
    title: 'Resume Skills Assessment',
    questionCount,
    createdAt: now,
    updatedAt: now
  };
  
  await createAssessment(assessment);

  // 4. Generate with Retries
  const prompt = buildResumeAssessmentPrompt(context, questionCount, 'MEDIUM');
  let aiOutput: AssessmentGenerationAIOutput | null = null;
  let attempts = 0;
  let lastError = null;

  while (attempts < 2 && !aiOutput) {
    attempts++;
    try {
      const rawText = await callGroq(prompt);
      
      // Clean up potential markdown formatting from Gemini
      let jsonText = rawText.trim();
      if (jsonText.startsWith('\`\`\`json')) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.startsWith('\`\`\`')) {
        jsonText = jsonText.substring(3);
      }
      if (jsonText.endsWith('\`\`\`')) {
        jsonText = jsonText.slice(0, -3);
      }
      
      const parsed = JSON.parse(jsonText.trim());
      
      // Validate
      aiOutput = ResumeAssessmentAIOutputSchema.parse(parsed) as AssessmentGenerationAIOutput;
    } catch (error) {
      console.error(`AI Generation Attempt ${attempts} failed:`, error);
      lastError = error;
    }
  }

  // 5. Failure Handling
  if (!aiOutput) {
    await markAssessmentFailed(assessmentId);
    throw new Error(`Failed to generate valid assessment after 2 attempts. Last error: ${lastError}`);
  }

  // 6. Map and Save Questions
  const backendQuestions: AssessmentQuestion[] = aiOutput.questions.map(q => ({
    ...q,
    id: randomUUID(),
    assessmentId
  }));

  await saveAssessmentQuestions(assessmentId, backendQuestions);

  // 7. Update Status to READY
  await updateAssessmentStatus(assessmentId, 'READY');

  // 8. Return Safe Response
  const safeQuestions: AssessmentQuestionForUser[] = backendQuestions.map(q => ({
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
    updatedAt: new Date().toISOString(),
    questions: safeQuestions
  };
};
