import { generateJson } from '../ai/groqClient';
import { buildBatchValidationPrompt, buildRegenerationPrompt } from '../../prompts/interviewQuestionValidationPrompt';
import { InterviewQuestion } from '../../types/interview';

export interface AIValidationResult {
  questions: {
    index: number;
    valid: boolean;
    severity: "NONE" | "LOW" | "MEDIUM" | "HIGH";
    issues: string[];
  }[];
  overallValid: boolean;
}

export const runBatchAIValidation = async (
  questions: any[],
  role: string,
  company: string,
  interviewType: string
): Promise<AIValidationResult> => {
  const prompt = buildBatchValidationPrompt(questions, role, company, interviewType);
  
  // Try generating with 1 retry limit (as per requirement: 1 initial + 1 retry max)
  const rawResponse = await generateJson(prompt, 1);
  
  let parsed: any;
  try {
    let jsonText = rawResponse.trim();
    if (jsonText.startsWith('```')) {
      const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        jsonText = match[1];
      }
    }
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error("Failed to parse AI validator response.");
  }
  
  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error("AI validator response missing 'questions' array.");
  }
  
  return parsed as AIValidationResult;
};

export const regenerateInvalidQuestions = async (
  invalidQuestions: { index: number; issues: string[]; original: any }[],
  role: string,
  company: string,
  interviewType: string
): Promise<{ index: number; questionData: any }[]> => {
  const isMcq = interviewType === 'MCQ';
  const prompt = buildRegenerationPrompt(invalidQuestions, role, company, interviewType, isMcq);
  
  const rawResponse = await generateJson(prompt, 1);
  
  let parsed: any;
  try {
    let jsonText = rawResponse.trim();
    if (jsonText.startsWith('\`\`\`')) {
      const match = jsonText.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/);
      if (match && match[1]) {
        jsonText = match[1];
      }
    }
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error("Failed to parse AI regeneration response.");
  }
  
  if (!parsed || !Array.isArray(parsed.replacements)) {
    throw new Error("AI regeneration response missing 'replacements' array.");
  }
  
  return parsed.replacements;
};
