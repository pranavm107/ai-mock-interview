export type AITask =
  | 'RESUME_ANALYSIS'
  | 'SMART_SETUP'
  | 'INTERVIEW_QUESTIONS_LEGACY'
  | 'REPORT_QUESTION_EVALUATION'
  | 'REPORT_RECOMMENDATIONS'
  | 'REPORT_SUMMARY'
  | (string & {});

export type OutputMode = 'text' | 'json';

export interface TokenUsage {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

export interface TaskConfig {
  defaultProvider: string;
  defaultModel: string;
  fallbackModels?: string[];
  fallbackProvider?: string;
  fallbackProviderModel?: string;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
  outputMode: OutputMode;
  temperature?: number;
  cacheable?: boolean;
  cacheTtlMs?: number;
  cacheScope?: 'USER' | 'GLOBAL';
  promptVersion?: string;
}

export interface AIGatewayRequest<T = any> {
  task: AITask;
  prompt: string;
  systemPrompt?: string;
  userId?: string | null;
  outputMode?: OutputMode;
  maxTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
  temperature?: number;
  model?: string;
  provider?: string;
  fallbackProvider?: string;
  fallbackProviderModel?: string;
  validator?: (parsed: any) => T;
  signal?: AbortSignal;
  bypassCache?: boolean;
  cacheScope?: 'USER' | 'GLOBAL';
  promptVersion?: string;
}

export interface AIGatewayResponse<T = any> {
  data: T;
  rawText: string;
  provider: string;
  model: string;
  usage: TokenUsage;
  durationMs: number;
  attempts: number;
  fallbackUsed: boolean;
  cached?: boolean;
}

export interface TelemetryEvent {
  timestamp: string;
  userId: string;
  task: string;
  provider: string;
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR';
  attemptCount: number;
  fallbackUsed: boolean;
  errorCategory: string | null;
  cacheHit?: boolean;
}
