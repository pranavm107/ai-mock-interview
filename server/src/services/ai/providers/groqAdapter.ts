import Groq from 'groq-sdk';
import { LLMProvider, ProviderRequest, ProviderResponse } from './llmProvider';
import { TokenUsage } from '../types';

let groqClientInstance: Groq | null = null;

export const getSharedGroqClient = (): Groq => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in the environment.');
  }

  if (!groqClientInstance) {
    groqClientInstance = new Groq({ apiKey, maxRetries: 0 });
  }
  return groqClientInstance;
};

// Exposed for unit testing to reset singleton or inject mock
export const setSharedGroqClient = (client: Groq | null) => {
  groqClientInstance = client;
};

export class GroqProviderAdapter implements LLMProvider {
  readonly name = 'groq';

  isConfigured(): boolean {
    return Boolean(process.env.GROQ_API_KEY);
  }

  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    const groq = getSharedGroqClient();

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const completionParams: Parameters<Groq['chat']['completions']['create']>[0] = {
      model: request.model,
      messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      ...(request.outputMode === 'json' && { response_format: { type: 'json_object' } }),
    };

    const completion = (await groq.chat.completions.create(
      {
        ...completionParams,
        stream: false,
      },
      { signal: request.signal }
    )) as Groq.Chat.ChatCompletion;

    const text = completion.choices[0]?.message?.content;
    if (text === undefined || text === null) {
      throw new Error('Groq returned an empty response.');
    }

    const usage: TokenUsage = {
      promptTokens: typeof completion.usage?.prompt_tokens === 'number' ? completion.usage.prompt_tokens : null,
      completionTokens: typeof completion.usage?.completion_tokens === 'number' ? completion.usage.completion_tokens : null,
      totalTokens: typeof completion.usage?.total_tokens === 'number' ? completion.usage.total_tokens : null,
    };

    return {
      text,
      model: completion.model || request.model,
      usage,
    };
  }
}
