/**
 * AI Telemetry Service
 *
 * Firestore Collection Documentation:
 * - Collection Name: `ai_usage_events`
 * - Purpose: Internal server-side ledger of AI token usage, request latency, attempt counts,
 *   and status for operational cost monitoring, rate limit auditing, and system observability.
 * - Retention: Operational telemetry only; recommended TTL/retention is 30–90 days.
 * - Access Controls: Server-only write path. Client SDKs have no read or write access.
 *   User attribution is derived strictly from server-verified authentication (Clerk).
 * - Sensitive Data: Never records raw prompts, resume content, interview answers, or credentials.
 */

import { logger } from '../../utils/logger';
import { TelemetryEvent } from './types';

export class AITelemetryService {
  /**
   * Records one usage event per logical gateway operation.
   * Telemetry failures are strictly isolated and will never fail the calling AI operation.
   */
  static async recordEvent(event: TelemetryEvent): Promise<void> {
    try {
      // 1. Structured operational logging
      logger.info({
        event: 'ai.gateway.usage',
        eventType: event.eventType || (event.cacheHit ? 'CACHE_HIT' : event.status === 'SUCCESS' ? 'SUCCESS' : 'ERROR'),
        userId: event.userId,
        task: event.task,
        provider: event.provider,
        model: event.model,
        promptTokens: event.promptTokens,
        completionTokens: event.completionTokens,
        totalTokens: event.totalTokens,
        estimatedCostUsd: event.estimatedCostUsd ?? null,
        durationMs: event.durationMs,
        status: event.status,
        attemptCount: event.attemptCount,
        retryCount: event.retryCount ?? Math.max(0, event.attemptCount - 1),
        fallbackUsed: event.fallbackUsed,
        errorCategory: event.errorCategory,
        cacheHit: Boolean(event.cacheHit),
        coalesced: Boolean(event.coalesced),
        rejectionReason: event.rejectionReason ?? null,
      });

      // 2. Server-side Firestore persistence
      await this.persistToFirestore(event);
    } catch (telemetryErr: any) {
      // Telemetry must never throw or break the primary AI operation
      console.warn('[AITelemetry] Failed to record usage event:', telemetryErr.message || telemetryErr);
    }
  }

  private static async persistToFirestore(event: TelemetryEvent): Promise<void> {
    try {
      // Lazy import db to prevent module-level crash if Firebase Admin credentials are not loaded in tests
      const { db } = await import('../../config/firebaseAdmin');
      if (db && typeof db.collection === 'function') {
        await db.collection('ai_usage_events').add({
          timestamp: event.timestamp,
          eventType: event.eventType || (event.cacheHit ? 'CACHE_HIT' : event.status === 'SUCCESS' ? 'SUCCESS' : 'ERROR'),
          userId: event.userId,
          task: event.task,
          provider: event.provider,
          model: event.model,
          promptTokens: event.promptTokens,
          completionTokens: event.completionTokens,
          totalTokens: event.totalTokens,
          estimatedCostUsd: event.estimatedCostUsd ?? null,
          durationMs: event.durationMs,
          status: event.status,
          attemptCount: event.attemptCount,
          retryCount: event.retryCount ?? Math.max(0, event.attemptCount - 1),
          fallbackUsed: event.fallbackUsed,
          errorCategory: event.errorCategory,
          cacheHit: Boolean(event.cacheHit),
          coalesced: Boolean(event.coalesced),
          rejectionReason: event.rejectionReason ?? null,
        });
      }
    } catch (err: any) {
      // Log warning and suppress so primary AI operation succeeds
      console.warn('[AITelemetry] Firestore write skipped or failed:', err.message || err);
    }
  }
}
