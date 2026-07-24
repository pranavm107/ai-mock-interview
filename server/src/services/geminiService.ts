import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiTimeoutError } from '../types/careerErrors';

export const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new GeminiTimeoutError("Gemini API call timed out after 15 seconds."));
    }, 15000);
  });

  const generatePromise = model.generateContent(prompt).then(result => result.response.text());

  return Promise.race([generatePromise, timeoutPromise]);
};
