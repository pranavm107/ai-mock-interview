import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIGateway, aiGateway } from '../../../src/services/ai/aiGateway';
import { ConcurrencyController } from '../../../src/services/ai/concurrencyController';
import { TaskBudgetManager } from '../../../src/services/ai/budgetManager';
import { estimateCost, setCustomModelPricing, getModelPricing } from '../../../src/services/ai/costCalculator';
import { setSharedGroqClient } from '../../../src/services/ai/providers/groqAdapter';
import { setOpenAIFetch } from '../../../src/services/ai/providers/openaiAdapter';
import { AITelemetryService } from '../../../src/services/ai/aiTelemetryService';
import { AIError, AIOverloadError, AIBudgetExceededError } from '../../../src/errors/aiErrors';
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
      add: vi.fn().mockResolvedValue({ id: 'mock-usage-id' }),
    })),
  },
}));

describe('Step 6: AI Usage Tracking, Concurrency Limits & Per-Task Budgets', () => {
  let mockGroqCreate: ReturnType<typeof vi.fn>;
  let mockOpenAIFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'gsk_step6_mock_key';
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

    // Reset controllers to clean state
    aiGateway.setConcurrencyController(new ConcurrencyController({
      globalMaxConcurrent: 5,
      userMaxConcurrent: 2,
      queueMaxSize: 5,
      queueTimeoutMs: 1000,
    }));
    aiGateway.setBudgetManager(new TaskBudgetManager());
  });

  afterEach(() => {
    setSharedGroqClient(null);
    setOpenAIFetch(null);
    delete process.env.OPENAI_API_KEY;
    setCustomModelPricing({});
  });

  // =========================================================================
  // SECTION 1: Accurate Usage & Cost Accounting
  // =========================================================================
  describe('1. Usage & Cost Accounting', () => {
    it('1.1 should accurately calculate estimated USD costs based on provider-reported tokens', () => {
      // Groq openai/gpt-oss-120b: $0.59/1M input, $0.79/1M output
      const cost1 = estimateCost('openai/gpt-oss-120b', 1000, 500);
      expect(cost1).toBeCloseTo((1000 * 0.59 + 500 * 0.79) / 1_000_000, 6);

      // OpenAI gpt-4o-mini: $0.15/1M input, $0.60/1M output
      const cost2 = estimateCost('gpt-4o-mini', 2000, 1000);
      expect(cost2).toBeCloseTo((2000 * 0.15 + 1000 * 0.60) / 1_000_000, 6);
    });

    it('1.2 should return null cost estimate when prompt or completion tokens are unavailable', () => {
      expect(estimateCost('openai/gpt-oss-120b', null, 500)).toBeNull();
      expect(estimateCost('openai/gpt-oss-120b', 1000, null)).toBeNull();
      expect(estimateCost('openai/gpt-oss-120b', null, null)).toBeNull();
    });

    it('1.3 should support runtime custom pricing overrides', () => {
      setCustomModelPricing({
        'custom/enterprise-model': { promptCostPerMillion: 1.0, completionCostPerMillion: 3.0 },
      });

      const cost = estimateCost('custom/enterprise-model', 1_000_000, 1_000_000);
      expect(cost).toBeCloseTo(4.0, 4);
    });

    it('1.3b should safely handle valid, malformed, or invalid shape AI_MODEL_PRICING_JSON env overrides', () => {
      // 1. Valid JSON env override
      process.env.AI_MODEL_PRICING_JSON = JSON.stringify({
        'env-override-model': { promptCostPerMillion: 2.0, completionCostPerMillion: 5.0 },
      });
      const costValid = estimateCost('env-override-model', 1000, 1000);
      expect(costValid).toBeCloseTo((1000 * 2.0 + 1000 * 5.0) / 1_000_000, 6);

      // 2. Malformed JSON env override: must not throw, preserves default pricing, returns null for unpriced models
      process.env.AI_MODEL_PRICING_JSON = '{ malformed json: not valid';
      const costDefault = estimateCost('gpt-4o-mini', 1000, 1000);
      expect(costDefault).toBeCloseTo((1000 * 0.15 + 1000 * 0.60) / 1_000_000, 6);
      expect(estimateCost('completely-unknown-model', 1000, 1000)).toBeNull();

      // 3. Non-object or invalid shape JSON env override: safe fallback
      process.env.AI_MODEL_PRICING_JSON = JSON.stringify(['not', 'an', 'object']);
      expect(estimateCost('gpt-4o-mini', 1000, 1000)).toBeCloseTo((1000 * 0.15 + 1000 * 0.60) / 1_000_000, 6);

      delete process.env.AI_MODEL_PRICING_JSON;
    });

    it('1.4 should distinguish logical request, retries, and return accurate retryCount in response and telemetry', async () => {
      const telemetrySpy = vi.spyOn(AITelemetryService, 'recordEvent');

      // Fail once with transient 500, then succeed on second attempt
      mockGroqCreate
        .mockRejectedValueOnce({ status: 503, message: 'Service Unavailable' })
        .mockResolvedValueOnce({
          id: 'groq-success',
          choices: [{ message: { content: '{"status":"ok"}' } }],
          usage: { prompt_tokens: 150, completion_tokens: 50, total_tokens: 200 },
        });

      const res = await aiGateway.executeStructured({
        task: 'CODE_EVALUATION',
        prompt: 'Check code',
        userId: 'user-retry-test',
        maxRetries: 1,
      });

      expect(res.data).toEqual({ status: 'ok' });
      expect(res.attempts).toBe(2);
      expect(res.retryCount).toBe(1);
      expect(res.estimatedCostUsd).toBeGreaterThan(0);

      // Verify telemetry event fields
      expect(telemetrySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-retry-test',
          task: 'CODE_EVALUATION',
          attemptCount: 2,
          retryCount: 1,
          status: 'SUCCESS',
          promptTokens: 150,
          completionTokens: 50,
          totalTokens: 200,
          estimatedCostUsd: expect.any(Number),
        })
      );
    });

    it('1.5 should never log raw prompts, candidate code, or credentials in telemetry', async () => {
      const telemetrySpy = vi.spyOn(AITelemetryService, 'recordEvent');

      mockGroqCreate.mockResolvedValueOnce({
        id: 'groq-leak-test',
        choices: [{ message: { content: '{"result":"safe"}' } }],
        usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
      });

      const sensitivePrompt = 'My secret resume details with private email john@doe.com and key gsk_1234567890abcdef';
      await aiGateway.executeStructured({
        task: 'RESUME_ANALYSIS',
        prompt: sensitivePrompt,
        userId: 'user-privacy-test',
      });

      expect(telemetrySpy).toHaveBeenCalledTimes(1);
      const recordedEvent = telemetrySpy.mock.calls[0][0];

      // Telemetry object must not have prompt or raw output
      expect((recordedEvent as any).prompt).toBeUndefined();
      expect((recordedEvent as any).rawText).toBeUndefined();
      expect(JSON.stringify(recordedEvent)).not.toContain('john@doe.com');
      expect(JSON.stringify(recordedEvent)).not.toContain('gsk_1234567890abcdef');
    });

    it('1.6 should not fail the AI operation if telemetry persistence fails', async () => {
      vi.spyOn(AITelemetryService, 'recordEvent').mockRejectedValueOnce(new Error('Firestore down'));

      mockGroqCreate.mockResolvedValueOnce({
        id: 'groq-success',
        choices: [{ message: { content: '{"answer":"resilient"}' } }],
        usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
      });

      const res = await aiGateway.executeStructured({
        task: 'FOLLOW_UP_QUESTION',
        prompt: 'Follow up',
        userId: 'user-telemetry-failure',
      });

      expect(res.data.answer).toBe('resilient');
    });
  });

  // =========================================================================
  // SECTION 2: Bounded Concurrency & Admission Control
  // =========================================================================
  describe('2. Bounded Concurrency & Admission Control', () => {
    it('2.1 should enforce global concurrency limit and queue additional requests', async () => {
      const controller = new ConcurrencyController({
        globalMaxConcurrent: 2,
        userMaxConcurrent: 5,
        queueMaxSize: 5,
      });
      aiGateway.setConcurrencyController(controller);

      let activeCalls = 0;
      let peakConcurrency = 0;

      mockGroqCreate.mockImplementation(async () => {
        activeCalls++;
        peakConcurrency = Math.max(peakConcurrency, activeCalls);
        await new Promise((r) => setTimeout(r, 60));
        activeCalls--;
        return {
          id: 'groq-conc',
          choices: [{ message: { content: '{"ok":true}' } }],
        };
      });

      // Launch 4 concurrent requests (limit is 2)
      const p1 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'P1', userId: 'u1' });
      const p2 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'P2', userId: 'u2' });
      const p3 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'P3', userId: 'u3' });
      const p4 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'P4', userId: 'u4' });

      await Promise.all([p1, p2, p3, p4]);

      // Active calls concurrently executing should never exceed 2
      expect(peakConcurrency).toBeLessThanOrEqual(2);
      expect(controller.getStats().activeGlobal).toBe(0);
      expect(controller.getStats().totalAcquired).toBe(4);
      expect(controller.getStats().totalReleased).toBe(4);
    });

    it('2.2 should reject immediately with AIOverloadError when concurrency queue is full', async () => {
      const controller = new ConcurrencyController({
        globalMaxConcurrent: 1,
        userMaxConcurrent: 5,
        queueMaxSize: 1, // Only 1 waiter allowed in queue
      });
      aiGateway.setConcurrencyController(controller);

      let unblock = false;
      mockGroqCreate.mockImplementation(async () => {
        while (!unblock) {
          await new Promise((r) => setTimeout(r, 10));
        }
        return {
          id: 'groq-block',
          choices: [{ message: { content: '{"done":true}' } }],
        };
      });

      // R1 occupies the single active slot
      const r1 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'R1', userId: 'u1' });
      await new Promise((r) => setTimeout(r, 15));

      // R2 enters the queue (queue size 1)
      const r2 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'R2', userId: 'u2' });
      await new Promise((r) => setTimeout(r, 15));

      // R3 arrives when queue is full -> immediate AIOverloadError
      const r3 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'R3', userId: 'u3' });

      await expect(r3).rejects.toThrow(AIOverloadError);
      await expect(r3).rejects.toMatchObject({
        code: 'AI_OVERLOAD',
        retryable: true,
      });

      // Release active requests so R1 and R2 complete cleanly
      unblock = true;
      await Promise.all([r1, r2]);

      expect(controller.getStats().totalRejections).toBe(1);
      expect(controller.getStats().activeGlobal).toBe(0);
    });

    it('2.3 should reject with AIOverloadError when a request times out in the queue', async () => {
      const controller = new ConcurrencyController({
        globalMaxConcurrent: 1,
        userMaxConcurrent: 5,
        queueMaxSize: 5,
        queueTimeoutMs: 50, // Short queue timeout
      });
      aiGateway.setConcurrencyController(controller);

      mockGroqCreate.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve({
          id: 'groq-slow',
          choices: [{ message: { content: '{"done":true}' } }],
        }), 200);
      }));

      const r1 = aiGateway.executeStructured({ task: 'SMART_SETUP', prompt: 'R1', userId: 'u1' });
      // r2 will wait longer than 50ms in queue
      const r2 = aiGateway.executeStructured({ task: 'SMART_SETUP', prompt: 'R2', userId: 'u2' });

      await expect(r2).rejects.toThrow(AIOverloadError);
      await r1;

      expect(controller.getStats().activeGlobal).toBe(0);
    });

    it('2.4 should handle caller cancellation while queued without consuming concurrency slots', async () => {
      const controller = new ConcurrencyController({
        globalMaxConcurrent: 1,
        userMaxConcurrent: 5,
        queueMaxSize: 5,
      });
      aiGateway.setConcurrencyController(controller);

      let unblock = false;
      mockGroqCreate.mockImplementation(async () => {
        while (!unblock) {
          await new Promise((r) => setTimeout(r, 10));
        }
        return {
          id: 'groq-block',
          choices: [{ message: { content: '{"done":true}' } }],
        };
      });

      // R1 holds active slot
      const r1 = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'R1', userId: 'u1' });
      await new Promise((r) => setTimeout(r, 15));

      // R2 queues with abort signal
      const abortController = new AbortController();
      const r2 = aiGateway.executeStructured({
        task: 'CODE_EVALUATION',
        prompt: 'R2',
        userId: 'u2',
        signal: abortController.signal,
      });

      await new Promise((r) => setTimeout(r, 15));
      expect(controller.getStats().queuedRequests).toBe(1);

      // Caller cancels while waiting in queue
      abortController.abort();

      await expect(r2).rejects.toThrow('Request was cancelled');
      expect(controller.getStats().queuedRequests).toBe(0);

      unblock = true;
      await r1;

      expect(controller.getStats().activeGlobal).toBe(0);
    });

    it('2.5 should enforce per-task concurrency limits to prevent one task from starving others', async () => {
      const controller = new ConcurrencyController({
        globalMaxConcurrent: 10,
        userMaxConcurrent: 10,
        queueMaxSize: 10,
      });
      aiGateway.setConcurrencyController(controller);

      let activeReportCalls = 0;
      let peakReportConcurrency = 0;

      mockGroqCreate.mockImplementation(async () => {
        activeReportCalls++;
        peakReportConcurrency = Math.max(peakReportConcurrency, activeReportCalls);
        await new Promise((r) => setTimeout(r, 50));
        activeReportCalls--;
        return {
          id: 'groq-task',
          choices: [{ message: { content: '{"ok":true}' } }],
        };
      });

      // REPORT_QUESTION_EVALUATION has maxConcurrency: 3 in taskConfig
      const t1 = aiGateway.executeStructured({ task: 'REPORT_QUESTION_EVALUATION', prompt: 'T1', userId: 'u1' });
      const t2 = aiGateway.executeStructured({ task: 'REPORT_QUESTION_EVALUATION', prompt: 'T2', userId: 'u2' });
      const t3 = aiGateway.executeStructured({ task: 'REPORT_QUESTION_EVALUATION', prompt: 'T3', userId: 'u3' });
      const t4 = aiGateway.executeStructured({ task: 'REPORT_QUESTION_EVALUATION', prompt: 'T4', userId: 'u4' });
      const t5 = aiGateway.executeStructured({ task: 'REPORT_QUESTION_EVALUATION', prompt: 'T5', userId: 'u5' });

      await Promise.all([t1, t2, t3, t4, t5]);

      expect(peakReportConcurrency).toBeLessThanOrEqual(3);
      expect(controller.getStats().activeGlobal).toBe(0);
    });

    it('2.6 should enforce per-user concurrency limit to prevent noisy neighbor starvation', async () => {
      const controller = new ConcurrencyController({
        globalMaxConcurrent: 10,
        userMaxConcurrent: 1, // Max 1 concurrent request per user
        queueMaxSize: 5,
      });
      aiGateway.setConcurrencyController(controller);

      let activeUserCalls = 0;
      let peakUserConcurrency = 0;

      mockGroqCreate.mockImplementation(async () => {
        activeUserCalls++;
        peakUserConcurrency = Math.max(peakUserConcurrency, activeUserCalls);
        await new Promise((r) => setTimeout(r, 50));
        activeUserCalls--;
        return {
          id: 'groq-user',
          choices: [{ message: { content: '{"ok":true}' } }],
        };
      });

      // Same user submits 3 requests
      const u1a = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'U1A', userId: 'heavy-user' });
      const u1b = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'U1B', userId: 'heavy-user' });
      const u1c = aiGateway.executeStructured({ task: 'CODE_EVALUATION', prompt: 'U1C', userId: 'heavy-user' });

      await Promise.all([u1a, u1b, u1c]);

      expect(peakUserConcurrency).toBe(1);
      expect(controller.getStats().activeGlobal).toBe(0);
    });

    it('2.7 should release permit when provider fails with timeout or error', async () => {
      const controller = new ConcurrencyController({ globalMaxConcurrent: 2 });
      aiGateway.setConcurrencyController(controller);

      mockGroqCreate.mockRejectedValue(new GroqTimeoutError('Groq timeout'));

      await expect(
        aiGateway.executeStructured({ task: 'SMART_SETUP', prompt: 'Timeout prompt', userId: 'u1', maxRetries: 0 })
      ).rejects.toThrow(GroqTimeoutError);

      expect(controller.getStats().activeGlobal).toBe(0);
      expect(controller.getStats().totalReleased).toBe(1);
    });

    it('2.8 should hold a single permit across Groq-to-OpenAI fallback without deadlock or double release', async () => {
      const controller = new ConcurrencyController({ globalMaxConcurrent: 1 });
      aiGateway.setConcurrencyController(controller);

      process.env.OPENAI_API_KEY = 'sk-step6-openai-key';
      mockGroqCreate.mockRejectedValue(new Error('500 Groq Outage'));

      mockOpenAIFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"answer":"openai fallback"}' } }],
          usage: { prompt_tokens: 80, completion_tokens: 30, total_tokens: 110 },
        }),
      });
      setOpenAIFetch(mockOpenAIFetch as any);

      const res = await aiGateway.executeStructured({
        task: 'SMART_SETUP',
        prompt: 'Fallback prompt',
        userId: 'u-fallback',
        maxRetries: 0,
      });

      expect(res.data.answer).toBe('openai fallback');
      expect(res.fallbackUsed).toBe(true);

      // Verify that exactly 1 permit was acquired and 1 released
      expect(controller.getStats().activeGlobal).toBe(0);
      expect(controller.getStats().totalAcquired).toBe(1);
      expect(controller.getStats().totalReleased).toBe(1);
    });
  });

  // =========================================================================
  // SECTION 3: Per-Task Budgets (RPM & Token Ceilings)
  // =========================================================================
  describe('3. Per-Task Budgets', () => {
    it('3.1 should reject with AIBudgetExceededError when task RPM rate limit is exceeded', async () => {
      const budgetManager = new TaskBudgetManager();
      aiGateway.setBudgetManager(budgetManager);

      mockGroqCreate.mockResolvedValue({
        id: 'groq-budget',
        choices: [{ message: { content: '{"ok":true}' } }],
      });

      // Override budget limit for testing: 3 RPM
      const task = 'SMART_SETUP';
      const rpmLimit = 3;

      budgetManager.checkAndConsumeBudget(task, rpmLimit);
      budgetManager.checkAndConsumeBudget(task, rpmLimit);
      budgetManager.checkAndConsumeBudget(task, rpmLimit);

      // 4th request in the same window exceeds budget
      expect(() => {
        budgetManager.checkAndConsumeBudget(task, rpmLimit);
      }).toThrow(AIBudgetExceededError);

      try {
        budgetManager.checkAndConsumeBudget(task, rpmLimit);
      } catch (err: any) {
        expect(err).toBeInstanceOf(AIBudgetExceededError);
        expect(err.code).toBe('AI_BUDGET_EXCEEDED');
        expect(err.retryable).toBe(false);
      }
    });

    it('3.2 should evaluate token ceiling and warn when usage exceeds budget without breaking response', async () => {
      const budgetManager = new TaskBudgetManager();
      aiGateway.setBudgetManager(budgetManager);

      mockGroqCreate.mockResolvedValueOnce({
        id: 'groq-token-test',
        choices: [{ message: { content: '{"result":"token ceiling"}' } }],
        usage: { prompt_tokens: 3000, completion_tokens: 1500, total_tokens: 4500 },
      });

      const res = await aiGateway.executeStructured({
        task: 'RESUME_ANALYSIS', // Default token budget is 3000
        prompt: 'Large resume',
        userId: 'u-tokens',
      });

      expect(res.data.result).toBe('token ceiling');
      expect(res.usage.totalTokens).toBe(4500);
      // Warning logged internally, request succeeded safely without corrupting payload
    });

    it('3.3 should document and maintain process-local sliding window state accurately', () => {
      const budgetManager = new TaskBudgetManager();
      const task = 'CODE_EVALUATION';

      budgetManager.checkAndConsumeBudget(task, 10);
      budgetManager.checkAndConsumeBudget(task, 10);

      const usage = budgetManager.getTaskUsage(task);
      expect(usage.requestCountLastMinute).toBe(2);
      expect(usage.budgetRpm).toBe(10);
    });
  });

  // =========================================================================
  // SECTION 4: Configuration Resilience & Optional Fallback
  // =========================================================================
  describe('4. Configuration Resilience & Optional Fallback', () => {
    it('4.1 should use safe fallback defaults when concurrency environment variables are missing or malformed', () => {
      const controller = new ConcurrencyController({
        globalMaxConcurrent: 'invalid' as any,
        userMaxConcurrent: -5 as any,
        queueMaxSize: NaN as any,
        queueTimeoutMs: undefined,
      });

      // Must fall back to safe default numbers without crashing
      const stats = controller.getStats();
      expect(stats.activeGlobal).toBe(0);
      expect(controller['globalMaxConcurrent']).toBe(10);
      expect(controller['userMaxConcurrent']).toBe(3);
      expect(controller['queueMaxSize']).toBe(10);
      expect(controller['queueTimeoutMs']).toBe(3000);
    });

    it('4.2 should maintain primary Groq functionality when OpenAI key is absent', async () => {
      delete process.env.OPENAI_API_KEY;

      mockGroqCreate.mockResolvedValueOnce({
        id: 'groq-no-openai',
        choices: [{ message: { content: '{"healthy":true}' } }],
      });

      const res = await aiGateway.executeStructured({
        task: 'FOLLOW_UP_QUESTION',
        prompt: 'No openai configured',
        userId: 'u-no-openai',
      });

      expect(res.data.healthy).toBe(true);
      expect(res.fallbackUsed).toBe(false);
    });
  });
});
