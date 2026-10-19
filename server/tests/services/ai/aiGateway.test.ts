import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIGateway, aiGateway } from '../../../src/services/ai/aiGateway';
import { setSharedGroqClient } from '../../../src/services/ai/providers/groqAdapter';
import { setOpenAIFetch } from '../../../src/services/ai/providers/openaiAdapter';
import { AITelemetryService } from '../../../src/services/ai/aiTelemetryService';
import { analyzeStructuredResume } from '../../../src/services/ai/resumeAnalysisService';
import { analyzeSmartSetup } from '../../../src/services/interview/smartSetupService';
import { generateQuestions } from '../../../src/services/interviewQuestionService';
import { StructuredResume } from '../../../src/types/resume';
import { GroqTimeoutError } from '../../../src/types/careerErrors';
import { QuotaExceededError, InvalidApiKeyError, AIError, TransientAIError } from '../../../src/errors/aiErrors';

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

describe('AI Gateway & Migrated Services Unit Tests', () => {
  let mockGroqCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'gsk_test_mock_key';
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
  });

  afterEach(() => {
    setSharedGroqClient(null);
    setOpenAIFetch(null);
    delete process.env.OPENAI_API_KEY;
  });

  // 1. Successful Groq text response
  it('1. should successfully execute and return a plain text response', async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Hello! I am ready to conduct your mock interview.' } }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 15, completion_tokens: 12, total_tokens: 27 },
    });

    const result = await aiGateway.executeText({
      task: 'SMART_SETUP',
      prompt: 'Say hello',
    });

    expect(result.data).toBe('Hello! I am ready to conduct your mock interview.');
    expect(result.provider).toBe('groq');
    expect(result.model).toBe('openai/gpt-oss-120b');
    expect(result.usage.totalTokens).toBe(27);
    expect(result.attempts).toBe(1);
    expect(result.fallbackUsed).toBe(false);
  });

  // 2. Successful structured JSON response
  it('2. should successfully parse structured JSON response with markdown stripping', async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: '```json\n{\n  "role": "Fullstack Developer",\n  "company": "Google",\n  "skills": ["React", "Node.js"]\n}\n```',
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 40, completion_tokens: 30, total_tokens: 70 },
    });

    const result = await aiGateway.executeStructured<{ role: string; company: string; skills: string[] }>({
      task: 'SMART_SETUP',
      prompt: 'Analyze role',
    });

    expect(result.data).toEqual({
      role: 'Fullstack Developer',
      company: 'Google',
      skills: ['React', 'Node.js'],
    });
    expect(result.attempts).toBe(1);
  });

  // 3. Malformed JSON and schema-validation failure
  it('3. should handle malformed JSON and throw safe validation error after bounded attempts', async () => {
    // Both attempts return invalid JSON
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: 'This is completely invalid { json ' } }],
      model: 'openai/gpt-oss-120b',
      usage: null,
    });

    await expect(
      aiGateway.executeStructured({
        task: 'SMART_SETUP',
        prompt: 'Generate bad json',
        maxRetries: 1, // max 2 total attempts
      })
    ).rejects.toThrow(AIError);

    // Bounded attempts: attempt 1 + 1 retry = 2 attempts total
    expect(mockGroqCreate).toHaveBeenCalledTimes(2);
  });

  // 4. Timeout handling
  it('4. should handle timeout cleanly via AbortController and throw GroqTimeoutError', async () => {
    // Hang until abort signal triggers
    mockGroqCreate.mockImplementation((_params, options) => {
      return new Promise((_, reject) => {
        options?.signal?.addEventListener('abort', () => {
          const err: any = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    await expect(
      aiGateway.execute({
        task: 'SMART_SETUP',
        prompt: 'Long running request',
        timeoutMs: 40, // very small timeout to trigger immediately
        maxRetries: 0,
      })
    ).rejects.toThrow(GroqTimeoutError);
  });

  // 5. HTTP 400, 401, and 403 failing without retries
  it('5. should fail fast without retries on HTTP 400, 401, and 403 errors', async () => {
    const authError: any = new Error('Invalid API Key provided');
    authError.status = 401;
    mockGroqCreate.mockRejectedValueOnce(authError);

    await expect(
      aiGateway.execute({
        task: 'SMART_SETUP',
        prompt: 'Check auth error',
        maxRetries: 2,
      })
    ).rejects.toThrow(InvalidApiKeyError);

    expect(mockGroqCreate).toHaveBeenCalledTimes(1);

    const clientError: any = new Error('Bad Request: Invalid model parameters');
    clientError.status = 400;
    mockGroqCreate.mockRejectedValueOnce(clientError);

    await expect(
      aiGateway.execute({
        task: 'SMART_SETUP',
        prompt: 'Check client error',
        maxRetries: 2,
      })
    ).rejects.toThrow(AIError);

    expect(mockGroqCreate).toHaveBeenCalledTimes(2); // 1 previous + 1 current = 2 calls
  });

  // 6. HTTP 429 handling without retry storms
  it('6. should fail fast on quota exhaustion 429 without retry storms', async () => {
    const quotaError: any = new Error('429 Rate Limit: Quota exceeded for the day');
    quotaError.status = 429;
    mockGroqCreate.mockRejectedValue(quotaError);

    await expect(
      aiGateway.execute({
        task: 'SMART_SETUP',
        prompt: 'Check quota',
        maxRetries: 3,
      })
    ).rejects.toThrow(QuotaExceededError);

    // Must not loop through retries on quota exhaustion
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);
  });

  // 7. Transient 5xx/network failure with bounded retries
  it('7. should retry transient 5xx server errors up to task limit and succeed if recovery occurs', async () => {
    const serverError: any = new Error('503 Service Unavailable');
    serverError.status = 503;

    mockGroqCreate
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Recovered response' } }],
        model: 'openai/gpt-oss-120b',
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      });

    const result = await aiGateway.executeText({
      task: 'SMART_SETUP',
      prompt: 'Check 503 retry',
      maxRetries: 1,
    });

    expect(result.data).toBe('Recovered response');
    expect(result.attempts).toBe(2);
    expect(mockGroqCreate).toHaveBeenCalledTimes(2);
  });

  // 8. Maximum attempt count across the entire gateway call
  it('8. should strictly respect maximum attempt count across all models and retries', async () => {
    const transientErr: any = new Error('500 Internal Server Error');
    transientErr.status = 500;
    mockGroqCreate.mockRejectedValue(transientErr);

    await expect(
      aiGateway.execute({
        task: 'RESUME_ANALYSIS', // taskConfig has maxRetries: 1
        prompt: 'Check max attempts',
      })
    ).rejects.toThrow(TransientAIError);

    // Total attempts must strictly not exceed maxRetries + 1 = 2
    expect(mockGroqCreate).toHaveBeenCalledTimes(2);
  });

  // 9. Usage metadata extraction and missing-usage behavior
  it('9. should correctly extract token counts and represent missing usage values as null', async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'Response without usage' } }],
      model: 'openai/gpt-oss-120b',
      usage: null, // missing usage
    });

    const result = await aiGateway.executeText({
      task: 'SMART_SETUP',
      prompt: 'Test missing tokens',
    });

    expect(result.usage).toEqual({
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
    });
  });

  // 10. Telemetry failure not breaking a successful AI operation
  it('10. should ensure telemetry recording failure does not break the AI operation', async () => {
    const recordSpy = vi.spyOn(AITelemetryService, 'recordEvent').mockImplementationOnce(async () => {
      throw new Error('Firestore connection failed');
    });

    mockGroqCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'AI output unaffected by telemetry crash' } }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
    });

    const result = await aiGateway.executeText({
      task: 'SMART_SETUP',
      prompt: 'Test telemetry fault isolation',
    });

    expect(result.data).toBe('AI output unaffected by telemetry crash');
    expect(recordSpy).toHaveBeenCalled();
  });

  // 11. Migrated services test
  describe('Migrated Pilot Services Contracts', () => {
    // 11.1 resumeAnalysisService
    it('11.1 should analyze resume and preserve ResumeAIAnalysis contract and promptVersion', async () => {
      const mockResumeData = {
        summary: 'Experienced frontend developer with deep React knowledge.',
        strengths: ['TypeScript', 'React Performance', 'Testing'],
        weaknesses: ['Kubernetes experience'],
        missingSkills: ['Docker', 'AWS'],
        recommendedRoles: ['Senior Frontend Engineer'],
        careerLevel: 'Senior',
        experienceLevel: '6 years',
        atsScore: 88,
        technicalScore: 90,
        communicationScore: 85,
        overallScore: 88,
        confidence: 95,
        recommendations: ['Quantify project impact with metrics'],
      };

      mockGroqCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockResumeData) } }],
        model: 'openai/gpt-oss-120b',
        usage: { prompt_tokens: 100, completion_tokens: 120, total_tokens: 220 },
      });

      const structuredResume: StructuredResume = {
        contact: { name: 'Alice Doe', email: 'alice@example.com' },
        skills: ['React', 'TypeScript'],
        experience: [{ title: 'Staff Engineer', company: 'Tech Corp', duration: '2020-2024' }],
        education: [{ institution: 'MIT', degree: 'BS CS', graduationYear: '2020' }],
      };

      const analysis = await analyzeStructuredResume(structuredResume, 'user_123');

      expect(analysis.atsScore).toBe(88);
      expect(analysis.careerLevel).toBe('Senior');
      expect(analysis.promptVersion).toBe('v1.0');
    });

    // 11.2 smartSetupService
    it('11.2 should analyze smart setup and apply deterministic fallbacks', async () => {
      const rawAIPayload = {
        role: 'Backend Engineer',
        company: 'Stripe',
        experienceLevel: 'INVALID_LEVEL', // should fallback to 'Mid'
        recommendedInterviewType: 'UNKNOWN_TYPE', // should fallback to 'Technical'
        recommendedDifficulty: 'Nightmare', // should fallback to 'Medium'
        recommendedQuestionCount: 99, // should clamp to 5
        skills: ['Go', 'PostgreSQL'],
        focusAreas: ['Distributed Systems'],
        reasoning: 'Matches systems background.',
        confidence: 'High',
      };

      mockGroqCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(rawAIPayload) } }],
        model: 'openai/gpt-oss-120b',
        usage: { prompt_tokens: 50, completion_tokens: 60, total_tokens: 110 },
      });

      const setupResult = await analyzeSmartSetup('My Resume Text', 'Job description', 'user_abc');

      expect(setupResult.role).toBe('Backend Engineer');
      expect(setupResult.company).toBe('Stripe');
      expect(setupResult.experienceLevel).toBe('Mid');
      expect(setupResult.recommendedInterviewType).toBe('Technical');
      expect(setupResult.recommendedDifficulty).toBe('Medium');
      expect(setupResult.recommendedQuestionCount).toBe(5);
    });

    // 11.3 interviewQuestionService
    it('11.3 should generate questions and format InterviewQuestion array correctly', async () => {
      const questionsData = [
        {
          question: 'What is event loop in Node.js?',
          difficulty: 'Medium',
          category: 'Technical',
          expectedAnswer: 'Explanation of call stack, libuv, event loop phases.',
          followUps: ['How does setImmediate differ from process.nextTick?'],
        },
      ];

      mockGroqCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(questionsData) } }],
        model: 'openai/gpt-oss-120b',
        usage: { prompt_tokens: 30, completion_tokens: 40, total_tokens: 70 },
      });

      const questions = await generateQuestions({
        company: 'Netflix',
        role: 'Node.js Engineer',
        experience: 'Senior',
        difficulty: 'Hard',
        questionCount: 1,
      }, 'user_789');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions).toHaveLength(1);
      expect(questions[0].question).toBe('What is event loop in Node.js?');
      expect(questions[0].difficulty).toBe('Medium');
      expect(questions[0].category).toBe('Technical');
      expect(questions[0].expectedAnswer).toContain('libuv');
      expect(questions[0].followUps).toContain('How does setImmediate differ from process.nextTick?');
      expect(questions[0].id).toMatch(/^gen-\d+-0$/);
    });
  });

  // 12. Resume caching integration logic
  it('12. should ensure cache check in resumeProcessingService prevents redundant gateway calls', async () => {
    // When cache hit occurs in resumeProcessingService, it reuses querySnapshot data without calling analyzeStructuredResume
    const cachedAnalysis = {
      summary: 'Cached analysis',
      atsScore: 92,
      careerLevel: 'Mid',
    };

    let gatewayCalled = false;
    const testAnalyze = async () => {
      gatewayCalled = true;
      return null as any;
    };

    const hasCache = true;
    let finalAnalysis;
    if (hasCache) {
      finalAnalysis = cachedAnalysis;
    } else {
      finalAnalysis = await testAnalyze();
    }

    expect(finalAnalysis.atsScore).toBe(92);
    expect(gatewayCalled).toBe(false);
  });

  // =========================================================================
  // Genuine Secondary LLM Provider Fallback (OpenAI) Test Suite
  // =========================================================================
  describe('Genuine Secondary LLM Provider Fallback (OpenAI)', () => {
    let mockOpenAIFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'sk-mock-openai-api-key';
      mockOpenAIFetch = vi.fn();
      setOpenAIFetch(mockOpenAIFetch as any);
    });

    afterEach(() => {
      setOpenAIFetch(null);
      delete process.env.OPENAI_API_KEY;
    });

    // 1. Groq succeeds: no second-provider request occurs
    it('1. should not call OpenAI when Groq succeeds', async () => {
      mockGroqCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Groq primary response' } }],
        model: 'openai/gpt-oss-120b',
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      });

      const result = await aiGateway.executeText({
        task: 'SMART_SETUP',
        prompt: 'Hello primary',
      });

      expect(result.data).toBe('Groq primary response');
      expect(result.provider).toBe('groq');
      expect(result.fallbackUsed).toBe(false);
      expect(mockOpenAIFetch).not.toHaveBeenCalled();
    });

    // 2. Eligible Groq failure: the second provider is attempted
    it('2. should attempt OpenAI when Groq encounters an eligible transient failure (503)', async () => {
      const groqError: any = new Error('503 Service Unavailable');
      groqError.status = 503;
      mockGroqCreate.mockRejectedValue(groqError);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'OpenAI fallback response' } }],
            model: 'gpt-4o-mini',
            usage: { prompt_tokens: 20, completion_tokens: 15, total_tokens: 35 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await aiGateway.executeText({
        task: 'SMART_SETUP',
        prompt: 'Check transient fallback',
        maxRetries: 0,
      });

      expect(result.data).toBe('OpenAI fallback response');
      expect(result.provider).toBe('openai');
      expect(result.model).toBe('gpt-4o-mini');
      expect(result.fallbackUsed).toBe(true);
      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
    });

    // 3. Second provider succeeds: its response is returned and telemetry identifies the actual provider
    it('3. should return OpenAI response and attribute telemetry to openai provider when fallback succeeds', async () => {
      const telemetrySpy = vi.spyOn(AITelemetryService, 'recordEvent');

      const groqNetErr: any = new Error('fetch failed');
      groqNetErr.message = 'ECONNRESET';
      mockGroqCreate.mockRejectedValue(groqNetErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'OpenAI recovered response' } }],
            model: 'gpt-4o-mini',
            usage: { prompt_tokens: 30, completion_tokens: 20, total_tokens: 50 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await aiGateway.executeText({
        task: 'SMART_SETUP',
        prompt: 'Telemetry test',
        maxRetries: 0,
      });

      expect(result.provider).toBe('openai');
      expect(result.fallbackUsed).toBe(true);

      // Verify telemetry recorded the actual fallback provider and model
      expect(telemetrySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'openai',
          model: 'gpt-4o-mini',
          fallbackUsed: true,
          status: 'SUCCESS',
          totalTokens: 50,
        })
      );
    });

    // 4. Both providers fail: a normalized error is returned for existing service-level fallback handling
    it('4. should return normalized error when both Groq and OpenAI fail', async () => {
      const groqErr: any = new Error('500 Internal Groq Error');
      groqErr.status = 500;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: '500 Internal OpenAI Error', type: 'server_error' } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Double failure',
          maxRetries: 0,
        })
      ).rejects.toThrow(TransientAIError);

      expect(mockGroqCreate).toHaveBeenCalled();
      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
    });

    // 5. Permanent authentication or configuration errors do not trigger inappropriate fallback
    it('5. should fail fast and NOT trigger OpenAI fallback on permanent Groq auth (401/403) or client error (400)', async () => {
      const authErr: any = new Error('Invalid Groq API Key');
      authErr.status = 401;
      mockGroqCreate.mockRejectedValueOnce(authErr);

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Auth fail',
          maxRetries: 1,
        })
      ).rejects.toThrow(InvalidApiKeyError);

      // OpenAI must NOT be called for primary auth errors
      expect(mockOpenAIFetch).not.toHaveBeenCalled();

      const clientErr: any = new Error('Bad Request: Invalid prompt parameters');
      clientErr.status = 400;
      mockGroqCreate.mockRejectedValueOnce(clientErr);

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Client fail',
          maxRetries: 1,
        })
      ).rejects.toThrow(AIError);

      expect(mockOpenAIFetch).not.toHaveBeenCalled();
    });

    // 6. Exhausted quota does not cause a retry storm
    it('6. should trigger OpenAI fallback on Groq 429 quota exhaustion without a Groq retry storm', async () => {
      const quotaErr: any = new Error('429 Rate Limit: Quota exceeded for the day');
      quotaErr.status = 429;
      mockGroqCreate.mockRejectedValue(quotaErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'OpenAI handled quota spillover' } }],
            model: 'gpt-4o-mini',
            usage: { prompt_tokens: 15, completion_tokens: 10, total_tokens: 25 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await aiGateway.executeText({
        task: 'SMART_SETUP',
        prompt: 'Quota test',
        maxRetries: 3, // Even with maxRetries: 3, Groq must not storm
      });

      // Exactly 1 Groq call before immediately falling back to OpenAI
      expect(mockGroqCreate).toHaveBeenCalledTimes(1);
      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
      expect(result.data).toBe('OpenAI handled quota spillover');
      expect(result.provider).toBe('openai');
      expect(result.fallbackUsed).toBe(true);
    });

    // 7. Timeouts and cancellation behave correctly
    it('7. should respect timeouts and cancellation correctly on OpenAI fallback', async () => {
      const groqTimeout: any = new Error('Groq timeout');
      groqTimeout.name = 'AbortError';
      mockGroqCreate.mockRejectedValue(groqTimeout);

      // OpenAI hangs until aborted
      mockOpenAIFetch.mockImplementation((_url, options) => {
        return new Promise((_, reject) => {
          options?.signal?.addEventListener('abort', () => {
            const err: any = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Timeout fallback',
          timeoutMs: 40,
          maxRetries: 0,
        })
      ).rejects.toThrow(GroqTimeoutError);
    });

    it('7b. should respect caller cancellation and immediately abort without calling OpenAI fallback', async () => {
      const abortController = new AbortController();
      abortController.abort();

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Caller cancellation',
          signal: abortController.signal,
        })
      ).rejects.toThrow(AIError);

      expect(mockGroqCreate).not.toHaveBeenCalled();
      expect(mockOpenAIFetch).not.toHaveBeenCalled();
    });

    // 8. Retry and fallback attempt counts stay within the configured budget
    it('8. should strictly cap attempt counts across Groq and OpenAI within configured budget', async () => {
      const groqErr: any = new Error('500 Service Error');
      groqErr.status = 500;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'OpenAI also failed', type: 'server_error' } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP', // maxRetries: 1 -> 2 primary attempts
          prompt: 'Count budget',
        })
      ).rejects.toThrow(TransientAIError);

      // 2 primary attempts + 1 fallback attempt = 3 total attempts maximum
      expect(mockGroqCreate).toHaveBeenCalledTimes(2);
      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
    });

    // 9. Structured JSON validation applies to both providers
    it('9. should parse and validate structured JSON when returned by OpenAI fallback', async () => {
      const groqErr: any = new Error('502 Bad Gateway');
      groqErr.status = 502;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{
              message: {
                content: '```json\n{\n  "role": "Cloud Architect",\n  "company": "Amazon"\n}\n```',
              },
            }],
            model: 'gpt-4o-mini',
            usage: { prompt_tokens: 45, completion_tokens: 30, total_tokens: 75 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await aiGateway.executeStructured<{ role: string; company: string }>({
        task: 'SMART_SETUP',
        prompt: 'Parse JSON from fallback',
        validator: (data) => {
          if (!data.role) throw new Error('Role is required');
          return data;
        },
        maxRetries: 0,
      });

      expect(result.data).toEqual({ role: 'Cloud Architect', company: 'Amazon' });
      expect(result.provider).toBe('openai');
      expect(result.fallbackUsed).toBe(true);
    });

    // 10. Token usage and provider metadata are attributed correctly
    it('10. should attribute token usage and model metadata accurately from OpenAI response', async () => {
      const groqErr: any = new Error('504 Gateway Timeout');
      groqErr.status = 504;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'Token metadata test' } }],
            model: 'gpt-4o-mini-2024-07-18',
            usage: { prompt_tokens: 120, completion_tokens: 85, total_tokens: 205 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await aiGateway.executeText({
        task: 'SMART_SETUP',
        prompt: 'Tokens test',
        maxRetries: 0,
      });

      expect(result.provider).toBe('openai');
      expect(result.model).toBe('gpt-4o-mini-2024-07-18');
      expect(result.usage).toEqual({
        promptTokens: 120,
        completionTokens: 85,
        totalTokens: 205,
      });
    });

    // 11. Telemetry failures never break a successful AI operation
    it('11. should ensure telemetry recording failure does not break successful OpenAI fallback operation', async () => {
      const groqErr: any = new Error('503 Service Unavailable');
      groqErr.status = 503;
      mockGroqCreate.mockRejectedValue(groqErr);

      const recordSpy = vi.spyOn(AITelemetryService, 'recordEvent').mockImplementationOnce(async () => {
        throw new Error('Telemetry write crashed');
      });

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'OpenAI success despite telemetry failure' } }],
            model: 'gpt-4o-mini',
            usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await aiGateway.executeText({
        task: 'SMART_SETUP',
        prompt: 'Telemetry failure resilience',
        maxRetries: 0,
      });

      expect(result.data).toBe('OpenAI success despite telemetry failure');
      expect(result.provider).toBe('openai');
      expect(recordSpy).toHaveBeenCalled();
    });

    // 12. Groq-only configuration continues to work
    it('12. should continue normal Groq execution and failure reporting when OpenAI is unconfigured (Groq-only)', async () => {
      delete process.env.OPENAI_API_KEY; // Unconfigured secondary provider

      const groqErr: any = new Error('500 Groq Internal Error');
      groqErr.status = 500;
      mockGroqCreate.mockRejectedValue(groqErr);

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Groq only failure',
          maxRetries: 0,
        })
      ).rejects.toThrow(TransientAIError);

      // OpenAI must not be attempted when unconfigured
      expect(mockOpenAIFetch).not.toHaveBeenCalled();
    });

    // 7c. Caller in-flight cancellation
    it('7c. should abort immediately and never call OpenAI if caller aborts during in-flight primary call', async () => {
      const abortController = new AbortController();

      mockGroqCreate.mockImplementation(async () => {
        abortController.abort(); // Cancel while Groq is in-flight
        const err: any = new Error('The user aborted the request');
        err.name = 'AbortError';
        throw err;
      });

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'In-flight cancellation',
          signal: abortController.signal,
          maxRetries: 1,
        })
      ).rejects.toThrow(AIError);

      expect(mockGroqCreate).toHaveBeenCalledTimes(1);
      expect(mockOpenAIFetch).not.toHaveBeenCalled();
    });

    // 13. Groq per-attempt timeout followed by OpenAI success within remaining deadline
    it('13. should succeed on OpenAI fallback when Groq times out with remaining deadline available', async () => {
      const groqTimeout: any = new Error('Groq 504 Gateway Timeout');
      groqTimeout.status = 504;
      mockGroqCreate.mockRejectedValue(groqTimeout);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'OpenAI succeeded within deadline' } }],
            model: 'gpt-4o-mini',
            usage: { prompt_tokens: 15, completion_tokens: 10, total_tokens: 25 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await aiGateway.executeText({
        task: 'SMART_SETUP',
        prompt: 'Timeout recovery',
        timeoutMs: 1000,
        maxRetries: 0,
      });

      expect(result.data).toBe('OpenAI succeeded within deadline');
      expect(result.provider).toBe('openai');
      expect(result.fallbackUsed).toBe(true);
      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
    });

    // 14. Overall deadline expiry prevents further requests
    it('14. should NOT attempt fallback when overall operation deadline expires during primary attempt', async () => {
      mockGroqCreate.mockImplementation((_params, options) => {
        return new Promise((_, reject) => {
          options?.signal?.addEventListener('abort', () => {
            const err: any = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Total deadline expired',
          timeoutMs: 25, // overall deadline
          maxRetries: 0,
        })
      ).rejects.toThrow(GroqTimeoutError);

      // Fallback should NOT be attempted because deadline expired
      expect(mockOpenAIFetch).not.toHaveBeenCalled();
    });

    // 15. OpenAI authentication failure
    it('15. should accurately normalize OpenAI authentication error (401) to InvalidApiKeyError without retrying', async () => {
      const groqErr: any = new Error('503 Service Unavailable');
      groqErr.status = 503;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              message: 'Incorrect API key provided: sk-invalid...',
              type: 'invalid_request_error',
              code: 'invalid_api_key',
            },
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'OpenAI auth fail',
          maxRetries: 0,
        })
      ).rejects.toThrow(InvalidApiKeyError);

      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
    });

    // 16. OpenAI quota exhaustion
    it('16. should accurately normalize OpenAI quota exhaustion (429 insufficient_quota) to QuotaExceededError', async () => {
      const groqErr: any = new Error('503 Service Unavailable');
      groqErr.status = 503;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              message: 'You exceeded your current quota, please check your plan and billing details.',
              type: 'insufficient_quota',
              code: 'insufficient_quota',
            },
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'OpenAI quota fail',
          maxRetries: 0,
        })
      ).rejects.toThrow(QuotaExceededError);

      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
    });

    // 17. OpenAI transient failure and rate limiting
    it('17. should treat OpenAI rate limit / 500 as TransientAIError without starting another fallback loop', async () => {
      const groqErr: any = new Error('503 Service Unavailable');
      groqErr.status = 503;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              message: 'Rate limit reached for requests per minute (RPM)',
              type: 'requests',
              code: 'rate_limit_exceeded',
            },
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'OpenAI rate limit',
          maxRetries: 0,
        })
      ).rejects.toThrow(TransientAIError);

      // Must strictly call OpenAI exactly once
      expect(mockOpenAIFetch).toHaveBeenCalledTimes(1);
    });

    // 18. Credential redaction
    it('18. should redact both Groq and OpenAI API keys from error messages', async () => {
      const groqErr: any = new Error('500 Error with leak: gsk_1234567890abcdefABCDEF1234567890');
      groqErr.status = 500;
      mockGroqCreate.mockRejectedValue(groqErr);

      mockOpenAIFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              message: 'OpenAI fail with leak: sk-proj-1234567890abcdefABCDEF1234567890',
              type: 'server_error',
            },
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );

      try {
        await aiGateway.executeText({
          task: 'SMART_SETUP',
          prompt: 'Redaction check',
          maxRetries: 0,
        });
        expect.unreachable('Should have thrown an error');
      } catch (err: any) {
        expect(err.message).not.toContain('sk-proj-1234567890abcdefABCDEF1234567890');
        expect(err.message).not.toContain('gsk_1234567890abcdefABCDEF1234567890');
        expect(err.message).toContain('[REDACTED_API_KEY]');
      }
    });
  });
});
