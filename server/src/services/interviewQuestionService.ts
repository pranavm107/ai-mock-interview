import { callGemini } from './geminiService';
import { buildInterviewPrompt, PromptInput } from '../prompts/interviewPrompt';
import { InterviewQuestion } from '../types/InterviewQuestion';

export const generateQuestions = async (input: PromptInput): Promise<InterviewQuestion[]> => {
  const prompt = buildInterviewPrompt(input);
  
  const rawResponse = await callGemini(prompt);
  
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

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid Gemini Response: Expected an array");
  }

  const questions: InterviewQuestion[] = parsed.map((item: any, index: number) => {
    if (!item.question || !item.difficulty || !item.category || !item.expectedAnswer) {
      throw new Error(`Invalid Gemini Response: Missing required fields in question at index ${index}`);
    }

    return {
      id: `gen-${Date.now()}-${index}`,
      question: item.question,
      difficulty: item.difficulty,
      category: item.category,
      expectedAnswer: item.expectedAnswer,
      followUps: Array.isArray(item.followUps) ? item.followUps : []
    };
  });

  return questions;
};
