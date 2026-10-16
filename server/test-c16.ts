import { integrityService } from './src/services/coding/integrityService';
import { db } from './src/config/firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

async function runC16Tests() {
  console.log('--- Running C16 Heartbeat Tests ---');
  
  const userId = 'test-user-c16';
  const problemId = 'c16-problem';
  const language = 'typescript';
  
  try {
    console.log('\nTest 1 - Create session & Heartbeat');
    const session1 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    
    // Heartbeat
    const hbRes1 = await integrityService.heartbeatSession(session1.sessionId, userId);
    console.log(`Heartbeat accepted: true, Status: ${hbRes1.status}, isStale: ${hbRes1.isStale}`);
    if (hbRes1.status !== 'ACTIVE' || hbRes1.isStale !== false) throw new Error('Test 1 failed');

    // Get session to verify heartbeat updating and stale state
    const fetched1 = await integrityService.getSession(session1.sessionId, userId);
    if (!fetched1.lastHeartbeatAt) throw new Error('Test 1 failed: lastHeartbeatAt missing');
    if (fetched1.isStale) throw new Error('Test 1 failed: session should not be stale immediately after heartbeat');

    console.log('\nTest 2 - Cross-user heartbeat denied');
    try {
      await integrityService.heartbeatSession(session1.sessionId, 'wrong-user');
      throw new Error('Test 2 failed: allowed cross-user heartbeat');
    } catch (e: any) {
      if (e.message !== 'SESSION_ACCESS_DENIED') throw e;
      console.log('Cross-user heartbeat blocked.');
    }

    console.log('\nTest 3 - Terminated session rejects heartbeat');
    // Terminate session
    await integrityService.processSignal(session1.sessionId, userId, 'sig-1', 'WINDOW_BLUR');
    await integrityService.processSignal(session1.sessionId, userId, 'sig-2', 'TAB_SWITCH');
    await integrityService.processSignal(session1.sessionId, userId, 'sig-3', 'FULLSCREEN_EXIT');
    
    try {
      await integrityService.heartbeatSession(session1.sessionId, userId);
      throw new Error('Test 3 failed: allowed heartbeat on terminated session');
    } catch (e: any) {
      if (e.message !== 'SESSION_NOT_ACTIVE') throw e;
      console.log('Terminated session heartbeat blocked.');
    }

    console.log('\nTest 4 - Heartbeat does not increment strikes');
    const session2 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    const hbRes2 = await integrityService.heartbeatSession(session2.sessionId, userId);
    if (hbRes2.strikeCount !== 0) throw new Error('Test 4 failed: heartbeat incremented strikes');
    
    // Also verify no event was generated
    const events = await integrityService.getEvents(session2.sessionId, userId);
    if (events.events.length !== 0) throw new Error('Test 4 failed: heartbeat generated event');
    
    console.log('Heartbeat safely processed without strikes or events.');

    console.log('\nTest 5 - Stale boundary and missing timestamp logic');
    // Test exact 90 seconds (not stale) and 90.001 seconds (stale)
    const staleCheckSession = {
      ...session2,
      lastHeartbeatAt: { toMillis: () => Date.now() - 90000 } as any,
    };
    
    // We need to inject this into DB to test getSession
    const testSessionId = 'stale-test-session';
    await db.collection('codingIntegritySessions').doc(testSessionId).set({
      sessionId: testSessionId,
      userId: userId,
      problemId,
      language,
      mode: 'INTEGRITY',
      status: 'ACTIVE',
      strikeCount: 0,
      maxStrikes: 3,
      recentSignalIds: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastHeartbeatAt: null, // missing timestamp
    });

    const fetchedMissing = await integrityService.getSession(testSessionId, userId);
    if (fetchedMissing.isStale !== false) throw new Error('Test 5 failed: missing timestamp should not be stale');

    // Freeze time for exact boundary testing
    const fixedNow = Date.now();
    const originalDateNow = Date.now;
    Date.now = () => fixedNow;

    // Test exactly 90 seconds
    const exact90Date = new Date(fixedNow - 90000);
    await db.collection('codingIntegritySessions').doc(testSessionId).update({
      lastHeartbeatAt: Timestamp.fromDate(exact90Date)
    });
    const fetchedExact = await integrityService.getSession(testSessionId, userId);
    if (fetchedExact.isStale !== false) {
      Date.now = originalDateNow;
      throw new Error('Test 5 failed: exactly 90s should not be stale');
    }

    // Test 90.001 seconds
    const over90Date = new Date(fixedNow - 90001);
    await db.collection('codingIntegritySessions').doc(testSessionId).update({
      lastHeartbeatAt: Timestamp.fromDate(over90Date)
    });
    const fetchedOver = await integrityService.getSession(testSessionId, userId);
    Date.now = originalDateNow;
    
    if (fetchedOver.isStale !== true) throw new Error('Test 5 failed: >90s should be stale');
    
    console.log('Stale boundaries and missing timestamp logic verified.');

    console.log('\nALL C16 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runC16Tests();
