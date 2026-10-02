import Groq from 'groq-sdk';
import { GroqTimeoutError } from '../types/careerErrors';

export const callGroq = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in the environment.");
  }

  const groq = new Groq({ apiKey });
  const modelId = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      // Reusing GeminiTimeoutError for compatibility with existing error handling logic
      reject(new GroqTimeoutError("Groq API call timed out after 15 seconds."));
    }, 15000);
  });

  const isJsonMode = prompt.toLowerCase().includes('json');
  
  const generatePromise = groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: modelId,
    ...(isJsonMode && { response_format: { type: "json_object" } }),
  }).then(chatCompletion => {
    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned empty response.");
    }
    return content;
  });

  return Promise.race([generatePromise, timeoutPromise]);
};
