export type TestCaseResultStatus =
  | "PASSED"
  | "FAILED"
  | "RUNTIME_ERROR"
  | "TIMEOUT"
  | "MEMORY_LIMIT_EXCEEDED"
  | "OUTPUT_LIMIT_EXCEEDED"
  | "EXECUTION_ERROR";

export type SubmissionStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "RUNTIME_ERROR"
  | "TIMEOUT"
  | "MEMORY_LIMIT_EXCEEDED"
  | "OUTPUT_LIMIT_EXCEEDED"
  | "EXECUTION_ERROR";

export interface TestCaseResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  executionTimeMs: number | null;
  actualOutput?: string;
  expectedOutput?: string;
  input?: string;
  error?: string;
  isHidden: boolean;
}

export interface SubmissionResult {
  status: SubmissionStatus;
  passedTests: number;
  totalTests: number;
  score: number;
  executionTimeMs: number;
  language: string;
  testResults: TestCaseResult[];
}
