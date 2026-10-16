export type ExecutionStatus = 
  | 'COMPLETED'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'MEMORY_LIMIT'
  | 'OUTPUT_LIMIT'
  | 'PROCESS_LIMIT'
  | 'SANDBOX_ERROR'
  | 'SANDBOX_UNAVAILABLE'
  | 'UNSUPPORTED_LANGUAGE'
  | 'EXECUTION_ERROR';

export interface ExecutionResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number | null;
  memoryUsedBytes: number | null;
}

export interface ExecutionRequest {
  language: string;
  sourceCode: string;
  stdin?: string;
}

export interface LanguageCapability {
  language: string;
  displayName: string;
  executionSupported: boolean;
  reason?: string;
}
