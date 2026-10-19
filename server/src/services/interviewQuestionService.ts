import { buildInterviewPrompt, PromptInput } from '../prompts/interviewPrompt';
import { InterviewQuestion } from '../types/InterviewQuestion';
import { aiGateway } from './ai/aiGateway';

export const generateQuestions = async (
  input: PromptInput,
  userId?: string
): Promise<InterviewQuestion[]> => {
  const prompt = buildInterviewPrompt(input);

  const response = await aiGateway.execute<InterviewQuestion[]>({
    task: 'INTERVIEW_QUESTIONS_LEGACY',
    prompt,
    userId,
    outputMode: 'json',
    validator: (parsed: any) => {
      // Handle when model wraps in { questions: [...] } or returns raw array
      let items = parsed;
      if (!Array.isArray(items) && items && Array.isArray(items.questions)) {
        items = items.questions;
      }

      if (!Array.isArray(items)) {
        throw new Error('Invalid Groq Response: Expected an array');
      }

      return items.map((item: any, index: number) => {
        if (!item.question || !item.difficulty || !item.category || !item.expectedAnswer) {
          throw new Error(`Invalid Groq Response: Missing required fields in question at index ${index}`);
        }

        return {
          id: `gen-${Date.now()}-${index}`,
          question: item.question,
          difficulty: item.difficulty,
          category: item.category,
          expectedAnswer: item.expectedAnswer,
          followUps: Array.isArray(item.followUps) ? item.followUps : [],
        };
      });
    },
  });

  return response.data;
};
