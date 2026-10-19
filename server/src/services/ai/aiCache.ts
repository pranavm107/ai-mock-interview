import crypto from 'crypto';
import { AIError } from '../../errors/aiErrors';

export interface CacheEntry<T = any> {
  data: T;
  rawText: string;
  provider: string;
  model: string;
  usage: any;
  createdAt: number;
  expiresAt: number;
}

export interface CacheKeyOptions {
  model?: string;
  promptVersion?: string;
  userId?: string | null;
  cacheScope?: 'USER' | 'GLOBAL';
}

export interface CoalesceSubscriber<T> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  signal?: AbortSignal;
}

export interface InFlightOperation<T> {
  promise: Promise<T>;
  subscribers: Set<CoalesceSubscriber<T>>;
  abortController: AbortController;
}

export interface CacheStats {
  hits: number;
  misses: number;
  bypasses: number;
  coalesced: number;
  evictions: number;
  size: number;
}

export class AICache {
  private static instance: AICache | null = null;
  private entries: Map<string, CacheEntry> = new Map();
  private inFlightOperations: Map<string, InFlightOperation<any>> = new Map();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;

  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    bypasses: 0,
    coalesced: 0,
    evictions: 0,
    size: 0,
  };

  constructor(maxEntries: number = 200, defaultTtlMs: number = 3600000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  static getInstance(): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache();
    }
    return AICache.instance;
  }

  static setInstance(instance: AICache | null) {
    AICache.instance = instance;
  }

  /**
   * Generates a deterministic, secure cache key.
   * Format: aicache:<task>:<promptVersion>:<scope>:<inputHash>
   * Never includes raw prompts, credentials, or answers.
   */
  generateKey(task: string, inputPayload: string, options?: CacheKeyOptions): string {
    const promptVersion = options?.promptVersion || 'v1.0';
    const scope = options?.cacheScope || 'GLOBAL';
    const userPart = scope === 'USER' && options?.userId ? options.userId : 'global';
    const modelPart = options?.model ? `:${options.model}` : '';

    const inputHash = crypto.createHash('sha256').update(inputPayload).digest('hex').substring(0, 32);

    return `aicache:${task}${modelPart}:${promptVersion}:${userPart}:${inputHash}`;
  }

  /**
   * Look up a valid (non-expired) entry in the cache.
   * Evicts expired entry on access.
   */
  get<T = any>(key: string): CacheEntry<T> | null {
    try {
      const entry = this.entries.get(key);
      if (!entry) {
        this.stats.misses++;
        return null;
      }

      if (Date.now() > entry.expiresAt) {
        this.entries.delete(key);
        this.stats.misses++;
        this.stats.size = this.entries.size;
        return null;
      }

      // Refresh LRU position (delete and re-insert)
      this.entries.delete(key);
      this.entries.set(key, entry);

      this.stats.hits++;
      return entry as CacheEntry<T>;
    } catch (err) {
      // Cache failures must never break execution
      return null;
    }
  }

  /**
   * Store a successful response in the cache with bounded LRU eviction.
   */
  set<T = any>(
    key: string,
    value: Omit<CacheEntry<T>, 'createdAt' | 'expiresAt'>,
    ttlMs?: number
  ): void {
    try {
      const now = Date.now();
      const effectiveTtl = typeof ttlMs === 'number' && ttlMs > 0 ? ttlMs : this.defaultTtlMs;

      // LRU Eviction if full
      if (this.entries.size >= this.maxEntries && !this.entries.has(key)) {
        const oldestKey = this.entries.keys().next().value;
        if (oldestKey) {
          this.entries.delete(oldestKey);
          this.stats.evictions++;
        }
      }

      this.entries.set(key, {
        ...value,
        createdAt: now,
        expiresAt: now + effectiveTtl,
      });

      this.stats.size = this.entries.size;
    } catch (err) {
      // Safe failure: never throw on cache write error
    }
  }

  /**
   * Request coalescing (single-flight deduplication) with subscriber-level cancellation:
   * If an identical request is currently in-flight, return a subscriber promise.
   * A single caller cancelling its request does NOT cancel the underlying request
   * if other callers are still waiting. If all subscribers cancel, the underlying
   * execution is cleanly aborted.
   */
  async coalesce<T>(
    key: string,
    executeFn: (signal: AbortSignal) => Promise<T>,
    callerSignal?: AbortSignal
  ): Promise<T> {
    if (callerSignal?.aborted) {
      throw new AIError('AI_ABORTED', 'Request was cancelled', false);
    }

    let op = this.inFlightOperations.get(key) as InFlightOperation<T> | undefined;

    if (!op) {
      const abortController = new AbortController();
      const subscribers = new Set<CoalesceSubscriber<T>>();

      const promise = (async () => {
        try {
          const result = await executeFn(abortController.signal);
          for (const sub of Array.from(subscribers)) {
            sub.resolve(result);
          }
          return result;
        } catch (err) {
          for (const sub of Array.from(subscribers)) {
            sub.reject(err);
          }
          throw err;
        } finally {
          this.inFlightOperations.delete(key);
        }
      })();
      promise.catch(() => {});

      op = {
        promise,
        subscribers,
        abortController,
      };

      this.inFlightOperations.set(key, op);
    } else {
      this.stats.coalesced++;
    }

    return new Promise<T>((resolve, reject) => {
      const currentOp = op!;
      const subscriber: CoalesceSubscriber<T> = { resolve, reject, signal: callerSignal };
      currentOp.subscribers.add(subscriber);

      let onAbort: (() => void) | null = null;
      if (callerSignal) {
        onAbort = () => {
          currentOp.subscribers.delete(subscriber);
          reject(new AIError('AI_ABORTED', 'Request was cancelled', false));

          // If all subscribers have aborted, abort the underlying execution
          if (currentOp.subscribers.size === 0) {
            currentOp.abortController.abort();
          }
        };
        callerSignal.addEventListener('abort', onAbort, { once: true });
      }

      subscriber.resolve = (val) => {
        if (callerSignal && onAbort) {
          callerSignal.removeEventListener('abort', onAbort);
        }
        resolve(val);
      };

      subscriber.reject = (err) => {
        if (callerSignal && onAbort) {
          callerSignal.removeEventListener('abort', onAbort);
        }
        reject(err);
      };
    });
  }

  hasInFlight(key: string): boolean {
    return this.inFlightOperations.has(key);
  }

  recordBypass(): void {
    this.stats.bypasses++;
  }

  invalidate(key: string): boolean {
    const deleted = this.entries.delete(key);
    this.stats.size = this.entries.size;
    return deleted;
  }

  invalidateUser(userId: string): number {
    let count = 0;
    const prefix = `:${userId}:`;
    for (const key of Array.from(this.entries.keys())) {
      if (key.includes(prefix)) {
        this.entries.delete(key);
        count++;
      }
    }
    this.stats.size = this.entries.size;
    return count;
  }

  invalidateTask(task: string): number {
    let count = 0;
    const prefix = `aicache:${task}:`;
    for (const key of Array.from(this.entries.keys())) {
      if (key.startsWith(prefix)) {
        this.entries.delete(key);
        count++;
      }
    }
    this.stats.size = this.entries.size;
    return count;
  }

  clear(): void {
    this.entries.clear();
    this.inFlightOperations.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      bypasses: 0,
      coalesced: 0,
      evictions: 0,
      size: 0,
    };
  }

  getStats(): CacheStats {
    return { ...this.stats, size: this.entries.size };
  }
}

export const aiCache = AICache.getInstance();
