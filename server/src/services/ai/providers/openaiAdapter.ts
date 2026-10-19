import { LLMProvider, ProviderRequest, ProviderResponse } from './llmProvider';
import { TokenUsage } from '../types';

let customFetchFn: typeof fetch | null = null;

export const setOpenAIFetch = (fn: typeof fetch | null) => {
  customFetchFn = fn;
};

export class OpenAIProviderAdapter implements LLMProvider {
  readonly name = 'openai';

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in the environment.');
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const model = request.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const payload: Record<string, any> = {
      model,
      messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    };

    if (request.outputMode === 'json') {
      payload.response_format = { type: 'json_object' };
    }

    const activeFetch = customFetchFn || fetch;

    let response: Response;
    try {
      response = await activeFetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: request.signal,
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError' || fetchErr.message?.includes('aborted')) {
        throw fetchErr;
      }
      const rawMsg = fetchErr.message || 'Network request to OpenAI failed';
      const sanitized = rawMsg.replace(/sk-[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]');
      const err: any = new Error(sanitized);
      err.code = fetchErr.code || 'OPENAI_NETWORK_ERROR';
      throw err;
    }

    if (!response.ok) {
      let errBody: any = null;
      try {
        errBody = await response.json();
      } catch (_) {
        // Response was not JSON
      }

      const rawMsg = errBody?.error?.message || `OpenAI returned HTTP status ${response.status}`;
      const sanitizedMsg = rawMsg.replace(/sk-[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]');
      const error: any = new Error(sanitizedMsg);
      error.status = response.status;
      error.code = errBody?.error?.code;
      error.type = errBody?.error?.type;
      throw error;
    }

    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (text === undefined || text === null) {
      throw new Error('OpenAI returned an empty response.');
    }

    const usage: TokenUsage = {
      promptTokens: typeof data.usage?.prompt_tokens === 'number' ? data.usage.prompt_tokens : null,
      completionTokens: typeof data.usage?.completion_tokens === 'number' ? data.usage.completion_tokens : null,
      totalTokens: typeof data.usage?.total_tokens === 'number' ? data.usage.total_tokens : null,
    };

    return {
      text,
      model: data.model || model,
      usage,
    };
  }
}
