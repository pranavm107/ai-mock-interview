import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let modelInstance: GenerativeModel | null = null;

export const getGeminiModel = (): GenerativeModel => {
  if (modelInstance) return modelInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // We use gemini-flash-latest with JSON enforcement
  modelInstance = genAI.getGenerativeModel({ 
    model: 'gemini-flash-latest', 
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1, // Keep it deterministic
    }
  });

  return modelInstance;
};

export const generateJson = async (prompt: string): Promise<string> => {
  const model = getGeminiModel();
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  const text = response.text();
  if (!text) {
    throw new Error("Gemini returned empty response.");
  }
  
  return text;
};
