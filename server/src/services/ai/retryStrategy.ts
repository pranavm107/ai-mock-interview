import { QuotaExceededError, InvalidApiKeyError, TransientAIError, AIError } from '../../errors/aiErrors';

export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        console.warn(`[AI Retry Strategy] Retrying operation... Attempt ${attempt} of ${maxRetries}`);
        // Exponential backoff: 2s, 4s, 8s...
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      return await operation();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || '';

      if (errorMsg.includes('429 Too Many Requests')) {
        console.error(`[AI Retry Strategy] Quota exceeded. Skipping retries.`);
        throw new QuotaExceededError(errorMsg);
      }
      
      if (errorMsg.includes('401') || errorMsg.includes('403')) {
        console.error(`[AI Retry Strategy] Authentication error. Skipping retries.`);
        throw new InvalidApiKeyError(errorMsg);
      }
      
      if (errorMsg.includes('400') || errorMsg.includes('404')) {
        console.error(`[AI Retry Strategy] Client error. Skipping retries.`);
        throw new AIError('AI_CLIENT_ERROR', errorMsg, false);
      }

      console.error(`[AI Retry Strategy] Operation failed on attempt ${attempt}:`, errorMsg);
      attempt++;
    }
  }

  throw new TransientAIError(`Operation failed after ${maxRetries} retries. Last error: ${lastError?.message}`);
};
