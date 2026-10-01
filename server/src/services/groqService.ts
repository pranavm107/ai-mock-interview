import Groq from 'groq-sdk';
import { GeminiTimeoutError } from '../types/careerErrors';

export const callGroq = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in the environment.");
  }

  const groq = new Groq({ apiKey });
  const modelId = process.env.GROQ_MODEL || 'llama3-70b-8192';

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      // Reusing GeminiTimeoutError for compatibility with existing error handling logic
      reject(new GeminiTimeoutError("Groq API call timed out after 15 seconds."));
    }, 15000);
  });

  const generatePromise = groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: modelId,
    response_format: { type: "json_object" },
  }).then(chatCompletion => {
    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned empty response.");
    }
    return content;
  });

  return Promise.race([generatePromise, timeoutPromise]);
};
