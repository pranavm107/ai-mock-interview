import { db } from '../../config/firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { CodingIntegritySession, CodingIntegritySessionStatus } from '../../types/coding';
import * as crypto from 'crypto';

const MAX_STRIKES = 3;
const MAX_RECENT_SIGNALS = 10; // Keep bounding small

const VALID_SIGNAL_TYPES = new Set([
  'TAB_SWITCH',
  'WINDOW_BLUR',
  'FULLSCREEN_EXIT',
  'NAVIGATION_ATTEMPT'
]);

export const integrityService = {
  createSession: async (userId: string, problemId: string, language: string, mode: string) => {
    if (mode !== 'INTEGRITY') {
      throw new Error('Only INTEGRITY mode requires an integrity session');
    }

    const sessionId = crypto.randomUUID();
    const sessionRef = db.collection('codingIntegritySessions').doc(sessionId);

    const newSession: CodingIntegritySession = {
      sessionId,
      userId,
      problemId,
      language,
      mode,
      status: 'ACTIVE',
      strikeCount: 0,
      maxStrikes: MAX_STRIKES,
      recentSignalIds: [],
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
    };

    await sessionRef.set(newSession);

    return {
      sessionId,
      status: 'ACTIVE',
      strikeCount: 0,
      maxStrikes: MAX_STRIKES
    };
  },

  getSession: async (sessionId: string, userId: string) => {
    const sessionRef = db.collection('codingIntegritySessions').doc(sessionId);
    const snapshot = await sessionRef.get();
    
    if (!snapshot.exists) {
      throw new Error('SESSION_NOT_FOUND');
    }
    
    const data = snapshot.data() as CodingIntegritySession;
    if (data.userId !== userId) {
      throw new Error('SESSION_ACCESS_DENIED');
    }

    return {
      sessionId: data.sessionId,
      status: data.status,
      strikeCount: data.strikeCount,
      maxStrikes: data.maxStrikes
    };
  },

  processSignal: async (sessionId: string, userId: string, signalId: string, type: string) => {
    if (!VALID_SIGNAL_TYPES.has(type)) {
      throw new Error('INVALID_SIGNAL');
    }

    const sessionRef = db.collection('codingIntegritySessions').doc(sessionId);

    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(sessionRef);
      if (!snapshot.exists) {
        throw new Error('SESSION_NOT_FOUND');
      }

      const data = snapshot.data() as CodingIntegritySession;

      if (data.userId !== userId) {
        throw new Error('SESSION_ACCESS_DENIED');
      }

      if (data.status === 'TERMINATED' || data.status === 'ENDED') {
        // Return current state without incrementing
        return {
          signalAccepted: false,
          duplicate: false,
          session: {
            sessionId: data.sessionId,
            status: data.status,
            strikeCount: data.strikeCount,
            maxStrikes: data.maxStrikes
          }
        };
      }

      if (data.recentSignalIds && data.recentSignalIds.includes(signalId)) {
        // Duplicate signal
        return {
          signalAccepted: false,
          duplicate: true,
          session: {
            sessionId: data.sessionId,
            status: data.status,
            strikeCount: data.strikeCount,
            maxStrikes: data.maxStrikes
          }
        };
      }

      // Valid signal, increment strike
      const newStrikeCount = Math.min(data.strikeCount + 1, data.maxStrikes);
      const newStatus: CodingIntegritySessionStatus = newStrikeCount >= data.maxStrikes ? 'TERMINATED' : 'ACTIVE';
      const recentSignalIds = [...(data.recentSignalIds || []), signalId].slice(-MAX_RECENT_SIGNALS);

      const updates: Partial<CodingIntegritySession> = {
        strikeCount: newStrikeCount,
        status: newStatus,
        recentSignalIds,
        updatedAt: FieldValue.serverTimestamp() as Timestamp,
        lastProcessedSignalId: signalId,
        lastProcessedSignalAt: FieldValue.serverTimestamp() as Timestamp,
      };

      if (newStatus === 'TERMINATED') {
        updates.terminatedAt = FieldValue.serverTimestamp() as Timestamp;
      }

      transaction.update(sessionRef, updates);

      return {
        signalAccepted: true,
        duplicate: false,
        session: {
          sessionId: data.sessionId,
          status: newStatus,
          strikeCount: newStrikeCount,
          maxStrikes: data.maxStrikes
        }
      };
    });
  },

  endSession: async (sessionId: string, userId: string) => {
    const sessionRef = db.collection('codingIntegritySessions').doc(sessionId);

    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(sessionRef);
      if (!snapshot.exists) {
        throw new Error('SESSION_NOT_FOUND');
      }

      const data = snapshot.data() as CodingIntegritySession;

      if (data.userId !== userId) {
        throw new Error('SESSION_ACCESS_DENIED');
      }

      let finalStatus = data.status;

      if (data.status !== 'TERMINATED') {
        finalStatus = 'ENDED';
        transaction.update(sessionRef, {
          status: 'ENDED',
          updatedAt: FieldValue.serverTimestamp() as Timestamp
        });
      }

      return {
        sessionId: data.sessionId,
        status: finalStatus,
        strikeCount: data.strikeCount,
        maxStrikes: data.maxStrikes
      };
    });
  }
};
