import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIGateway, aiGateway } from '../../../src/services/ai/aiGateway';
import { ConcurrencyController } from '../../../src/services/ai/concurrencyController';
import { TaskBudgetManager } from '../../../src/services/ai/budgetManager';
import { setSharedGroqClient } from '../../../src/services/ai/providers/groqAdapter';
import { setOpenAIFetch } from '../../../src/services/ai/providers/openaiAdapter';
import { AITelemetryService } from '../../../src/services/ai/aiTelemetryService';
import { AICache } from '../../../src/services/ai/aiCache';
import {
  AIError,
  AIOverloadError,
  AIBudgetExceededError,
  InvalidApiKeyError,
  QuotaExceededError,
  TransientAIError,
} from '../../../src/errors/aiErrors';
import { GroqTimeoutError } from '../../../src/types/careerErrors';

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

// Mock Firebase Admin so tests never touch real credentials or network
vi.mock('../../../src/config/firebaseAdmin', () => ({
  db: {
    collection: vi.fn(() => ({
      add: vi.fn().mockResolvedValue({ id: 'mock-resilience-id' }),
    })),
  },
}));

describe('Step 7: AI Gateway Resilience & Failure Simulation', () => {
  let mockGroqCreate: ReturnType<typeof vi.fn>;
  let mockOpenAIFetch: ReturnType<typeof vi.fn>;

  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GROQ_API_KEY = 'gsk_mock_resilience_key';
    delete process.env.OPENAI_API_KEY;
    setOpenAIFetch(null);

    mockGroqCreate = vi.fn();
    const mockGroqInstance = {
      chat: {
        completions: {
          create: mockGroqCreate,
        },
      },
    };
    setSharedGroqClient(mockGroqInstance as any);

    mockOpenAIFetch = vi.fn();
    setOpenAIFetch(mockOpenAIFetch as any);

    // Clean controllers and cache
    aiGateway.setConcurrencyController(new ConcurrencyController({
      globalMaxConcurrent: 5,
      userMaxConcurrent: 3,
      queueMaxSize: 5,
      queueTimeoutMs: 1000,
    }));
    aiGateway.setBudgetManager(new TaskBudgetManager());
    AICache.getInstance().clear();
  });

  afterEach(() => {
    setSharedGroqClient(null);
    setOpenAIFetch(null);
    process.env = { ...originalEnv };
    AICache.getInstance().clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // 1. Groq primary succeeds — OpenAI fallback is not called
  it('Scenario 1: Groq primary succeeds — OpenAI fallback is not called', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    mockGroqCreate.mockResolvedValueOnce({
      id: 'groq-success',
      choices: [{ message: { content: '{"status":"groq_ok"}' } }],
      usage: { prompt_tokens: 100, completion_tokens: 30, total_tokens: 130 },
    });

    const res = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Primary success test',
      userId: 'user-s1',
    });

    expect(res.data.status).toBe('groq_ok');
    expect(res.provider).toBe('groq');
    expect(res.fallbackUsed).toBe(false);
    expect(mockOpenAIFetch).not.toHaveBeenCalled();
  });

  // 2. Groq transient 5xx/network error — bounded retry/fallback behaves as configured
  it('Scenario 2: Groq transient 5xx/network error — bounded retry/fallback behaves as configured', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    // Groq fails with transient 503 twice (initial attempt + 1 retry = 2 total primary attempts)
    mockGroqCreate
      .mockRejectedValueOnce({ status: 503, message: 'Groq Unavailable' })
      .mockRejectedValueOnce({ status: 503, message: 'Groq Unavailable' });

    // OpenAI fallback succeeds
    mockOpenAIFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"status":"openai_recovered"}' } }],
        usage: { prompt_tokens: 120, completion_tokens: 40, total_tokens: 160 },
      }),
    });

    const res = await aiGateway.executeStructured({
      task: 'CODE_EVALUATION',
      prompt: 'Transient error fallback test',
      userId: 'user-s2',
      maxRetries: 1, // 2 primary attempts max
    });

    expect(res.data.status).toBe('openai_recovered');
    expect(res.provider).toBe('openai');
    expect(res.fallbackUsed).toBe(true);
    expect(res.attempts).toBe(3); // 2 primary + 1 fallback
    expect(mockGroqCreate).toHaveBeenCalledTimes(2);
    expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
  });

  // 3. Groq rate limit — retry count and fallback behavior respect the configured budget
  it('Scenario 3: Groq rate limit — retry count and fallback behavior respect the configured budget', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    // Groq returns 429 rate limit
    mockGroqCreate
      .mockRejectedValueOnce({ status: 429, message: 'Rate limit reached. Please wait.' })
      .mockRejectedValueOnce({ status: 429, message: 'Rate limit reached. Please wait.' });

    // OpenAI fallback succeeds
    mockOpenAIFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"status":"openai_after_ratelimit"}' } }],
        usage: { prompt_tokens: 80, completion_tokens: 20, total_tokens: 100 },
      }),
    });

    const res = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Rate limit fallback test',
      userId: 'user-s3',
      maxRetries: 1,
    });

    expect(res.data.status).toBe('openai_after_ratelimit');
    expect(res.fallbackUsed).toBe(true);
    expect(mockGroqCreate).toHaveBeenCalledTimes(2);
    expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
  });

  // 4. Groq quota exhaustion — no wasteful repeated quota retries; eligible fallback is attempted once
  it('Scenario 4: Groq quota exhaustion — no wasteful repeated quota retries; eligible fallback is attempted once', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    // Groq returns 429 quota exhaustion
    mockGroqCreate.mockRejectedValueOnce({
      status: 429,
      code: 'insufficient_quota',
      message: 'You have exceeded your current quota, please check your plan.',
    });

    // OpenAI fallback succeeds
    mockOpenAIFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"status":"openai_after_quota"}' } }],
        usage: { prompt_tokens: 90, completion_tokens: 30, total_tokens: 120 },
      }),
    });

    const res = await aiGateway.executeStructured({
      task: 'CODE_EVALUATION',
      prompt: 'Quota exhaustion test',
      userId: 'user-s4',
      maxRetries: 3, // Even with maxRetries: 3, primary must NOT loop on quota exhaustion!
    });

    expect(res.data.status).toBe('openai_after_quota');
    expect(res.fallbackUsed).toBe(true);
    expect(res.attempts).toBe(2); // 1 Groq quota + 1 OpenAI fallback
    expect(mockGroqCreate).toHaveBeenCalledTimes(1); // Fails fast on quota exhaustion
    expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
  });

  // 5. Groq authentication/invalid-request errors — no inappropriate fallback
  it('Scenario 5: Groq authentication/invalid-request errors — no inappropriate fallback', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    // 5A: Auth error (401)
    mockGroqCreate.mockRejectedValueOnce({
      status: 401,
      code: 'invalid_api_key',
      message: 'Invalid API Key provided',
    });

    await expect(
      aiGateway.executeStructured({
        task: 'SMART_SETUP',
        prompt: 'Auth failure test',
        userId: 'user-s5a',
        maxRetries: 2,
      })
    ).rejects.toThrow(InvalidApiKeyError);

    // No retries and NO fallback to OpenAI on permanent credential error
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);
    expect(mockOpenAIFetch).not.toHaveBeenCalled();

    // 5B: Client error (400 Bad Request)
    mockGroqCreate.mockRejectedValueOnce({
      status: 400,
      message: 'Bad Request: invalid parameters',
    });

    await expect(
      aiGateway.executeStructured({
        task: 'SMART_SETUP',
        prompt: 'Client error test',
        userId: 'user-s5b',
        maxRetries: 2,
      })
    ).rejects.toThrow(AIError);

    expect(mockOpenAIFetch).not.toHaveBeenCalled();
  });

  // 6. Groq timeout with remaining overall deadline — fallback is attempted only when time remains
  it('Scenario 6: Groq timeout with remaining overall deadline — fallback is attempted only when time remains', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    // Groq times out quickly
    mockGroqCreate.mockRejectedValueOnce(new GroqTimeoutError('Groq call timed out'));

    // OpenAI fallback succeeds
    mockOpenAIFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"status":"openai_after_groq_timeout"}' } }],
        usage: { prompt_tokens: 50, completion_tokens: 15, total_tokens: 65 },
      }),
    });

    const res = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Timeout with remaining deadline test',
      userId: 'user-s6',
      timeoutMs: 5000, // Ample overall deadline
      maxRetries: 0,
    });

    expect(res.data.status).toBe('openai_after_groq_timeout');
    expect(res.fallbackUsed).toBe(true);
    expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
  });

  // 7. Overall deadline expires — no late fallback or success response
  it('Scenario 7: Overall deadline expires — no late fallback or success response', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    // Groq hangs until deadline
    mockGroqCreate.mockImplementation(() => new Promise((_, reject) => {
      setTimeout(() => reject(new GroqTimeoutError('Groq timed out')), 100);
    }));

    await expect(
      aiGateway.executeStructured({
        task: 'SMART_SETUP',
        prompt: 'Deadline expiration test',
        userId: 'user-s7',
        timeoutMs: 50, // Short overall deadline
        maxRetries: 0,
      })
    ).rejects.toThrow(GroqTimeoutError);

    // Fallback must NOT execute after overall deadline expired
    expect(mockOpenAIFetch).not.toHaveBeenCalled();
  });

  // 8. Caller cancellation — no additional provider attempt after cancellation
  it('Scenario 8: Caller cancellation — no additional provider attempt after cancellation', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    const abortController = new AbortController();

    mockGroqCreate.mockImplementation(async () => {
      // Simulate delay during which caller cancels
      await new Promise((r) => setTimeout(r, 20));
      abortController.abort();
      throw new Error('AbortError: Request was aborted');
    });

    await expect(
      aiGateway.executeStructured({
        task: 'CODE_EVALUATION',
        prompt: 'Cancellation test',
        userId: 'user-s8',
        signal: abortController.signal,
        maxRetries: 2,
      })
    ).rejects.toThrow('Request was cancelled');

    // No retries on primary and no fallback to OpenAI
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);
    expect(mockOpenAIFetch).not.toHaveBeenCalled();
  });

  // 9. OpenAI fallback fails — error is normalized, with no fallback loop
  it('Scenario 9: OpenAI fallback fails — error is normalized, with no fallback loop', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    // Groq fails
    mockGroqCreate.mockRejectedValue(new Error('500 Groq Outage'));

    // OpenAI fallback also fails
    mockOpenAIFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ error: { message: 'Bad Gateway' } }),
    });

    await expect(
      aiGateway.executeStructured({
        task: 'SMART_SETUP',
        prompt: 'Fallback failure test',
        userId: 'user-s9',
        maxRetries: 0,
      })
    ).rejects.toThrow(TransientAIError);

    // OpenAI called exactly once, no fallback loop
    expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
  });

  // 10. Both providers fail — request terminates within its deadline and reports the correct final failure
  it('Scenario 10: Both providers fail — request terminates within its deadline and reports the correct final failure', async () => {
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';

    mockGroqCreate.mockRejectedValue(new Error('500 Groq Down'));
    mockOpenAIFetch.mockRejectedValue(new Error('Fetch failed: OpenAI Down'));

    const telemetrySpy = vi.spyOn(AITelemetryService, 'recordEvent');

    await expect(
      aiGateway.executeStructured({
        task: 'CODE_EVALUATION',
        prompt: 'Both providers down test',
        userId: 'user-s10',
        maxRetries: 0,
      })
    ).rejects.toThrow();

    // Telemetry accurately records final failure
    expect(telemetrySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-s10',
        task: 'CODE_EVALUATION',
        status: 'ERROR',
        fallbackUsed: true,
      })
    );
  });

  // 11. Concurrency queue is full — request is rejected or times out as designed, with no leaked permits
  it('Scenario 11: Concurrency queue is full — request is rejected with AIOverloadError and no leaked permits', async () => {
    const controller = new ConcurrencyController({
      globalMaxConcurrent: 1,
      userMaxConcurrent: 5,
      queueMaxSize: 1,
    });
    aiGateway.setConcurrencyController(controller);

    let unblock = false;
    mockGroqCreate.mockImplementation(async () => {
      while (!unblock) {
        await new Promise((r) => setTimeout(r, 10));
      }
      return { id: 'ok', choices: [{ message: { content: '{"ok":true}' } }] };
    });

    const r1 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'R1', userId: 'u1' });
    await new Promise((r) => setTimeout(r, 15));

    const r2 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'R2', userId: 'u2' });
    await new Promise((r) => setTimeout(r, 15));

    // R3 arrives when capacity (1) and queue (1) are saturated -> immediate rejection
    const r3 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'R3', userId: 'u3' });

    await expect(r3).rejects.toThrow(AIOverloadError);
    await expect(r3).rejects.toMatchObject({ code: 'AI_OVERLOAD', retryable: true });

    unblock = true;
    await Promise.all([r1, r2]);

    expect(controller.getStats().activeGlobal).toBe(0);
    expect(controller.getStats().queuedRequests).toBe(0);
  });

  // 12. Provider failure, timeout, and cancellation — concurrency permits are released
  it('Scenario 12: Provider failure, timeout, and cancellation — concurrency permits are released in finally', async () => {
    const controller = new ConcurrencyController({ globalMaxConcurrent: 2 });
    aiGateway.setConcurrencyController(controller);

    // 12A: On provider failure
    mockGroqCreate.mockRejectedValueOnce(new Error('500 Server Error'));
    await expect(
      aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'Fail', userId: 'u1', maxRetries: 0 })
    ).rejects.toThrow();
    expect(controller.getStats().activeGlobal).toBe(0);

    // 12B: On timeout
    mockGroqCreate.mockRejectedValueOnce(new GroqTimeoutError('Timed out'));
    await expect(
      aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'Timeout', userId: 'u2', maxRetries: 0 })
    ).rejects.toThrow();
    expect(controller.getStats().activeGlobal).toBe(0);

    // 12C: On cancellation
    const abort = new AbortController();
    abort.abort();
    await expect(
      aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'Aborted', userId: 'u3', signal: abort.signal })
    ).rejects.toThrow();
    expect(controller.getStats().activeGlobal).toBe(0);
  });

  // 13. Rate-limit budget exceeded — no provider call is made
  it('Scenario 13: Rate-limit budget exceeded — no provider call is made', async () => {
    const budgetManager = new TaskBudgetManager();
    aiGateway.setBudgetManager(budgetManager);

    mockGroqCreate.mockResolvedValue({
      id: 'budget-ok',
      choices: [{ message: { content: '{"ok":true}' } }],
    });

    const task = 'SMART_SETUP';
    const limit = 60; // SMART_SETUP has rateLimitRpm: 60 in taskConfig

    // Consume full budget
    for (let i = 0; i < limit; i++) {
      budgetManager.checkAndConsumeBudget(task, limit);
    }

    // Next request must fail before calling provider
    await expect(
      aiGateway.executeStructured({
        task,
        prompt: 'Over budget prompt',
        userId: 'u-budget',
      })
    ).rejects.toThrow(AIBudgetExceededError);

    // Provider was never invoked for the budget-rejected request
    expect(mockGroqCreate).not.toHaveBeenCalled();
  });

  // 14. Telemetry persistence fails — the AI response/error behavior is not replaced by a telemetry failure
  it('Scenario 14: Telemetry persistence fails — the AI response/error behavior is not replaced by a telemetry failure', async () => {
    vi.spyOn(AITelemetryService, 'recordEvent').mockRejectedValueOnce(new Error('Firestore connection failed'));

    mockGroqCreate.mockResolvedValueOnce({
      id: 'groq-success',
      choices: [{ message: { content: '{"data":"telemetry_safe"}' } }],
      usage: { prompt_tokens: 50, completion_tokens: 15, total_tokens: 65 },
    });

    const res = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Telemetry failure test',
      userId: 'u-telemetry',
    });

    expect(res.data.data).toBe('telemetry_safe');
    expect(res.provider).toBe('groq');
  });

  // 15. Cache hit/coalesced requests — no duplicate physical provider usage is reported
  it('Scenario 15: Cache hit/coalesced requests — no duplicate physical provider usage is reported', async () => {
    const telemetrySpy = vi.spyOn(AITelemetryService, 'recordEvent');

    mockGroqCreate.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 40));
      return {
        id: 'groq-cached',
        choices: [{ message: { content: '{"role":"Software Engineer"}' } }],
        usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
      };
    });

    // Fire 2 concurrent identical requests (coalescing)
    const p1 = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Shared coalesce prompt',
      userId: 'user-shared',
    });
    const p2 = aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Shared coalesce prompt',
      userId: 'user-shared',
    });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.data.role).toBe('Software Engineer');
    expect(r2.data.role).toBe('Software Engineer');

    // Only 1 physical provider call was made
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);

    // Fire a 3rd request (cache hit)
    const r3 = await aiGateway.executeStructured({
      task: 'SMART_SETUP',
      prompt: 'Shared coalesce prompt',
      userId: 'user-shared',
    });

    expect(r3.cached).toBe(true);
    expect(mockGroqCreate).toHaveBeenCalledTimes(1); // Still only 1 physical call!

    // Telemetry: exactly 1 physical completion and 1 cache hit
    const telemetryCalls = telemetrySpy.mock.calls.map((c) => c[0]);
    const physicalSuccess = telemetryCalls.filter((e) => e.eventType === 'SUCCESS');
    const cacheHits = telemetryCalls.filter((e) => e.eventType === 'CACHE_HIT');

    expect(physicalSuccess.length).toBe(1);
    expect(cacheHits.length).toBe(1);
  });

  // 16. Sensitive credentials and prompt/response content do not appear in logs or telemetry
  it('Scenario 16: Sensitive credentials and prompt/response content do not appear in logs or telemetry', async () => {
    const telemetrySpy = vi.spyOn(AITelemetryService, 'recordEvent');

    mockGroqCreate.mockResolvedValueOnce({
      id: 'groq-leak-check',
      choices: [{ message: { content: '{"sensitive_output":"secret_eval_verdict"}' } }],
      usage: { prompt_tokens: 80, completion_tokens: 25, total_tokens: 105 },
    });

    const secretPrompt = 'Candidate resume with SSN: 000-11-2222 and API key gsk_supersecretkey12345678';
    await aiGateway.executeStructured({
      task: 'RESUME_ANALYSIS',
      prompt: secretPrompt,
      userId: 'user-privacy',
    });

    expect(telemetrySpy).toHaveBeenCalledTimes(1);
    const recorded = telemetrySpy.mock.calls[0][0];

    const stringified = JSON.stringify(recorded);
    expect(stringified).not.toContain('000-11-2222');
    expect(stringified).not.toContain('gsk_supersecretkey12345678');
    expect(stringified).not.toContain('secret_eval_verdict');
    expect((recorded as any).prompt).toBeUndefined();
    expect((recorded as any).rawText).toBeUndefined();
  });
});
