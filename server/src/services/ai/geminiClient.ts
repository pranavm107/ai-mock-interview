import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let modelInstance: GenerativeModel | null = null;

export const getGeminiModel = (modelName: string = 'gemini-2.5-flash'): GenerativeModel => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  return genAI.getGenerativeModel({ 
    model: modelName, 
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1, // Keep it deterministic
    }
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const FALLBACK_MODELS = [
  'gemini-2.5-flash', 
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash-8b'
];

export const generateText = async (prompt: string, maxRetries = 2): Promise<string> => {
  let lastError: any;

  for (const modelName of FALLBACK_MODELS) {
    const model = getGeminiModel(modelName);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) throw new Error("Gemini returned empty response.");
        return text;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Text] Attempt ${attempt} with ${modelName} failed:`, error.message || error);
        
        if (error.status === 400 || error.status === 401 || error.status === 403) break;
        if (attempt < maxRetries) await delay(Math.pow(2, attempt) * 1000);
      }
    }
  }
  
  throw new Error(`Failed to generate text after multiple attempts. Last error: ${lastError?.message || lastError}`);
};

export const generateJson = async (prompt: string, maxRetries = 3): Promise<string> => {
  let lastError: any;
  const models = FALLBACK_MODELS;

  for (const modelName of models) {
    const model = getGeminiModel(modelName);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const text = response.text();
        if (!text) {
          throw new Error("Gemini returned empty response.");
        }
        
        return text;
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} with ${modelName} failed:`, error.message || error);
        
        // Don't retry if it's a structural/auth error (e.g. 400 or 401)
        if (error.status === 400 || error.status === 401 || error.status === 403) {
           break; 
        }

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(`Waiting ${Math.round(waitTime)}ms before next attempt...`);
          await delay(waitTime);
        }
      }
    }
    console.warn(`All attempts for model ${modelName} failed. Falling back...`);
  }
  
  const finalErrorMsg = lastError?.message || String(lastError);
  if (finalErrorMsg.includes('429') || finalErrorMsg.includes('Quota exceeded')) {
    throw new Error('AI service is temporarily unavailable because the daily Gemini API quota has been reached.\n\nYour resume and interview configuration have been saved. Please try again later or switch to a Flash model.');
  }

  throw new Error(`Failed to generate JSON after multiple attempts. Last error: ${finalErrorMsg}`);
};
