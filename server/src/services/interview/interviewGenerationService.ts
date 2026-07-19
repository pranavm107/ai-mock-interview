import { generateJson } from '../ai/geminiClient';
import { db } from '../../config/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { Interview, InterviewSettings, InterviewQuestion, InterviewMetadata } from '../../types/interview';
import { planInterview } from './questionPlanner';
import { validateGeneratedInterview } from './interviewValidator';
import { buildFinalPrompt } from './promptBuilder';
import { generateInterviewAnalytics } from './interviewAnalyticsService';

export const generateInterview = async (
  userId: string,
  resumeId: string | null | undefined,
  settings: InterviewSettings
): Promise<Interview> => {
  const startTime = Date.now();
  
  // 1. Fetch Resume
  let structuredResume = null;
  if (resumeId) {
    const resumeDocRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeDocRef);
    if (resumeSnap.exists()) {
      structuredResume = resumeSnap.data().structuredResume;
    }
  }
  
  // 2. Planning Phase (Single Source of Truth)
  const blueprint = planInterview(settings, structuredResume);
  
  // 3. Build Modular Prompt
  const prompt = buildFinalPrompt(settings, blueprint, structuredResume);
  
  // 4. Generate via Gemini
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
  } catch (error) {
    throw new Error("Failed to parse AI response as JSON");
  }
  
  // 5. Validation, Quality Filters, Hallucination Guard
  const validInterview = validateGeneratedInterview(parsedResponse, blueprint);
  
  // 6. Format Output
  const questions: InterviewQuestion[] = validInterview.questions.map((q, i) => ({
    ...q,
    id: `gen-${Date.now()}-${i}`
  }));
  
  // 7. Analytics
  const analytics = generateInterviewAnalytics(questions, blueprint);

  const metadata: InterviewMetadata = {
    promptVersion: "2.0.0", // Phase 5 Modular Prompt
    plannerVersion: blueprint.metadata.plannerVersion,
    validatorVersion: "2.0.0",
    profileVersion: "2.0.0",
    model: "gemini-2.5-pro",
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
