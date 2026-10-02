import Groq from 'groq-sdk';

let groqInstance: Groq | null = null;

export const getGroqClient = (): Groq => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in the environment.");
  }

  if (!groqInstance) {
    groqInstance = new Groq({ apiKey });
  }
  return groqInstance;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const FALLBACK_MODELS = [
  process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b'
];

export const generateText = async (prompt: string, maxRetries = 2): Promise<string> => {
  let lastError: any;
  const groq = getGroqClient();

  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: modelName,
          temperature: 0.1,
        });
        
        const text = chatCompletion.choices[0]?.message?.content;
        if (!text) throw new Error("Groq returned empty response.");
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
  const groq = getGroqClient();

  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: modelName,
          temperature: 0.1,
          response_format: { type: "json_object" },
        });
        
        const text = chatCompletion.choices[0]?.message?.content;
        if (!text) {
          throw new Error("Groq returned empty response.");
        }
        
        return text;
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} with ${modelName} failed:`, error.message || error);
        
        // Don't retry if it's a structural/auth error
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
    throw new Error('AI service is temporarily unavailable because the daily Groq API quota has been reached.\n\nYour resume and interview configuration have been saved. Please try again later.');
  }

  throw new Error(`Failed to generate JSON after multiple attempts. Last error: ${finalErrorMsg}`);
};
