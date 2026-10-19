import { OutputMode, TokenUsage } from '../types';

export interface ProviderRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens: number;
  temperature: number;
  outputMode: OutputMode;
  signal?: AbortSignal;
}

export interface ProviderResponse {
  text: string;
  model: string;
  usage: TokenUsage;
}

export interface LLMProvider {
  readonly name: string;
  complete(request: ProviderRequest): Promise<ProviderResponse>;
  isConfigured?(): boolean;
}
