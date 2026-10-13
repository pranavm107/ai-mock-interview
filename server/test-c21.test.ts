import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from './src/config/firebaseAdmin';
import { evaluationService } from './src/services/coding/evaluationService';
import { executionService } from './src/services/coding/executionService';

describe('C21 Coding Result Tests', () => {
  const userId = 'test-user-c21';
  const problemSlug = 'c21-dummy-problem';

  beforeEach(async () => {
    // Setup dummy problem with 2 public tests and 1 hidden test
    await db.collection('codingProblems').doc(problemSlug).set({
      id: 'dummy21',
      slug: problemSlug,
      title: 'Dummy Title 21',
      description: 'Dummy description 21.',
      testCases: [
        { id: 'tc1', input: '1', expectedOutput: '1', isHidden: false },
        { id: 'tc2', input: '2', expectedOutput: '2', isHidden: false },
        { id: 'tc3', input: '3', expectedOutput: '3', isHidden: true }
      ]
    });
    vi.clearAllMocks();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('Test 1 - SUBMIT evaluates all tests and returns metrics securely', async () => {
    vi.spyOn(executionService, 'execute').mockImplementation(async (uid, req) => {
      // Simulate success for 1, 2, 3
      return {
        status: 'SUCCESS',
        stdout: req.stdin + '\n', // Returns exactly what was expected
        stderr: '',
        executionTimeMs: 15
      };
    });

    const result = await evaluationService.evaluate(userId, problemSlug, 'print(input)', 'python', true);
    
    // Final result checks
    expect(result.status).toBe('ACCEPTED');
    expect(result.passedTests).toBe(3);
    expect(result.totalTests).toBe(3);
    expect(result.score).toBe(100);
    expect(result.executionTimeMs).toBe(45); // 3 * 15ms

    // Check hidden test data omission
    const hiddenResult = result.testResults.find(t => t.testCaseId === 'tc3');
    expect(hiddenResult).toBeDefined();
    expect(hiddenResult!.isHidden).toBe(true);
    expect(hiddenResult!.input).toBeUndefined(); // Hidden input omitted
    expect(hiddenResult!.expectedOutput).toBeUndefined(); // Hidden expected output omitted
    expect(hiddenResult!.actualOutput).toBeUndefined(); // Hidden actual output omitted
  });

  it('Test 2 - RUN_TESTS evaluates only public tests', async () => {
    vi.spyOn(executionService, 'execute').mockImplementation(async (uid, req) => {
      if (req.stdin === '1') {
        return { status: 'SUCCESS', stdout: '1\n', stderr: '', executionTimeMs: 10 };
      }
      return { status: 'SUCCESS', stdout: 'Wrong', stderr: '', executionTimeMs: 10 };
    });

    const result = await evaluationService.evaluate(userId, problemSlug, 'print(input)', 'python', false);
    
    expect(result.status).toBe('WRONG_ANSWER');
    expect(result.passedTests).toBe(1);
    expect(result.totalTests).toBe(2); // Only public tests (2 out of 3 total)
    expect(result.score).toBe(50);
    expect(result.executionTimeMs).toBe(20);

    const hiddenResult = result.testResults.find(t => t.testCaseId === 'tc3');
    expect(hiddenResult).toBeUndefined(); // Hidden test completely omitted
  });

  it('Test 3 - Evaluation handles runtime errors without leaking hidden answers', async () => {
    vi.spyOn(executionService, 'execute').mockResolvedValue({
      status: 'RUNTIME_ERROR',
      stdout: '',
      stderr: 'ZeroDivisionError: division by zero',
      executionTimeMs: 5
    });

    const result = await evaluationService.evaluate(userId, problemSlug, 'print(1/0)', 'python', true);
    
    expect(result.status).toBe('RUNTIME_ERROR');
    expect(result.passedTests).toBe(0);
    expect(result.score).toBe(0);

    const publicResult = result.testResults.find(t => t.testCaseId === 'tc1');
    expect(publicResult!.input).toBe('1');
    expect(publicResult!.error).toContain('ZeroDivisionError');

    const hiddenResult = result.testResults.find(t => t.testCaseId === 'tc3');
    expect(hiddenResult!.input).toBeUndefined(); // Cannot see input
    expect(hiddenResult!.error).toBe('A runtime error occurred during this hidden test case.'); // CANNOT see the raw error trace anymore
  });
});
