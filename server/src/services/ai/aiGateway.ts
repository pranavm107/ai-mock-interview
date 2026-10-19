import { LLMProvider } from './providers/llmProvider';
import { GroqProviderAdapter } from './providers/groqAdapter';
import { OpenAIProviderAdapter } from './providers/openaiAdapter';
import { getTaskConfig } from './taskConfig';
import { AIGatewayRequest, AIGatewayResponse, TaskConfig, TokenUsage } from './types';
import { AITelemetryService } from './aiTelemetryService';
import { aiCache, AICache } from './aiCache';
import { QuotaExceededError, InvalidApiKeyError, TransientAIError, AIError, AIOverloadError, AIBudgetExceededError } from '../../errors/aiErrors';
import { GroqTimeoutError } from '../../types/careerErrors';
import { concurrencyController, ConcurrencyController, ConcurrencyPermit } from './concurrencyController';
import { taskBudgetManager, TaskBudgetManager } from './budgetManager';
import { estimateCost } from './costCalculator';

export class AIGateway {
  private static instance: AIGateway | null = null;
  private providers: Map<string, LLMProvider> = new Map();
  private concurrencyController: ConcurrencyController = concurrencyController;
  private budgetManager: TaskBudgetManager = taskBudgetManager;

  constructor() {
    this.registerProvider(new GroqProviderAdapter());
    this.registerProvider(new OpenAIProviderAdapter());
  }

  static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  // Allow test suites to reset or inject custom gateway instances
  static setInstance(instance: AIGateway | null) {
    AIGateway.instance = instance;
  }

  getConcurrencyController(): ConcurrencyController {
    return this.concurrencyController;
  }

  setConcurrencyController(controller: ConcurrencyController) {
    this.concurrencyController = controller;
  }

  getBudgetManager(): TaskBudgetManager {
    return this.budgetManager;
  }

  setBudgetManager(manager: TaskBudgetManager) {
    this.budgetManager = manager;
  }

  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): LLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`AI Provider '${name}' is not registered in the gateway.`);
    }
    return provider;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  private getCache(): AICache {
    return AICache.getInstance();
  }

  /**
   * Main entrypoint: executes an AI request with bounded retries, task-specific config,
   * safe timeouts, error classification, output validation, multi-provider fallback,
   * safe caching with request coalescing, and telemetry.
   */
  async execute<T = any>(request: AIGatewayRequest<T>): Promise<AIGatewayResponse<T>> {
    const taskConfig = getTaskConfig(request.task);
    const cache = this.getCache();
    const isCacheable = Boolean(taskConfig.cacheable);
    const bypassCache = Boolean(request.bypassCache);
    const cacheScope = request.cacheScope || taskConfig.cacheScope || 'GLOBAL';
    const promptVersion = request.promptVersion || taskConfig.promptVersion || 'v1.0';

    const primaryModel = request.model || taskConfig.defaultModel;
    const cacheKey = isCacheable
      ? cache.generateKey(request.task, request.prompt, {
          model: primaryModel,
          promptVersion,
          userId: request.userId,
          cacheScope,
        })
      : null;

    if (isCacheable && !bypassCache && cacheKey) {
      const cached = cache.get<T>(cacheKey);
      if (cached) {
        const estimatedCost = cached.usage
          ? estimateCost(cached.model, cached.usage.promptTokens, cached.usage.completionTokens)
          : null;

        await this.safeRecordTelemetry({
          timestamp: new Date().toISOString(),
          userId: request.userId || 'anonymous',
          task: request.task,
          provider: cached.provider,
          model: cached.model,
          eventType: 'CACHE_HIT',
          promptTokens: cached.usage?.promptTokens ?? null,
          completionTokens: cached.usage?.completionTokens ?? null,
          totalTokens: cached.usage?.totalTokens ?? null,
          estimatedCostUsd: estimatedCost,
          durationMs: 0,
          status: 'SUCCESS',
          attemptCount: 0,
          retryCount: 0,
          fallbackUsed: false,
          errorCategory: null,
          cacheHit: true,
          coalesced: false,
        });

        return {
          data: cached.data,
          rawText: cached.rawText,
          provider: cached.provider,
          model: cached.model,
          usage: cached.usage,
          durationMs: 0,
          attempts: 0,
          retryCount: 0,
          estimatedCostUsd: estimatedCost,
          fallbackUsed: false,
          cached: true,
        };
      }
    } else if (isCacheable && bypassCache) {
      cache.recordBypass();
    }

    const runExecution = async (sharedSignal?: AbortSignal): Promise<AIGatewayResponse<T>> => {
      // 1. Task Budget check (sliding-window rate limit)
      try {
        this.budgetManager.checkAndConsumeBudget(request.task, taskConfig.rateLimitRpm);
      } catch (budgetErr: any) {
        await this.safeRecordTelemetry({
          timestamp: new Date().toISOString(),
          userId: request.userId || 'anonymous',
          task: request.task,
          provider: request.provider || taskConfig.defaultProvider,
          model: request.model || taskConfig.defaultModel,
          eventType: 'REJECTED',
          promptTokens: null,
          completionTokens: null,
          totalTokens: null,
          estimatedCostUsd: null,
          durationMs: 0,
          status: 'ERROR',
          attemptCount: 0,
          retryCount: 0,
          fallbackUsed: false,
          errorCategory: 'BUDGET_EXCEEDED',
          rejectionReason: budgetErr.message,
        });
        throw budgetErr;
      }

      // 2. Execute pipeline (admission control permit acquired inside executePipeline)
      const response = await this.executePipeline<T>(request, taskConfig, sharedSignal);
      if (isCacheable && cacheKey && response.data) {
        cache.set(
          cacheKey,
          {
            data: response.data,
            rawText: response.rawText,
            provider: response.provider,
            model: response.model,
            usage: response.usage,
          },
          taskConfig.cacheTtlMs
        );
      }
      return response;
    };

    if (isCacheable && !bypassCache && cacheKey) {
      return cache.coalesce(
        cacheKey,
        (sharedSignal) => runExecution(sharedSignal),
        request.signal
      );
    }

    return runExecution();
  }

  private async executePipeline<T = any>(
    request: AIGatewayRequest<T>,
    taskConfig: TaskConfig,
    coalescedSignal?: AbortSignal
  ): Promise<AIGatewayResponse<T>> {
    const primaryProviderName = request.provider || taskConfig.defaultProvider;
    const primaryProvider = this.getProvider(primaryProviderName);

    const primaryModel = request.model || taskConfig.defaultModel;
    const fallbackModels = taskConfig.fallbackModels || [];
    const primaryModelCandidates = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];

    const maxRetries = request.maxRetries !== undefined ? request.maxRetries : taskConfig.maxRetries;
    const maxPrimaryAttempts = maxRetries + 1; // Strict bound for primary provider
    const totalTimeoutMs = request.timeoutMs || taskConfig.timeoutMs || 15000;
    const outputMode = request.outputMode || taskConfig.outputMode;
    const maxTokens = request.maxTokens || taskConfig.maxTokens;
    const temperature = request.temperature !== undefined ? request.temperature : (taskConfig.temperature ?? 0.1);

    const effectiveSignal = coalescedSignal || request.signal;
    if (effectiveSignal?.aborted) {
      throw new AIError('AI_ABORTED', 'Request was cancelled', false);
    }

    // Acquire concurrency admission permit before touching providers
    let permit: ConcurrencyPermit;
    try {
      const permitOrPromise = this.concurrencyController.acquire({
        task: request.task,
        userId: request.userId,
        maxTaskConcurrency: taskConfig.maxConcurrency,
        signal: effectiveSignal,
      });
      permit = permitOrPromise instanceof Promise ? await permitOrPromise : permitOrPromise;
    } catch (acquireErr: any) {
      if (acquireErr instanceof AIOverloadError) {
        await this.safeRecordTelemetry({
          timestamp: new Date().toISOString(),
          userId: request.userId || 'anonymous',
          task: request.task,
          provider: primaryProviderName,
          model: primaryModel,
          eventType: 'REJECTED',
          promptTokens: null,
          completionTokens: null,
          totalTokens: null,
          estimatedCostUsd: null,
          durationMs: 0,
          status: 'ERROR',
          attemptCount: 0,
          retryCount: 0,
          fallbackUsed: false,
          errorCategory: 'OVERLOAD',
          rejectionReason: acquireErr.message,
        });
      }
      throw acquireErr;
    }

    try {
      const startTime = Date.now();
      let totalAttempts = 0;
      let lastError: any = null;
      let errorCategory: string | null = null;
      let usedProvider = primaryProviderName;
      let usedModel = primaryModel;
      let fallbackUsed = false;
      let responseUsage: TokenUsage = { promptTokens: null, completionTokens: null, totalTokens: null };

      // ----------------------------------------------------
      // PHASE 1: Primary Provider Execution with Model Fallbacks
      // ----------------------------------------------------
      let primarySucceeded = false;
      let primaryResult: any = null;
      let primaryRawText = '';

      for (const currentModel of primaryModelCandidates) {
        usedModel = currentModel;
        fallbackUsed = currentModel !== primaryModel;

        while (totalAttempts < maxPrimaryAttempts) {
          const elapsedMs = Date.now() - startTime;
          const remainingMs = totalTimeoutMs - elapsedMs;
          if (remainingMs <= 0) {
            errorCategory = 'TIMEOUT';
            lastError = new GroqTimeoutError(`AI Gateway call timed out after ${totalTimeoutMs}ms.`);
            break;
          }

          totalAttempts++;
          const abortController = new AbortController();
          let timedOut = false;

          const onCallerAbort = () => abortController.abort();
          if (effectiveSignal) {
            effectiveSignal.addEventListener('abort', onCallerAbort, { once: true });
          }

          const timeoutHandle = setTimeout(() => {
            timedOut = true;
            abortController.abort();
          }, remainingMs);

          try {
            const rawResponse = await primaryProvider.complete({
              model: currentModel,
              prompt: request.prompt,
              systemPrompt: request.systemPrompt,
              maxTokens,
              temperature,
              outputMode,
              signal: abortController.signal,
            });

            clearTimeout(timeoutHandle);
            if (effectiveSignal) {
              effectiveSignal.removeEventListener('abort', onCallerAbort);
            }

            responseUsage = rawResponse.usage;
            usedModel = rawResponse.model || currentModel;
            primaryRawText = rawResponse.text;

            // Process and validate output
            primaryResult = this.parseAndValidateOutput(rawResponse.text, outputMode, request.validator);
            primarySucceeded = true;
            break;
          } catch (err: any) {
            clearTimeout(timeoutHandle);
            if (effectiveSignal) {
              effectiveSignal.removeEventListener('abort', onCallerAbort);
            }
            lastError = err;

            if (timedOut) {
              errorCategory = 'TIMEOUT';
              lastError = new GroqTimeoutError(`AI Gateway call timed out after ${totalTimeoutMs}ms.`);
            } else if (effectiveSignal?.aborted) {
              errorCategory = 'ABORTED';
              lastError = new AIError('AI_ABORTED', 'Request was cancelled', false);
            } else {
              errorCategory = this.classifyError(err);
            }

            // 1. Fail fast without retries on non-transient client/auth/abort errors
            if (
              errorCategory === 'AUTH_ERROR' ||
              errorCategory === 'CLIENT_ERROR' ||
              errorCategory === 'ABORTED'
            ) {
              break; // Do not retry this model or further primary attempts
            }

            // 2. On 429 quota exhaustion, fail fast without retry loops on primary
            if (errorCategory === 'QUOTA_EXHAUSTED') {
              break;
            }

            // 3. For transient errors, bounded backoff if primary attempts remain
            if (totalAttempts < maxPrimaryAttempts) {
              const backoffMs = Math.min(1000 * Math.pow(2, totalAttempts - 1), 2500) + Math.random() * 200;
              await new Promise(resolve => setTimeout(resolve, backoffMs));
            } else {
              break;
            }
          }
        }

        if (primarySucceeded) {
          break;
        }

        // If non-retryable client error or abort, break primary model loop
        if (
          errorCategory === 'AUTH_ERROR' ||
          errorCategory === 'CLIENT_ERROR' ||
          errorCategory === 'QUOTA_EXHAUSTED' ||
          errorCategory === 'ABORTED'
        ) {
          break;
        }

        if (totalAttempts >= maxPrimaryAttempts) {
          break;
        }
      }

      if (primarySucceeded) {
        const durationMs = Date.now() - startTime;
        const retryCount = Math.max(0, totalAttempts - 1);
        const estimatedCostUsd = estimateCost(usedModel, responseUsage.promptTokens, responseUsage.completionTokens);
        this.budgetManager.evaluateTokenCeiling(request.task, responseUsage.totalTokens, taskConfig.tokenBudgetPerCall);

        await this.safeRecordTelemetry({
          timestamp: new Date().toISOString(),
          userId: request.userId || 'anonymous',
          task: request.task,
          provider: primaryProviderName,
          model: usedModel,
          eventType: 'SUCCESS',
          promptTokens: responseUsage.promptTokens,
          completionTokens: responseUsage.completionTokens,
          totalTokens: responseUsage.totalTokens,
          estimatedCostUsd,
          durationMs,
          status: 'SUCCESS',
          attemptCount: totalAttempts,
          retryCount,
          fallbackUsed,
          errorCategory: null,
        });

        return {
          data: primaryResult as T,
          rawText: primaryRawText,
          provider: primaryProviderName,
          model: usedModel,
          usage: responseUsage,
          durationMs,
          attempts: totalAttempts,
          retryCount,
          estimatedCostUsd,
          fallbackUsed,
          cached: false,
        };
      }

      // ----------------------------------------------------
      // PHASE 2: Secondary Provider Fallback
      // ----------------------------------------------------
      const fallbackProviderName = request.fallbackProvider !== undefined ? request.fallbackProvider : taskConfig.fallbackProvider;
      const isEligibleForProviderFallback =
        Boolean(fallbackProviderName) &&
        fallbackProviderName !== primaryProviderName &&
        this.hasProvider(fallbackProviderName!) &&
        errorCategory !== 'CLIENT_ERROR' &&
        errorCategory !== 'ABORTED' &&
        errorCategory !== 'AUTH_ERROR' &&
        errorCategory !== 'OVERLOAD' &&
        errorCategory !== 'BUDGET_EXCEEDED'; // Do not fallback on permanent primary credential failure or system admission limits

      if (isEligibleForProviderFallback) {
        const fallbackProvider = this.getProvider(fallbackProviderName!);
        if (fallbackProvider.isConfigured?.()) {
          const elapsedMs = Date.now() - startTime;
          const remainingMs = totalTimeoutMs - elapsedMs;

          if (remainingMs <= 0) {
            errorCategory = 'TIMEOUT';
            lastError = new GroqTimeoutError(`AI Gateway operation timed out after ${totalTimeoutMs}ms before fallback.`);
          } else {
            totalAttempts++;
            usedProvider = fallbackProviderName!;
            usedModel = request.fallbackProviderModel || taskConfig.fallbackProviderModel || 'gpt-4o-mini';
            fallbackUsed = true;

            const abortController = new AbortController();
            let timedOut = false;

            const onCallerAbort = () => abortController.abort();
            if (effectiveSignal) {
              effectiveSignal.addEventListener('abort', onCallerAbort, { once: true });
            }

            const timeoutHandle = setTimeout(() => {
              timedOut = true;
              abortController.abort();
            }, remainingMs);

            try {
              const rawResponse = await fallbackProvider.complete({
                model: usedModel,
                prompt: request.prompt,
                systemPrompt: request.systemPrompt,
                maxTokens,
                temperature,
                outputMode,
                signal: abortController.signal,
              });

              clearTimeout(timeoutHandle);
              if (effectiveSignal) {
                effectiveSignal.removeEventListener('abort', onCallerAbort);
              }

              responseUsage = rawResponse.usage;
              usedModel = rawResponse.model || usedModel;

              const processedData = this.parseAndValidateOutput(rawResponse.text, outputMode, request.validator);
              const durationMs = Date.now() - startTime;
              const retryCount = Math.max(0, totalAttempts - 1);
              const estimatedCostUsd = estimateCost(usedModel, responseUsage.promptTokens, responseUsage.completionTokens);
              this.budgetManager.evaluateTokenCeiling(request.task, responseUsage.totalTokens, taskConfig.tokenBudgetPerCall);

              await this.safeRecordTelemetry({
                timestamp: new Date().toISOString(),
                userId: request.userId || 'anonymous',
                task: request.task,
                provider: usedProvider,
                model: usedModel,
                eventType: 'SUCCESS',
                promptTokens: responseUsage.promptTokens,
                completionTokens: responseUsage.completionTokens,
                totalTokens: responseUsage.totalTokens,
                estimatedCostUsd,
                durationMs,
                status: 'SUCCESS',
                attemptCount: totalAttempts,
                retryCount,
                fallbackUsed: true,
                errorCategory: null,
              });

              return {
                data: processedData as T,
                rawText: rawResponse.text,
                provider: usedProvider,
                model: usedModel,
                usage: responseUsage,
                durationMs,
                attempts: totalAttempts,
                retryCount,
                estimatedCostUsd,
                fallbackUsed: true,
                cached: false,
              };
            } catch (fbErr: any) {
              clearTimeout(timeoutHandle);
              if (effectiveSignal) {
                effectiveSignal.removeEventListener('abort', onCallerAbort);
              }
              lastError = fbErr;

              if (timedOut) {
                errorCategory = 'TIMEOUT';
                lastError = new GroqTimeoutError(`AI Gateway fallback call timed out after ${totalTimeoutMs}ms.`);
              } else if (effectiveSignal?.aborted) {
                errorCategory = 'ABORTED';
                lastError = new AIError('AI_ABORTED', 'Request was cancelled', false);
              } else {
                errorCategory = this.classifyError(fbErr);
              }
            }
          }
        }
      }

      // ----------------------------------------------------
      // All attempts failed: Record Failure Telemetry & Throw Normalized Error
      // ----------------------------------------------------
      const durationMs = Date.now() - startTime;
      const retryCount = Math.max(0, totalAttempts - 1);

      await this.safeRecordTelemetry({
        timestamp: new Date().toISOString(),
        userId: request.userId || 'anonymous',
        task: request.task,
        provider: usedProvider,
        model: usedModel,
        eventType: 'ERROR',
        promptTokens: responseUsage.promptTokens,
        completionTokens: responseUsage.completionTokens,
        totalTokens: responseUsage.totalTokens,
        estimatedCostUsd: null,
        durationMs,
        status: 'ERROR',
        attemptCount: totalAttempts,
        retryCount,
        fallbackUsed,
        errorCategory: errorCategory || 'UNKNOWN',
      });

      throw this.normalizeError(lastError, errorCategory);
    } finally {
      permit.release();
    }
  }

  /**
   * Helper for structured JSON requests
   */
  async executeStructured<T = any>(
    request: Omit<AIGatewayRequest<T>, 'outputMode'>
  ): Promise<AIGatewayResponse<T>> {
    return this.execute<T>({
      ...request,
      outputMode: 'json',
    });
  }

  /**
   * Helper for plain text requests
   */
  async executeText(
    request: Omit<AIGatewayRequest<string>, 'outputMode'>
  ): Promise<AIGatewayResponse<string>> {
    return this.execute<string>({
      ...request,
      outputMode: 'text',
    });
  }

  private parseAndValidateOutput<T>(
    text: string,
    outputMode: 'text' | 'json',
    validator?: (parsed: any) => T
  ): T {
    let processedData: any = text;

    if (outputMode === 'json') {
      let jsonText = text.trim();
      if (jsonText.startsWith('```')) {
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          jsonText = match[1].trim();
        }
      }

      try {
        processedData = JSON.parse(jsonText);
      } catch (parseErr: any) {
        throw new Error(`JSON_PARSE_ERROR: Failed to parse AI JSON response: ${parseErr.message}`);
      }
    }

    if (validator) {
      try {
        processedData = validator(processedData);
      } catch (valErr: any) {
        throw new Error(`VALIDATION_ERROR: ${valErr.message}`);
      }
    }

    return processedData as T;
  }

  private async safeRecordTelemetry(event: any): Promise<void> {
    try {
      await AITelemetryService.recordEvent(event);
    } catch (telemetryErr: any) {
      console.warn('[AI Gateway] Telemetry record failed:', telemetryErr.message || telemetryErr);
    }
  }

  private sanitizeMessage(msg: string): string {
    if (!msg) return '';
    return msg
      .replace(/gsk_[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]')
      .replace(/sk-[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]');
  }

  private classifyError(error: any): string {
    if (error instanceof AIOverloadError) return 'OVERLOAD';
    if (error instanceof AIBudgetExceededError) return 'BUDGET_EXCEEDED';
    if (error instanceof GroqTimeoutError) return 'TIMEOUT';
    if (error instanceof QuotaExceededError) return 'QUOTA_EXHAUSTED';
    if (error instanceof InvalidApiKeyError) return 'AUTH_ERROR';

    const status = error.status || error.statusCode;
    const msg = (error.message || '').toLowerCase();
    const code = (error.code || '').toLowerCase();
    const type = (error.type || '').toLowerCase();

    if (error.name === 'AbortError' || msg.includes('abort')) {
      if (msg.includes('timeout') || msg.includes('timed out')) {
        return 'TIMEOUT';
      }
      return 'ABORTED';
    }
    if (status === 504 || msg.includes('timeout') || msg.includes('timed out') || code.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (
      status === 401 ||
      status === 403 ||
      code === 'invalid_api_key' ||
      code.includes('auth') ||
      msg.includes('unauthorized') ||
      msg.includes('authentication failed') ||
      msg.includes('invalid api key') ||
      msg.includes('incorrect api key') ||
      (msg.includes('api key') && !msg.includes('[redacted_api_key]'))
    ) {
      return 'AUTH_ERROR';
    }
    if (status === 400 || status === 404 || msg.includes('bad request')) {
      return 'CLIENT_ERROR';
    }
    if (status === 429 || msg.includes('quota') || msg.includes('rate limit') || msg.includes('429') || code.includes('rate_limit')) {
      if (
        msg.includes('quota') ||
        msg.includes('daily limit') ||
        msg.includes('insufficient_quota') ||
        msg.includes('exceeded your current quota') ||
        code.includes('quota') ||
        type.includes('quota')
      ) {
        return 'QUOTA_EXHAUSTED';
      }
      return 'RATE_LIMIT';
    }
    if (msg.includes('json_parse_error') || msg.includes('validation_error')) {
      return 'VALIDATION_ERROR';
    }
    if (status >= 500 && status < 600) {
      return 'SERVER_ERROR';
    }
    if (msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('network') || msg.includes('fetch failed')) {
      return 'NETWORK_ERROR';
    }
    return 'UNKNOWN';
  }

  private normalizeError(error: any, category: string | null): Error {
    const rawMessage = error?.message || 'AI request failed.';
    const sanitizedMsg = this.sanitizeMessage(rawMessage);

    if (error instanceof GroqTimeoutError) {
      error.message = sanitizedMsg;
      return error;
    }
    if (error instanceof AIError) {
      error.message = sanitizedMsg;
      return error;
    }

    switch (category) {
      case 'OVERLOAD':
        return new AIOverloadError(sanitizedMsg);
      case 'BUDGET_EXCEEDED':
        return new AIBudgetExceededError(sanitizedMsg);
      case 'TIMEOUT':
        return new GroqTimeoutError(sanitizedMsg);
      case 'QUOTA_EXHAUSTED':
        return new QuotaExceededError(
          'AI service is temporarily unavailable because the API quota has been reached. Please try again later.'
        );
      case 'AUTH_ERROR':
        return new InvalidApiKeyError('Authentication failed with the AI provider.');
      case 'CLIENT_ERROR':
        return new AIError('AI_CLIENT_ERROR', sanitizedMsg, false);
      case 'VALIDATION_ERROR':
        return new AIError('AI_VALIDATION_ERROR', sanitizedMsg, false);
      default:
        return new TransientAIError(sanitizedMsg);
    }
  }
}

export const aiGateway = AIGateway.getInstance();
