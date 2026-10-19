/**
 * AI Gateway Concurrency Controller
 *
 * Implements bounded admission control for physical AI provider operations.
 *
 * Limits:
 * - Global maximum concurrent operations.
 * - Per-task concurrency limit.
 * - Per-user concurrency limit (prevents noisy-neighbor starvation).
 * - Bounded FIFO waiting queue with maximum queue size and maximum queue timeout.
 *
 * Safe failure semantics:
 * - Queue overflow or timeout -> normalized AIOverloadError.
 * - Caller cancellation detaches immediately and releases permits safely.
 * - Permits are idempotent and guaranteed to release in finally paths.
 *
 * NOTE: Limits are process-local (in-memory) to this Node.js instance.
 */

import { AIError, AIOverloadError } from '../../errors/aiErrors';

export interface ConcurrencyConfig {
  globalMaxConcurrent?: number;
  userMaxConcurrent?: number;
  queueMaxSize?: number;
  queueTimeoutMs?: number;
}

export interface AcquireOptions {
  task: string;
  userId?: string | null;
  maxTaskConcurrency?: number;
  signal?: AbortSignal;
}

export interface Permit {
  release: () => void;
}

export type ConcurrencyPermit = Permit;

interface QueuedWaiter {
  task: string;
  userId?: string | null;
  maxTaskConcurrency: number;
  signal?: AbortSignal;
  resolve: (permit: Permit) => void;
  reject: (err: any) => void;
  timeoutId: any;
  cleanupSignalListener?: () => void;
}

export interface ConcurrencyStats {
  activeGlobal: number;
  activePerTask: Record<string, number>;
  activePerUser: Record<string, number>;
  queuedRequests: number;
  totalAcquired: number;
  totalReleased: number;
  totalRejections: number;
}

export class ConcurrencyController {
  private static instance: ConcurrencyController | null = null;

  private globalMaxConcurrent: number;
  private userMaxConcurrent: number;
  private queueMaxSize: number;
  private queueTimeoutMs: number;

  private activeGlobalCount = 0;
  private activePerTask: Map<string, number> = new Map();
  private activePerUser: Map<string, number> = new Map();
  private queue: QueuedWaiter[] = [];

  private totalAcquired = 0;
  private totalReleased = 0;
  private totalRejections = 0;

  constructor(config?: ConcurrencyConfig) {
    this.globalMaxConcurrent = this.parsePositiveInt(
      config?.globalMaxConcurrent ?? process.env.AI_MAX_CONCURRENT_REQUESTS,
      10
    );
    this.userMaxConcurrent = this.parsePositiveInt(
      config?.userMaxConcurrent ?? process.env.AI_MAX_CONCURRENT_PER_USER,
      3
    );
    this.queueMaxSize = this.parseNonNegativeInt(
      config?.queueMaxSize ?? process.env.AI_CONCURRENCY_QUEUE_MAX_SIZE,
      10
    );
    this.queueTimeoutMs = this.parseNonNegativeInt(
      config?.queueTimeoutMs ?? process.env.AI_CONCURRENCY_QUEUE_TIMEOUT_MS,
      3000
    );
  }

  static getInstance(): ConcurrencyController {
    if (!ConcurrencyController.instance) {
      ConcurrencyController.instance = new ConcurrencyController();
    }
    return ConcurrencyController.instance;
  }

  static setInstance(instance: ConcurrencyController | null): void {
    ConcurrencyController.instance = instance;
  }

  private parsePositiveInt(val: any, fallback: number): number {
    const num = Number(val);
    return Number.isInteger(num) && num > 0 ? num : fallback;
  }

  private parseNonNegativeInt(val: any, fallback: number): number {
    const num = Number(val);
    return Number.isInteger(num) && num >= 0 ? num : fallback;
  }

  /**
   * Acquires a concurrency permit for a provider operation.
   * If limits are open, returns the permit synchronously to avoid microtask delays.
   * If limits are saturated, queues the request up to queueMaxSize and queueTimeoutMs.
   */
  acquire(options: AcquireOptions): Permit | Promise<Permit> {
    if (options.signal?.aborted) {
      throw new AIError('AI_ABORTED', 'Request was cancelled before acquiring concurrency permit', false);
    }

    const maxTask = options.maxTaskConcurrency && options.maxTaskConcurrency > 0
      ? options.maxTaskConcurrency
      : 5;

    // Check if slot is immediately available
    if (this.canAcquire(options.task, options.userId, maxTask)) {
      return this.grantPermit(options.task, options.userId);
    }

    // Capacity is full; check if queue is also full
    if (this.queue.length >= this.queueMaxSize) {
      this.totalRejections++;
      throw new AIOverloadError(
        `AI concurrency limit reached (${this.activeGlobalCount} active). Queue is full (${this.queue.length}/${this.queueMaxSize}). Please retry shortly.`
      );
    }

    // Enqueue waiter
    return new Promise<Permit>((resolve, reject) => {
      let waiter: QueuedWaiter;

      const timeoutId = setTimeout(() => {
        this.removeWaiter(waiter);
        this.totalRejections++;
        reject(
          new AIOverloadError(
            `AI request queued for too long (${this.queueTimeoutMs}ms) waiting for capacity. Please retry shortly.`
          )
        );
      }, this.queueTimeoutMs);

      let cleanupSignal: (() => void) | undefined;
      if (options.signal) {
        const onAbort = () => {
          clearTimeout(timeoutId);
          this.removeWaiter(waiter);
          reject(new AIError('AI_ABORTED', 'Request was cancelled while waiting for concurrency permit', false));
        };
        options.signal.addEventListener('abort', onAbort, { once: true });
        cleanupSignal = () => options.signal?.removeEventListener('abort', onAbort);
      }

      waiter = {
        task: options.task,
        userId: options.userId,
        maxTaskConcurrency: maxTask,
        signal: options.signal,
        resolve: (permit) => {
          clearTimeout(timeoutId);
          if (cleanupSignal) cleanupSignal();
          resolve(permit);
        },
        reject: (err) => {
          clearTimeout(timeoutId);
          if (cleanupSignal) cleanupSignal();
          reject(err);
        },
        timeoutId,
        cleanupSignalListener: cleanupSignal,
      };

      this.queue.push(waiter);
    });
  }

  private canAcquire(task: string, userId?: string | null, maxTask: number = 5): boolean {
    if (this.activeGlobalCount >= this.globalMaxConcurrent) {
      return false;
    }

    const currentTaskActive = this.activePerTask.get(task) || 0;
    if (currentTaskActive >= maxTask) {
      return false;
    }

    if (userId) {
      const currentUserActive = this.activePerUser.get(userId) || 0;
      if (currentUserActive >= this.userMaxConcurrent) {
        return false;
      }
    }

    return true;
  }

  private grantPermit(task: string, userId?: string | null): Permit {
    this.activeGlobalCount++;
    this.activePerTask.set(task, (this.activePerTask.get(task) || 0) + 1);
    if (userId) {
      this.activePerUser.set(userId, (this.activePerUser.get(userId) || 0) + 1);
    }
    this.totalAcquired++;

    let released = false;
    return {
      release: () => {
        if (released) return;
        released = true;
        this.releasePermit(task, userId);
      },
    };
  }

  private releasePermit(task: string, userId?: string | null): void {
    this.activeGlobalCount = Math.max(0, this.activeGlobalCount - 1);

    const taskCount = (this.activePerTask.get(task) || 1) - 1;
    if (taskCount <= 0) {
      this.activePerTask.delete(task);
    } else {
      this.activePerTask.set(task, taskCount);
    }

    if (userId) {
      const userCount = (this.activePerUser.get(userId) || 1) - 1;
      if (userCount <= 0) {
        this.activePerUser.delete(userId);
      } else {
        this.activePerUser.set(userId, userCount);
      }
    }

    this.totalReleased++;

    // Process next eligible waiter in queue
    this.processQueue();
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    for (let i = 0; i < this.queue.length; i++) {
      const waiter = this.queue[i];

      // Skip aborted waiters
      if (waiter.signal?.aborted) {
        continue;
      }

      if (this.canAcquire(waiter.task, waiter.userId, waiter.maxTaskConcurrency)) {
        this.queue.splice(i, 1);
        const permit = this.grantPermit(waiter.task, waiter.userId);
        waiter.resolve(permit);
        return;
      }
    }
  }

  private removeWaiter(waiter: QueuedWaiter): void {
    const idx = this.queue.indexOf(waiter);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
    }
  }

  getStats(): ConcurrencyStats {
    const activePerTaskObj: Record<string, number> = {};
    for (const [k, v] of this.activePerTask.entries()) {
      activePerTaskObj[k] = v;
    }

    const activePerUserObj: Record<string, number> = {};
    for (const [k, v] of this.activePerUser.entries()) {
      activePerUserObj[k] = v;
    }

    return {
      activeGlobal: this.activeGlobalCount,
      activePerTask: activePerTaskObj,
      activePerUser: activePerUserObj,
      queuedRequests: this.queue.length,
      totalAcquired: this.totalAcquired,
      totalReleased: this.totalReleased,
      totalRejections: this.totalRejections,
    };
  }

  reset(): void {
    for (const waiter of this.queue) {
      clearTimeout(waiter.timeoutId);
      waiter.reject(new AIError('AI_ABORTED', 'Concurrency controller reset', false));
    }
    this.queue = [];
    this.activeGlobalCount = 0;
    this.activePerTask.clear();
    this.activePerUser.clear();
    this.totalAcquired = 0;
    this.totalReleased = 0;
    this.totalRejections = 0;
  }
}

export const concurrencyController = ConcurrencyController.getInstance();
