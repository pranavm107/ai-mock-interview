import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AICache } from '../../../src/services/ai/aiCache';
import { aiGateway } from '../../../src/services/ai/aiGateway';
import { setSharedGroqClient } from '../../../src/services/ai/providers/groqAdapter';
import { aiAnalysisService } from '../../../src/services/coding/aiAnalysisService';
import { evaluateAnswerAndGenerateFollowUp } from '../../../src/services/adaptive/followUpEngine';
import { extractEntities } from '../../../src/services/adaptive/conversationMemory';
import { db } from '../../../src/config/firebaseAdmin';

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Firebase Admin
vi.mock('../../../src/config/firebaseAdmin', () => ({
  db: {
    collection: vi.fn(() => ({
      add: vi.fn().mockResolvedValue({ id: 'mock-usage-id' }),
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            id: 'prob-1',
            title: 'Reverse String',
            description: 'Reverse the input string.',
          }),
        }),
      })),
    })),
  },
}));

describe('Step 5: AI Cache and Optimization Tests', () => {
  let cache: AICache;
  let mockGroqCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new AICache(5, 1000); // Max 5 entries, 1000ms TTL for testing
    AICache.setInstance(cache);

    process.env.GROQ_API_KEY = 'gsk_mock_test_key';
    delete process.env.OPENAI_API_KEY;

    mockGroqCreate = vi.fn();
    const mockGroqInstance = {
      chat: {
        completions: {
          create: mockGroqCreate,
        },
      },
    };
    setSharedGroqClient(mockGroqInstance as any);
  });

  afterEach(() => {
    cache.clear();
    setSharedGroqClient(null);
  });

  // 1. Basic Cache Key Generation & No PII
  it('1. should generate deterministic, secure cache keys without raw prompt or PII', () => {
    const rawPrompt = 'Candidate resume with sensitive info: John Doe, SSN 123-45-6789, secret password';
    const key1 = cache.generateKey('SMART_SETUP', rawPrompt, { promptVersion: 'v1.0', userId: 'user-123', cacheScope: 'USER' });
    const key2 = cache.generateKey('SMART_SETUP', rawPrompt, { promptVersion: 'v1.0', userId: 'user-123', cacheScope: 'USER' });

    expect(key1).toBe(key2);
    expect(key1).not.toContain('John Doe');
    expect(key1).not.toContain('SSN');
    expect(key1).not.toContain('password');
    expect(key1.startsWith('aicache:SMART_SETUP:v1.0:user-123:')).toBe(true);
  });

  // 2. User Isolation
  it('2. should isolate cache keys across different users for user-scoped tasks', () => {
    const prompt = 'Identical resume text for both users';
    const userAKey = cache.generateKey('SMART_SETUP', prompt, { promptVersion: 'v1.0', userId: 'user-A', cacheScope: 'USER' });
    const userBKey = cache.generateKey('SMART_SETUP', prompt, { promptVersion: 'v1.0', userId: 'user-B', cacheScope: 'USER' });

    expect(userAKey).not.toBe(userBKey);
    expect(userAKey).toContain('user-A');
    expect(userBKey).toContain('user-B');

    // Storing data for user A cannot be retrieved by user B
    cache.set(userAKey, {
      data: { role: 'Backend' },
      rawText: '{"role":"Backend"}',
      provider: 'groq',
      model: 'openai/gpt-oss-120b',
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    });

    expect(cache.get(userAKey)?.data).toEqual({ role: 'Backend' });
    expect(cache.get(userBKey)).toBeNull();
  });

  // 3. Gateway Cache Hit & Miss Flow
  it('3. should return cached result on hit without calling primary LLM provider', async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ role: 'DevOps Engineer', company: 'Acme', experienceLevel: 'Senior', recommendedInterviewType: 'Technical', recommendedDifficulty: 'Hard', recommendedQuestionCount: 5, skills: ['Docker', 'K8s'], focusAreas: ['CI/CD'], reasoning: 'Solid experience', confidence: 'High' }) } }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 30, completion_tokens: 20, total_tokens: 50 },
    });

    // First call: Cache miss -> calls provider
    const res1 = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Analyze DevOps resume',
      userId: 'user-devops',
    });

    expect(res1.data.role).toBe('DevOps Engineer');
    expect(res1.cached).toBe(false);
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);

    // Second call with identical input & user: Cache hit -> 0 provider calls!
    const res2 = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Analyze DevOps resume',
      userId: 'user-devops',
    });

    expect(res2.data.role).toBe('DevOps Engineer');
    expect(res2.cached).toBe(true);
    expect(res2.attempts).toBe(0);
    // mockGroqCreate must NOT have been called again!
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);
  });

  // 4. Cache Bypass Behavior
  it('4. should bypass cache and fetch fresh from provider when bypassCache is true', async () => {
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ role: 'Frontend Engineer', company: 'Google', experienceLevel: 'Mid', recommendedInterviewType: 'Technical', recommendedDifficulty: 'Medium', recommendedQuestionCount: 5, skills: ['React'], focusAreas: ['CSS'], reasoning: 'Great skills', confidence: 'High' }) } }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 20, completion_tokens: 15, total_tokens: 35 },
    });

    // Seed cache
    await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Analyze Frontend resume',
      userId: 'user-frontend',
    });
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);

    // Call with bypassCache: true
    const resBypass = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Analyze Frontend resume',
      userId: 'user-frontend',
      bypassCache: true,
    });

    expect(resBypass.cached).toBe(false);
    expect(mockGroqCreate).toHaveBeenCalledTimes(2);
  });

  // 5. Model/Prompt Version Invalidation
  it('5. should invalidate cache when promptVersion or model changes', async () => {
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ role: 'QA Lead', company: 'Meta', experienceLevel: 'Lead', recommendedInterviewType: 'Technical', recommendedDifficulty: 'Hard', recommendedQuestionCount: 5, skills: ['Jest'], focusAreas: ['Testing'], reasoning: 'QA expert', confidence: 'High' }) } }],
      model: 'openai/gpt-oss-120b',
      usage: null,
    });

    await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'QA Profile',
      userId: 'user-qa',
      promptVersion: 'v1.0',
    });
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);

    // Version bumped to v1.1 -> Cache Miss
    await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'QA Profile',
      userId: 'user-qa',
      promptVersion: 'v1.1',
    });
    expect(mockGroqCreate).toHaveBeenCalledTimes(2);

    // Model changed -> Cache Miss
    await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'QA Profile',
      userId: 'user-qa',
      model: 'qwen/qwen3.8-27b',
    });
    expect(mockGroqCreate).toHaveBeenCalledTimes(3);
  });

  // 6. Request Coalescing (Single-Flight Deduplication)
  it('6. should coalesce concurrent identical in-flight requests to a single provider call', async () => {
    let resolveProviderCall: any;
    const providerPromise = new Promise((resolve) => {
      resolveProviderCall = resolve;
    });

    mockGroqCreate.mockImplementation(() => providerPromise);

    // Fire 3 identical requests simultaneously
    const req1 = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Concurrent duplicate prompt',
      userId: 'user-concurrent',
    });
    const req2 = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Concurrent duplicate prompt',
      userId: 'user-concurrent',
    });
    const req3 = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Concurrent duplicate prompt',
      userId: 'user-concurrent',
    });

    // Resolve the single provider call
    resolveProviderCall({
      choices: [{ message: { content: JSON.stringify({ role: 'Coalesced Role', company: 'TestCorp', experienceLevel: 'Mid', recommendedInterviewType: 'Technical', recommendedDifficulty: 'Medium', recommendedQuestionCount: 5, skills: ['TS'], focusAreas: ['Testing'], reasoning: 'Good', confidence: 'High' }) } }],
      model: 'openai/gpt-oss-120b',
      usage: null,
    });

    const [res1, res2, res3] = await Promise.all([req1, req2, req3]);

    expect(res1.data.role).toBe('Coalesced Role');
    expect(res2.data.role).toBe('Coalesced Role');
    expect(res3.data.role).toBe('Coalesced Role');

    // Strictly ONE physical Groq call was made across all 3 concurrent requests!
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);
    expect(cache.getStats().coalesced).toBeGreaterThanOrEqual(1);
  });

  // 7. Bounded LRU Eviction
  it('7. should evict least-recently-used entry when cache exceeds maxEntries', () => {
    const smallCache = new AICache(2, 60000); // capacity 2
    smallCache.set('key1', { data: 'val1', rawText: 'val1', provider: 'groq', model: 'm', usage: {} });
    smallCache.set('key2', { data: 'val2', rawText: 'val2', provider: 'groq', model: 'm', usage: {} });

    expect(smallCache.get('key1')?.data).toBe('val1'); // access key1 (key2 is now LRU)

    // Insert key3 -> should evict key2
    smallCache.set('key3', { data: 'val3', rawText: 'val3', provider: 'groq', model: 'm', usage: {} });

    expect(smallCache.get('key1')?.data).toBe('val1');
    expect(smallCache.get('key2')).toBeNull(); // Evicted!
    expect(smallCache.get('key3')?.data).toBe('val3');
    expect(smallCache.getStats().evictions).toBe(1);
  });

  // 8. TTL Expiry
  it('8. should expire entries after TTL elapsed', async () => {
    const ttlCache = new AICache(5, 50); // 50ms TTL
    ttlCache.set('ttlKey', { data: 'ttlData', rawText: '', provider: 'groq', model: 'm', usage: {} });

    expect(ttlCache.get('ttlKey')?.data).toBe('ttlData');

    // Wait 60ms
    await new Promise((r) => setTimeout(r, 60));

    expect(ttlCache.get('ttlKey')).toBeNull();
  });

  // 9. Coding Analysis In-Memory Caching
  it('9. should reuse cached analysis for identical code submissions in AiAnalysisService', async () => {
    aiAnalysisService.clearCache();

    const mockGenerateJson = vi.spyOn(await import('../../../src/services/ai/groqClient'), 'generateJson')
      .mockResolvedValue(JSON.stringify({
        explanation: 'Reverses a string using slicing',
        correctnessIssues: [],
        complexity: { time: 'O(N)', space: 'O(N)', reasoning: 'Creates new string' },
        readability: 'Clean and idiomatic',
        suggestions: [],
      }));

    const code = 'def reverse(s): return s[::-1]';

    // First call: invokes LLM
    const res1 = await aiAnalysisService.analyzeCode('user-c1', 'prob-1', code, 'python');
    expect(res1.explanation).toBe('Reverses a string using slicing');
    expect(mockGenerateJson).toHaveBeenCalledTimes(1);

    // Second call with identical code: cached, 0 LLM calls!
    const res2 = await aiAnalysisService.analyzeCode('user-c1', 'prob-1', code, 'python');
    expect(res2.explanation).toBe('Reverses a string using slicing');
    expect(mockGenerateJson).toHaveBeenCalledTimes(1);

    // Call with modified code: cache miss, calls LLM
    const modifiedCode = 'def reverse(s): return "".join(reversed(s))';
    const res3 = await aiAnalysisService.analyzeCode('user-c1', 'prob-1', modifiedCode, 'python');
    expect(res3.explanation).toBe('Reverses a string using slicing');
    expect(mockGenerateJson).toHaveBeenCalledTimes(2);
  });

  // 10. Adaptive Follow-Up Deterministic Bypass on Empty Answer
  it('10. should deterministically skip LLM call when candidate answer is empty in followUpEngine', async () => {
    const mockGenerateText = vi.spyOn(await import('../../../src/services/ai/groqClient'), 'generateText')
      .mockResolvedValue('{"shouldGenerate": true, "question": "dummy"}');

    const result = await evaluateAnswerAndGenerateFollowUp({
      memory: {
        id: 'mem-1',
        sessionId: 'sess-1',
        projectsMentioned: [],
        skillsMentioned: [],
        achievements: [],
        leadershipExamples: [],
        conflictResolutionExamples: [],
        failuresDiscussed: [],
        successStories: [],
        weakAreas: [],
        strongAreas: [],
        currentDifficulty: 'Medium',
        currentConfidence: 50,
        confidenceHistory: [],
        questionHistory: [],
        answerHistory: [],
        followUpHistory: [],
        topicsCovered: [],
        topicsRemaining: [],
        aiNotes: [],
        createdAt: '',
        updatedAt: '',
      },
      currentQuestion: 'Explain event loops.',
      candidateAnswer: '   ', // Empty/whitespace answer
      currentDifficulty: 'Medium',
      currentPersonality: 'Friendly',
    });

    expect(result.followUp.shouldGenerate).toBe(false);
    expect(result.followUp.score).toBe(0);
    expect(result.followUp.reason).toBe('Candidate provided no answer');
    // generateText was NOT called!
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  // 11. Conversation Memory Deterministic Entity Extraction Bypass
  it('11. should deterministically skip entity extraction LLM call for trivial/short answers', async () => {
    const mockGenerateText = vi.spyOn(await import('../../../src/services/ai/groqClient'), 'generateText');

    const emptyResult = await extractEntities('Question', 'No'); // 2 characters
    expect(emptyResult).toEqual({});
    expect(mockGenerateText).not.toHaveBeenCalled();

    const shortResult = await extractEntities('Question', 'I do not know'); // 13 characters (< 15)
    expect(shortResult).toEqual({});
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  // 12. Caller Abort in Coalescing: Caller A aborting does NOT cancel in-flight request for Caller B
  it('12. should not cancel shared provider request for other callers when one caller aborts', async () => {
    let resolveProviderCall: any;
    const providerPromise = new Promise((resolve) => {
      resolveProviderCall = resolve;
    });

    mockGroqCreate.mockImplementation(() => providerPromise);

    const abortControllerA = new AbortController();

    const reqA = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Coalesce cancellation prompt',
      userId: 'user-shared-cancel',
      signal: abortControllerA.signal,
    });

    const reqB = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Coalesce cancellation prompt',
      userId: 'user-shared-cancel',
    });

    // Caller A aborts
    abortControllerA.abort();

    // Caller A rejects immediately with cancellation error
    await expect(reqA).rejects.toThrow('Request was cancelled');

    // Provider now finishes successfully
    resolveProviderCall({
      choices: [{ message: { content: JSON.stringify({ role: 'Surviving Role', company: 'TestCorp', experienceLevel: 'Mid', recommendedInterviewType: 'Technical', recommendedDifficulty: 'Medium', recommendedQuestionCount: 5, skills: ['TS'], focusAreas: ['Testing'], reasoning: 'Good', confidence: 'High' }) } }],
      model: 'openai/gpt-oss-120b',
      usage: null,
    });

    // Caller B still succeeds!
    const resB = await reqB;
    expect(resB.data.role).toBe('Surviving Role');
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);
  });

  // 13. All Callers Aborting in Coalescing Triggers Provider Abort
  it('13. should abort underlying provider request when all waiting callers abort', async () => {
    let providerReceivedSignal: AbortSignal | null = null;

    mockGroqCreate.mockImplementation((_params: any, options: any) => {
      providerReceivedSignal = options?.signal;
      return new Promise((_, reject) => {
        options?.signal?.addEventListener('abort', () => {
          const err: any = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const abortA = new AbortController();
    const abortB = new AbortController();

    const reqA = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'All abort prompt',
      userId: 'user-all-abort',
      signal: abortA.signal,
    });

    const reqB = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'All abort prompt',
      userId: 'user-all-abort',
      signal: abortB.signal,
    });

    // Both abort
    abortA.abort();
    abortB.abort();

    await expect(reqA).rejects.toThrow('Request was cancelled');
    await expect(reqB).rejects.toThrow('Request was cancelled');

    // The shared provider abort signal was triggered
    expect(providerReceivedSignal?.aborted).toBe(true);
  });

  // 14. Failed Provider Request: Never Cached and In-flight Map Cleaned Up
  it('14. should not cache failed provider response and clean in-flight tracker', async () => {
    mockGroqCreate.mockRejectedValue(new Error('500 Server Error'));

    await expect(
      aiGateway.executeStructured({
        task: 'SMART_SETUP',
        prompt: 'Error prompt',
        userId: 'user-error',
        maxRetries: 0,
      })
    ).rejects.toThrow();

    const key = cache.generateKey('SMART_SETUP', 'Error prompt', { userId: 'user-error', cacheScope: 'USER' });
    expect(cache.get(key)).toBeNull();
    expect(cache.hasInFlight(key)).toBe(false);
  });

  // 15. Coding Analysis Cache Isolation & Invalidation
  it('15. should isolate coding analysis cache by problem, language, code hash, and version', async () => {
    aiAnalysisService.clearCache();
    const mockGenerateJson = vi.spyOn(await import('../../../src/services/ai/groqClient'), 'generateJson');
    mockGenerateJson.mockResolvedValue(JSON.stringify({
      explanation: 'Code explanation',
      correctnessIssues: [],
      complexity: { time: 'O(1)', space: 'O(1)', reasoning: 'Test' },
      readability: 'Good',
      suggestions: [],
    }));

    // Call 1
    const res1 = await aiAnalysisService.analyzeCode('u1', 'p1', 'code_v1', 'python');
    expect(mockGenerateJson).toHaveBeenCalledTimes(1);

    // Call 2: identical -> cache hit
    const res2 = await aiAnalysisService.analyzeCode('u1', 'p1', 'code_v1', 'python');
    expect(res2).toEqual(res1);
    expect(mockGenerateJson).toHaveBeenCalledTimes(1);

    // Call 3: different user -> cache miss
    await aiAnalysisService.analyzeCode('u2', 'p1', 'code_v1', 'python');
    expect(mockGenerateJson).toHaveBeenCalledTimes(2);

    // Call 4: different language -> cache miss
    await aiAnalysisService.analyzeCode('u1', 'p1', 'code_v1', 'javascript');
    expect(mockGenerateJson).toHaveBeenCalledTimes(3);

    // Call 5: different problem -> cache miss
    await aiAnalysisService.analyzeCode('u1', 'p2', 'code_v1', 'python');
    expect(mockGenerateJson).toHaveBeenCalledTimes(4);
  });
});
