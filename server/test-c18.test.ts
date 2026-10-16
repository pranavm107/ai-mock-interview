import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { submitCode } from './src/controllers/executionController';
import { executionService } from './src/services/coding/executionService';
import { integrityService } from './src/services/coding/integrityService';
import { db } from './src/config/firebaseAdmin';

// Mock getAuth 
vi.mock('@clerk/express', () => ({
  getAuth: (req: any) => ({ userId: req.headers.authorization ? req.headers.authorization.split(' ')[1] : null })
}));

describe('C18 Submission Security Tests', () => {
  const userId = 'user-c18-1';
  const hackerId = 'user-c18-hacker';
  const problemId = 'c18-problem';
  const language = 'python';
  let sessionId = '';

  beforeAll(async () => {
    // Setup an integrity session
    const session = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    sessionId = session.sessionId;
  });

  afterAll(async () => {
    // Cleanup
    await integrityService.endSession(sessionId, userId).catch(() => {});
  });

  it('Test 1 - Unauthenticated request', async () => {
    const req: any = { headers: {}, body: {} };
    const res: any = { 
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    await submitCode(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('Test 2 - Cross-user session access', async () => {
    const req: any = { 
      headers: { authorization: `Bearer ${hackerId}` }, 
      body: { problemSlug: problemId, source: 'print("hi")', language, sessionId } 
    };
    const res: any = { 
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    await submitCode(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('Test 3 - Submission after session termination', async () => {
    // Terminate session manually
    await db.collection('codingIntegritySessions').doc(sessionId).update({ status: 'TERMINATED' });
    
    const req: any = { 
      headers: { authorization: `Bearer ${userId}` }, 
      body: { problemSlug: problemId, source: 'print("hi")', language, sessionId } 
    };
    const res: any = { 
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    await submitCode(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('Test 4 - Oversized payload rejection', async () => {
    const hugeSource = 'a'.repeat(300 * 1024); // 300KB
    await expect(executionService.execute(userId, { language: 'python', sourceCode: hugeSource }))
      .rejects.toThrow('exceeds maximum allowed size');
  });

  it('Test 5 - Concurrent duplicate execution', async () => {
    const t5User = 'user-c18-t5';
    const validSource = 'print("hello")';
    const p1 = executionService.execute(t5User, { language: 'python', sourceCode: validSource });
    const p2 = executionService.execute(t5User, { language: 'python', sourceCode: validSource });
    
    let caughtConcurrent = false;
    try {
      await Promise.all([p1, p2]);
    } catch(e: any) {
      if (e.message.includes('CONCURRENT_EXECUTION')) {
        caughtConcurrent = true;
      }
    }
    
    expect(caughtConcurrent).toBe(true);
  });

  it('Test 6 - Concurrent evaluation', async () => {
    const t6User = 'user-c18-t6';
    const validSource = 'print("hello")';
    // Create a dummy problem for evaluation
    await db.collection('codingProblems').doc('dummy-problem').set({
      id: 'dummy-problem',
      title: 'Dummy',
      testCases: [{ id: 'tc1', input: '1', expectedOutput: '1', isHidden: false }]
    });

    // We only test concurrency handling here, not actual evaluation logic, so we can expect one to fail
    const { evaluationService } = await import('./src/services/coding/evaluationService');
    const p1 = evaluationService.evaluate(t6User, 'dummy-problem', validSource, 'python', true);
    const p2 = evaluationService.evaluate(t6User, 'dummy-problem', validSource, 'python', true);

    let caughtConcurrent = false;
    try {
      await Promise.all([p1, p2]);
    } catch(e: any) {
      if (e.message.includes('CONCURRENT_EVALUATION')) {
        caughtConcurrent = true;
      }
    }
    
    expect(caughtConcurrent).toBe(true);
  });

  it('Test 7 - Late session termination race condition', async () => {
    const t7User = 'user-c18-t7';
    // Setup a new integrity session
    const session = await integrityService.createSession(t7User, problemId, language, 'INTEGRITY');
    const tempSessionId = session.sessionId;

    // Create a dummy problem
    await db.collection('codingProblems').doc('dummy-problem-2').set({
      id: 'dummy-problem-2',
      title: 'Dummy',
      testCases: [{ id: 'tc1', input: '1', expectedOutput: '1', isHidden: false }]
    });

    const { evaluationService } = await import('./src/services/coding/evaluationService');
    
    // We will start evaluation but mock executionService to delay it, then terminate the session
    const originalExecute = executionService.execute.bind(executionService);
    executionService.execute = async (...args) => {
      // Terminate the session WHILE execution is running
      await db.collection('codingIntegritySessions').doc(tempSessionId).update({ status: 'TERMINATED' });
      return originalExecute(...args);
    };

    try {
      await expect(
        evaluationService.evaluate(t7User, 'dummy-problem-2', 'print("hi")', 'python', true, tempSessionId)
      ).rejects.toThrow('terminated during evaluation');
    } finally {
      // Restore the mock
      executionService.execute = originalExecute;
      // Cleanup
      await integrityService.endSession(tempSessionId, t7User).catch(() => {});
    }
  });
});
