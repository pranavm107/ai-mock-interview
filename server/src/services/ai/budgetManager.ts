/**
 * Task Budget Manager
 *
 * Implements process-local per-task usage budgets and token ceilings.
 *
 * Capabilities:
 * - Sliding-window rate budget (requests per minute) per task.
 * - Token budget verification against provider-reported usage.
 * - Deterministic, normalized AIBudgetExceededError when limits are saturated.
 *
 * NOTE: Limits are process-local to this Node.js instance. In distributed deployments,
 * each instance enforces its local budget independently unless a distributed store is provided.
 */

import { AIBudgetExceededError } from '../../errors/aiErrors';
import { logger } from '../../utils/logger';

export class TaskBudgetManager {
  private static instance: TaskBudgetManager | null = null;

  // Stores timestamps (in ms) of requests executed in the last 60 seconds per task
  private taskRequestWindows: Map<string, number[]> = new Map();
  private taskBudgetLimits: Map<string, number> = new Map();

  static getInstance(): TaskBudgetManager {
    if (!TaskBudgetManager.instance) {
      TaskBudgetManager.instance = new TaskBudgetManager();
    }
    return TaskBudgetManager.instance;
  }

  static setInstance(instance: TaskBudgetManager | null): void {
    TaskBudgetManager.instance = instance;
  }

  /**
   * Verifies if the requested task is within its requests-per-minute budget.
   * If within budget, records this request and returns.
   * If over budget, throws AIBudgetExceededError.
   */
  checkAndConsumeBudget(task: string, maxRpm?: number): void {
    if (typeof maxRpm !== 'number' || maxRpm <= 0) {
      return; // No rate budget configured for this task
    }

    this.taskBudgetLimits.set(task, maxRpm);

    const now = Date.now();
    const windowStart = now - 60000; // 1 minute sliding window

    const timestamps = this.taskRequestWindows.get(task) || [];
    // Filter out timestamps older than 60 seconds
    const activeTimestamps = timestamps.filter((t) => t > windowStart);

    if (activeTimestamps.length >= maxRpm) {
      throw new AIBudgetExceededError(
        `AI usage budget exceeded for task '${task}'. Limit is ${maxRpm} requests per minute (${activeTimestamps.length} executed in last 60s). Please slow down.`
      );
    }

    activeTimestamps.push(now);
    this.taskRequestWindows.set(task, activeTimestamps);
  }

  /**
   * Evaluates provider-reported token usage against task-level token ceilings.
   * Logs an alert if usage exceeds the soft budget ceiling without breaking the request.
   */
  evaluateTokenCeiling(
    task: string,
    totalTokens: number | null,
    tokenCeiling?: number
  ): { exceeded: boolean; actual: number | null; ceiling: number | null } {
    if (
      typeof tokenCeiling !== 'number' ||
      tokenCeiling <= 0 ||
      totalTokens === null ||
      typeof totalTokens !== 'number'
    ) {
      return { exceeded: false, actual: totalTokens, ceiling: tokenCeiling ?? null };
    }

    const exceeded = totalTokens > tokenCeiling;
    if (exceeded) {
      logger.warn({
        event: 'ai.budget.token_ceiling_exceeded',
        task,
        actualTokens: totalTokens,
        tokenCeiling,
        message: `AI task '${task}' consumed ${totalTokens} tokens, exceeding configured ceiling of ${tokenCeiling}.`,
      });
    }

    return { exceeded, actual: totalTokens, ceiling: tokenCeiling };
  }

  getTaskUsage(task: string, maxRpm?: number): { requestCountLastMinute: number; budgetRpm: number | null } {
    const now = Date.now();
    const windowStart = now - 60000;
    const timestamps = this.taskRequestWindows.get(task) || [];
    const activeTimestamps = timestamps.filter((t) => t > windowStart);
    return {
      requestCountLastMinute: activeTimestamps.length,
      budgetRpm: maxRpm ?? this.taskBudgetLimits.get(task) ?? null,
    };
  }

  reset(): void {
    this.taskRequestWindows.clear();
    this.taskBudgetLimits.clear();
  }
}

export const taskBudgetManager = TaskBudgetManager.getInstance();
