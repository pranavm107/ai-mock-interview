import { db } from '../../config/firebaseAdmin';
import { executionService } from './executionService';
import { CodingProblem, CodingTestCase } from '../../types/coding';
import { ExecutionResult } from '../../types/execution';
import { FieldValue } from 'firebase-admin/firestore';

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

export class EvaluationService {
  private normalizeOutput(output: string): string {
    return output.replace(/\r\n/g, '\n').trimEnd();
  }

  private mapExecutionStatusToTestStatus(status: string): TestCaseResultStatus | null {
    switch (status) {
      case 'TIMEOUT': return 'TIMEOUT';
      case 'MEMORY_LIMIT': return 'MEMORY_LIMIT_EXCEEDED';
      case 'OUTPUT_LIMIT': return 'OUTPUT_LIMIT_EXCEEDED';
      case 'RUNTIME_ERROR': return 'RUNTIME_ERROR';
      case 'COMPILE_ERROR': return 'EXECUTION_ERROR'; // Syntax error is execution error for scoring purposes
      case 'SANDBOX_ERROR': return 'EXECUTION_ERROR';
      case 'SANDBOX_UNAVAILABLE': return 'EXECUTION_ERROR';
      case 'UNSUPPORTED_LANGUAGE': return 'EXECUTION_ERROR';
      default: return null;
    }
  }

  public async evaluate(
    userId: string,
    problemSlug: string,
    source: string,
    language: string,
    isSubmission: boolean
  ): Promise<SubmissionResult> {
    const problemSnapshot = await db.collection('codingProblems').doc(problemSlug).get();
    if (!problemSnapshot.exists) {
      throw new Error('Problem not found');
    }

    const problem = problemSnapshot.data() as CodingProblem;
    let testCases = problem.testCases || [];

    if (!isSubmission) {
      // For "Run Tests", only evaluate public test cases
      testCases = testCases.filter(tc => !tc.isHidden);
    }

    if (testCases.length === 0) {
      throw new Error('No test cases found for this problem');
    }

    const testResults: TestCaseResult[] = [];
    let passedCount = 0;
    let totalTime = 0;
    let overallStatus: SubmissionStatus = 'ACCEPTED';

    for (const testCase of testCases) {
      const execResult = await executionService.execute(userId, {
        language,
        sourceCode: source,
        stdin: testCase.input
      });

      const execErrorStatus = this.mapExecutionStatusToTestStatus(execResult.status);
      
      let testStatus: TestCaseResultStatus;
      let actual = this.normalizeOutput(execResult.stdout || '');
      const expected = this.normalizeOutput(testCase.expectedOutput || '');

      if (execErrorStatus) {
        testStatus = execErrorStatus;
      } else {
        if (actual === expected) {
          testStatus = 'PASSED';
          passedCount++;
        } else {
          testStatus = 'FAILED';
        }
      }

      totalTime += (execResult.executionTimeMs || 0);

      // Determine overall status precedence
      if (testStatus !== 'PASSED') {
        if (overallStatus === 'ACCEPTED') {
          // First error defines the overall status (or WRONG_ANSWER)
          if (testStatus === 'FAILED') {
            overallStatus = 'WRONG_ANSWER';
          } else {
            overallStatus = testStatus as SubmissionStatus;
          }
        } else if (overallStatus === 'WRONG_ANSWER' && testStatus !== 'FAILED') {
          // Execution errors have higher precedence than simple WRONG_ANSWER
          overallStatus = testStatus as SubmissionStatus;
        }
      }

      const isHidden = testCase.isHidden;
      
      const resultData: TestCaseResult = {
        testCaseId: testCase.id,
        status: testStatus,
        executionTimeMs: execResult.executionTimeMs,
        isHidden
      };

      // Only include sensitive data if not hidden
      if (!isHidden) {
        resultData.input = testCase.input;
        resultData.expectedOutput = testCase.expectedOutput;
        resultData.actualOutput = actual;
        if (execResult.stderr) {
          resultData.error = execResult.stderr;
        }
      } else {
        // Even for hidden, we might return the error string for runtime errors without exposing input/output
        if (execResult.stderr) {
           // Provide basic error string but NO expected/input output
           resultData.error = execResult.stderr;
        }
      }

      testResults.push(resultData);

      if (isSubmission && testStatus !== 'PASSED') {
        // Optional: Stop early on first failure? 
        // The prompt says "Stop early on the first failure if appropriate, OR document and consistently implement full evaluation."
        // We will implement full evaluation to show all test results to the user (the ones that are public anyway).
      }
    }

    const score = Math.round((passedCount / testCases.length) * 100);

    const submissionResult: SubmissionResult = {
      status: overallStatus,
      passedTests: passedCount,
      totalTests: testCases.length,
      score,
      executionTimeMs: totalTime,
      language,
      testResults
    };

    if (isSubmission) {
      await db.collection('codingSubmissions').add({
        userId,
        problemId: problem.id || problemSlug,
        problemSlug,
        language,
        status: overallStatus,
        score,
        passedTests: passedCount,
        totalTests: testCases.length,
        executionTimeMs: totalTime,
        submittedAt: FieldValue.serverTimestamp()
      });
    }

    return submissionResult;
  }
}

export const evaluationService = new EvaluationService();
