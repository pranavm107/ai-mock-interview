import { generateJson } from '../ai/groqClient';
import { db } from '../../config/firebaseAdmin';
import { Interview, InterviewSettings, InterviewQuestion, InterviewMetadata } from '../../types/interview';
import { planInterview } from './questionPlanner';
import { validateGeneratedInterview } from './interviewValidator';
import { buildFinalPrompt } from './promptBuilder';
import { generateInterviewAnalytics } from './interviewAnalyticsService';

import { runBatchAIValidation, regenerateInvalidQuestions } from './aiQuestionValidator';

export const generateInterview = async (
  userId: string,
  resumeId: string | null | undefined,
  settings: InterviewSettings
): Promise<Interview> => {
  const startTime = Date.now();
  
  // 1. Fetch Resume
  let structuredResume = null;
  if (resumeId) {
    const resumeDocRef = db.collection('resumes').doc(resumeId);
    const resumeSnap = await resumeDocRef.get();
    if (resumeSnap.exists) {
      structuredResume = resumeSnap.data()?.structuredResume;
    }
  }
  
  // 2. Planning Phase (Single Source of Truth)
  const blueprint = planInterview(settings, structuredResume);
  
  // 3. Build Modular Prompt
  const prompt = buildFinalPrompt(settings, blueprint, structuredResume);
  
  // 4. Generate via Groq
  const rawResponse = await generateJson(prompt);
  let parsedResponse;
  try {
    let jsonText = rawResponse.trim();
    if (jsonText.startsWith('```')) {
      const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        jsonText = match[1];
      }
    }
    parsedResponse = JSON.parse(jsonText);
  } catch (_e) {
    throw new Error("Failed to parse AI response as JSON");
  }
  
  // 5. Deterministic Validation
  let validInterview = validateGeneratedInterview(parsedResponse, blueprint, settings);
  
  // 6. Batch AI Quality Validation
  try {
    const aiValidation = await runBatchAIValidation(
      validInterview.questions,
      settings.targetRole,
      settings.targetCompany,
      settings.interviewType || 'TECHNICAL'
    );
    
    const invalidQuestions = aiValidation.questions
      .filter(q => !q.valid && (q.severity === 'HIGH' || q.severity === 'MEDIUM'))
      .map(q => ({
        ...q,
        original: validInterview.questions[q.index]
      }));
      
    if (invalidQuestions.length > 0) {
      console.log(`Regenerating ${invalidQuestions.length} invalid questions.`);
      const replacements = await regenerateInvalidQuestions(
        invalidQuestions,
        settings.targetRole,
        settings.targetCompany,
        settings.interviewType || 'TECHNICAL'
      );
      
      for (const replacement of replacements) {
        if (replacement.questionData && typeof replacement.index === 'number' && replacement.index >= 0 && replacement.index < validInterview.questions.length) {
          validInterview.questions[replacement.index] = replacement.questionData;
        }
      }
      
      // Final deterministic validation
      validInterview = validateGeneratedInterview(validInterview, blueprint, settings);
    }
  } catch (error) {
    console.error("AI Quality Validation failed:", error);
    throw new Error("We couldn't create a reliable interview right now. Please try generating the interview again.");
  }
  
  // 7. Format Output
  const questions: InterviewQuestion[] = validInterview.questions.map((q, i) => ({
    ...q,
    id: `gen-${Date.now()}-${i}`
  }));
  
  // 8. Analytics
  const analytics = generateInterviewAnalytics(questions, blueprint);

  const metadata: InterviewMetadata = {
    promptVersion: "2.0.0", // Phase 5 Modular Prompt
    plannerVersion: blueprint.metadata.plannerVersion,
    validatorVersion: "2.0.0",
    profileVersion: "2.0.0",
    model: "llama3-70b-8192",
    generationTimeMs: Date.now() - startTime,
    questionDistribution: {
      resume: blueprint.sections.find(b => b.category === "RESUME")?.questions || 0,
      role: blueprint.sections.find(b => b.category === "ROLE")?.questions || 0,
      company: blueprint.sections.find(b => b.category === "COMPANY")?.questions || 0,
      behavioral: blueprint.sections.find(b => b.category === "BEHAVIORAL")?.questions || 0,
    },
    resumeHash: resumeId || 'no-resume', // Future enhancement: hash actual resume JSON
    createdAt: new Date().toISOString()
  };
  
  return {
    userId,
    resumeId: resumeId || null,
    company: settings.targetCompany,
    role: settings.targetRole,
    difficulty: "MIXED", // Difficulty is managed at question level now
    settings,
    metadata,
    blueprint,
    coverage: {
      resume: blueprint.resumeCoverage,
      skills: blueprint.skillCoverage
    },
    analytics,
    questions
  };
};
