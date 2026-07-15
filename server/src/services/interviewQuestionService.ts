import { generateJson } from './ai/geminiClient';
import { buildInterviewPrompt, PromptInput } from '../prompts/interviewPrompt';
import { buildResumeInterviewPrompt, ResumePromptInput } from '../prompts/resumeInterviewPrompt';
import { InterviewQuestion } from '../types/InterviewQuestion';
import { db } from '../config/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { StructuredResume } from '../../../src/types/resume';

export interface GenerateQuestionsInput extends PromptInput {
  userId?: string;
  resumeId?: string | null;
}

export const generateQuestions = async (input: GenerateQuestionsInput): Promise<InterviewQuestion[]> => {
  let prompt = '';
  
  if (input.resumeId) {
    const resumeDocRef = doc(db, 'resumes', input.resumeId);
    const resumeSnap = await getDoc(resumeDocRef);
    let structuredResume: StructuredResume | null = null;
    
    if (resumeSnap.exists()) {
      const data = resumeSnap.data();
      if (data.structuredResume) {
        structuredResume = data.structuredResume as StructuredResume;
      }
    }
    
    prompt = buildResumeInterviewPrompt({
      company: input.company,
      role: input.role,
      experience: input.experience,
      difficulty: input.difficulty,
      skills: input.skills,
      questionCount: input.questionCount,
      resume: structuredResume
    });
  } else {
    prompt = buildInterviewPrompt(input);
  }
  
  const rawResponse = await generateJson(prompt);
  let jsonText = rawResponse.trim();
  
  if (jsonText.startsWith('```')) {
    const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      jsonText = match[1];
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Invalid Gemini Response: Could not parse JSON");
  }

  // Handle the new prompt format which returns an object { questions: [] } instead of raw array
  let parsedArray = parsed;
  if (!Array.isArray(parsed)) {
    if (parsed.questions && Array.isArray(parsed.questions)) {
      parsedArray = parsed.questions;
    } else {
      throw new Error("Invalid Gemini Response: Expected an array or an object containing a 'questions' array");
    }
  }

  const questions: InterviewQuestion[] = parsedArray.map((item: any, index: number) => {
    // Map expectedTopics (new prompt format) to expectedAnswer (old format)
    let expectedAnswer = item.expectedAnswer;
    if (!expectedAnswer && item.expectedTopics && Array.isArray(item.expectedTopics)) {
      expectedAnswer = item.expectedTopics.join(', ');
    }

    if (!item.question || !item.difficulty || !item.category || !expectedAnswer) {
      throw new Error(`Invalid Gemini Response: Missing required fields in question at index ${index}`);
    }

    return {
      id: `gen-${Date.now()}-${index}`,
      question: item.question,
      difficulty: item.difficulty,
      category: item.category,
      expectedAnswer: expectedAnswer,
      followUps: Array.isArray(item.followUps) ? item.followUps : []
    };
  });

  return questions;
};
