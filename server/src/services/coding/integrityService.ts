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
  'NAVIGATION_ATTEMPT',
  'COPY_DETECTED',
  'PASTE_DETECTED',
  'CUT_DETECTED',
  'TAB_RETURN',
  'WINDOW_FOCUS',
  'LARGE_CODE_INSERTION'
]);

const AUDIT_ONLY_SIGNAL_TYPES = new Set([
  'COPY_DETECTED',
  'PASTE_DETECTED',
  'CUT_DETECTED',
  'TAB_RETURN',
  'WINDOW_FOCUS',
  'LARGE_CODE_INSERTION'
]);

export const integrityService = {
  createSession: async (userId: string, problemId: string, language: string, mode: string) => {
    if (mode !== 'INTEGRITY') {
      throw new Error('Only INTEGRITY mode requires an integrity session');
    }

    const sessionId = crypto.randomUUID();
    const sessionRef = db.collection('codingIntegritySessions').doc(sessionId);
    const lockRef = db.collection('codingActiveSessionLocks').doc(userId);

    return await db.runTransaction(async (transaction) => {
      // 1. Read Lock
      const lockDoc = await transaction.get(lockRef);
      
      let existingActiveSessionId = null;
      if (lockDoc.exists) {
        const lockData = lockDoc.data();
        if (lockData && lockData.activeSessionId) {
          // 2. Read Existing Session to verify if it's truly active
          const existingSessionRef = db.collection('codingIntegritySessions').doc(lockData.activeSessionId);
          const existingSessionDoc = await transaction.get(existingSessionRef);
          
          if (existingSessionDoc.exists) {
            const existingSession = existingSessionDoc.data() as CodingIntegritySession;
            if (existingSession.status === 'ACTIVE') {
              existingActiveSessionId = lockData.activeSessionId;
            }
          }
        }
      }

      if (existingActiveSessionId) {
        throw new Error(`ACTIVE_SESSION_CONFLICT:${existingActiveSessionId}`);
      }

      const serverTime = FieldValue.serverTimestamp() as Timestamp;

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
        createdAt: serverTime,
        updatedAt: serverTime,
        lastHeartbeatAt: serverTime,
      };

      // 3. Write Session
      transaction.set(sessionRef, newSession);
      
      // 4. Write Lock
      transaction.set(lockRef, {
        activeSessionId: sessionId,
        updatedAt: serverTime
      });

      return {
        sessionId,
        status: 'ACTIVE',
        strikeCount: 0,
        maxStrikes: MAX_STRIKES
      };
    });
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

    let isStale = false;
    if (data.status === 'ACTIVE' && data.lastHeartbeatAt) {
      const now = Date.now();
      const lastHb = data.lastHeartbeatAt.toMillis();
      if (now - lastHb > 90000) { // 90 seconds threshold
        isStale = true;
      }
    }

    return {
      sessionId: data.sessionId,
      status: data.status,
      strikeCount: data.strikeCount,
      maxStrikes: data.maxStrikes,
      lastHeartbeatAt: data.lastHeartbeatAt?.toDate().toISOString(),
      isStale
    };
  },

  heartbeatSession: async (sessionId: string, userId: string) => {
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

      if (data.status !== 'ACTIVE') {
        throw new Error('SESSION_NOT_ACTIVE');
      }

      const serverTime = FieldValue.serverTimestamp() as Timestamp;

      transaction.update(sessionRef, {
        lastHeartbeatAt: serverTime,
        updatedAt: serverTime
      });

      return {
        sessionId: data.sessionId,
        status: data.status,
        strikeCount: data.strikeCount,
        maxStrikes: data.maxStrikes,
        lastHeartbeatAt: new Date().toISOString(), // client representation, real is serverTime
        isStale: false
      };
    });
  },

  processSignal: async (sessionId: string, userId: string, signalId: string, type: string, occurredAt?: string, metadata?: Record<string, any>) => {
    if (!VALID_SIGNAL_TYPES.has(type)) {
      throw new Error('INVALID_SIGNAL');
    }

    const sessionRef = db.collection('codingIntegritySessions').doc(sessionId);
    const lockRef = db.collection('codingActiveSessionLocks').doc(userId);

    return await db.runTransaction(async (transaction) => {
      const lockDoc = await transaction.get(lockRef);
      const snapshot = await transaction.get(sessionRef);
      if (!snapshot.exists) {
        throw new Error('SESSION_NOT_FOUND');
      }

      const data = snapshot.data() as CodingIntegritySession;

      if (data.userId !== userId) {
        throw new Error('SESSION_ACCESS_DENIED');
      }

      if (data.status === 'TERMINATED' || data.status === 'ENDED') {
        // C17 Recovery: Release lock if it was leaked
        if (lockDoc.exists && lockDoc.data()?.activeSessionId === sessionId) {
          transaction.delete(lockRef);
        }
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

      // Distributed Replay Protection: Check if the event document already exists
      const eventId = `${sessionId}_${signalId}`; // Idempotency key
      const eventRef = sessionRef.collection('events').doc(eventId);
      const eventDoc = await transaction.get(eventRef);

      if (eventDoc.exists || (data.recentSignalIds && data.recentSignalIds.includes(signalId))) {
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

      // Determine if this signal type increments strikes
      const isAuditOnly = AUDIT_ONLY_SIGNAL_TYPES.has(type);
      const newStrikeCount = isAuditOnly ? data.strikeCount : Math.min(data.strikeCount + 1, data.maxStrikes);
      const newStatus: CodingIntegritySessionStatus = newStrikeCount >= data.maxStrikes ? 'TERMINATED' : 'ACTIVE';
      const recentSignalIds = [...(data.recentSignalIds || []), signalId].slice(-MAX_RECENT_SIGNALS);

      const serverTime = FieldValue.serverTimestamp() as Timestamp;

      const updates: Partial<CodingIntegritySession> = {
        strikeCount: newStrikeCount,
        status: newStatus,
        recentSignalIds,
        updatedAt: serverTime,
        lastProcessedSignalId: signalId,
        lastProcessedSignalAt: serverTime,
      };

      if (newStatus === 'TERMINATED') {
        updates.terminatedAt = serverTime;
        if (lockDoc.exists && lockDoc.data()?.activeSessionId === sessionId) {
          transaction.delete(lockRef);
        }
      }

      transaction.update(sessionRef, updates);

      // C10: Atomically write the ledger event
      
      const eventPayload: any = {
        eventId,
        sessionId,
        userId,
        type,
        receivedAt: serverTime,
        strikeCountAtEvent: newStrikeCount,
        sessionStatusAtEvent: newStatus,
      };
      
      if (occurredAt) eventPayload.occurredAt = occurredAt;
      if (metadata) {
        // Filter out complex objects to prevent unbounded data and limit string sizes
        const safeMeta: any = {};
        for (const [k, v] of Object.entries(metadata)) {
          if (typeof v === 'string') {
            safeMeta[k] = v.substring(0, 500); // Limit string lengths to 500 chars
          } else if (typeof v === 'number' || typeof v === 'boolean') {
            safeMeta[k] = v;
          }
        }
        eventPayload.metadata = safeMeta;
      }

      transaction.set(eventRef, eventPayload);

      // C11: Atomically create a malpractice record if the session is terminated
      if (newStatus === 'TERMINATED') {
        const recordId = `incident_${sessionId}`;
        const recordRef = db.collection('codingMalpracticeRecords').doc(recordId);
        
        // We link it to the final event and the recent signals as evidence (mapping signalIds to full eventIds)
        const evidenceEventIds = recentSignalIds.map(sid => `${sessionId}_${sid}`);
        if (!evidenceEventIds.includes(eventId)) {
          evidenceEventIds.push(eventId);
        }

        const malpracticePayload: any = {
          recordId,
          sessionId,
          userId,
          incidentType: 'STRIKE_LIMIT_EXCEEDED',
          severity: 'HIGH',
          status: 'OPEN',
          summary: `Coding integrity session terminated due to exceeding maximum strike limit (${newStrikeCount}/${data.maxStrikes}).`,
          evidenceEventIds,
          createdAt: serverTime,
          updatedAt: serverTime,
        };

        transaction.set(recordRef, malpracticePayload);
      }

      return {
        signalAccepted: true,
        duplicate: false,
        eventId,
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
    const lockRef = db.collection('codingActiveSessionLocks').doc(userId);

    return await db.runTransaction(async (transaction) => {
      const lockDoc = await transaction.get(lockRef);
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

      // Always release lock if we hold it
      if (lockDoc.exists && lockDoc.data()?.activeSessionId === sessionId) {
        transaction.delete(lockRef);
      }

      return {
        sessionId: data.sessionId,
        status: finalStatus,
        strikeCount: data.strikeCount,
        maxStrikes: data.maxStrikes
      };
    });
  },

  getEvents: async (sessionId: string, userId: string, limitCount = 50, cursorObj?: { receivedAt: string, eventId: string }) => {
    const sessionRef = db.collection('codingIntegritySessions').doc(sessionId);
    const sessionSnap = await sessionRef.get();
    
    if (!sessionSnap.exists) {
      throw new Error('SESSION_NOT_FOUND');
    }
    
    const data = sessionSnap.data() as CodingIntegritySession;
    if (data.userId !== userId) {
      throw new Error('SESSION_ACCESS_DENIED');
    }

    const safeLimit = Math.min(limitCount, 100);
    let query = sessionRef.collection('events')
      .orderBy('receivedAt', 'desc')
      .limit(safeLimit);
    
    if (cursorObj && cursorObj.eventId) {
      // Fetch the cursor document to use as a stable snapshot tie-breaker
      const cursorDoc = await sessionRef.collection('events').doc(cursorObj.eventId).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();
    const events = snapshot.docs.map(doc => {
      const docData = doc.data() as any;
      return {
        ...docData,
        receivedAt: docData.receivedAt?.toDate().toISOString()
      };
    });

    let nextCursor = null;
    if (events.length === safeLimit) {
      const lastEvent = events[events.length - 1];
      nextCursor = Buffer.from(JSON.stringify({ 
        receivedAt: lastEvent.receivedAt, 
        eventId: lastEvent.eventId 
      })).toString('base64');
    }

    return {
      events,
      nextCursor
    };
  },

  getMalpracticeRecords: async (userId: string) => {
    const recordsRef = db.collection('codingMalpracticeRecords');
    const query = recordsRef
      .where('userId', '==', userId)
      .limit(100); // Fetch up to 100 records for the user
      
    const snapshot = await query.get();
    
    const records = snapshot.docs.map(doc => {
      const docData = doc.data() as any;
      return {
        ...docData,
        createdAt: docData.createdAt?.toDate().toISOString(),
        updatedAt: docData.updatedAt?.toDate().toISOString(),
        reviewedAt: docData.reviewedAt?.toDate().toISOString(),
      };
    });
    
    // Sort descending by createdAt in memory to avoid composite index requirement
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
