import { integrityService } from './src/services/coding/integrityService';
import { db } from './src/config/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

async function runC17Tests() {
  console.log('--- Running C17 Active Session Lock Tests ---');
  
  const userId1 = 'user-c17-1';
  const userId2 = 'user-c17-2';
  const problemId = 'c17-problem';
  const language = 'typescript';
  
  // Cleanup from previous failed runs
  try {
    const lock1 = await db.collection('codingActiveSessionLocks').doc(userId1).get();
    if (lock1.exists && lock1.data()?.activeSessionId) await integrityService.endSession(lock1.data()?.activeSessionId, userId1).catch(() => {});
    const lock2 = await db.collection('codingActiveSessionLocks').doc(userId2).get();
    if (lock2.exists && lock2.data()?.activeSessionId) await integrityService.endSession(lock2.data()?.activeSessionId, userId2).catch(() => {});
  } catch(e) {}
  
  try {
    // 1. First session creation succeeds and establishes the lock.
    console.log('\nTest 1 - Create session establishes lock');
    const session1 = await integrityService.createSession(userId1, problemId, language, 'INTEGRITY');
    
    const lock1 = await db.collection('codingActiveSessionLocks').doc(userId1).get();
    if (!lock1.exists || lock1.data()?.activeSessionId !== session1.sessionId) {
      throw new Error('Test 1 failed: Lock not established correctly');
    }
    console.log('✅ Lock established correctly');

    // 2. A second creation request is rejected.
    console.log('\nTest 2 - Second creation rejected');
    try {
      await integrityService.createSession(userId1, problemId, language, 'INTEGRITY');
      throw new Error('Test 2 failed: Allowed second session');
    } catch (e: any) {
      if (!e.message.startsWith('ACTIVE_SESSION_CONFLICT')) throw e;
      console.log('✅ Second session rejected with conflict');
    }

    // 4. Two different users can have independent active sessions.
    console.log('\nTest 4 - Independent user sessions');
    const session2 = await integrityService.createSession(userId2, problemId, language, 'INTEGRITY');
    const lock2 = await db.collection('codingActiveSessionLocks').doc(userId2).get();
    if (!lock2.exists || lock2.data()?.activeSessionId !== session2.sessionId) {
      throw new Error('Test 4 failed: Second user lock failed');
    }
    console.log('✅ Independent sessions created');

    // 5. Successful termination releases the matching lock.
    console.log('\nTest 5 - Termination releases lock');
    await integrityService.endSession(session1.sessionId, userId1);
    const lock1After = await db.collection('codingActiveSessionLocks').doc(userId1).get();
    if (lock1After.exists) {
      throw new Error('Test 5 failed: Lock not released');
    }
    console.log('✅ Lock released on termination');

    // 6. Duplicate termination is safe
    console.log('\nTest 6 - Duplicate termination safe');
    await integrityService.endSession(session1.sessionId, userId1); // should not throw, just returns ENDED
    console.log('✅ Duplicate termination handled');

    // 3. Concurrent creation attempts cannot produce two active sessions.
    console.log('\nTest 3 - Concurrent creation safety');
    // Using Promise.allSettled to run transactions concurrently
    const p1 = integrityService.createSession(userId1, problemId, language, 'INTEGRITY');
    const p2 = integrityService.createSession(userId1, problemId, language, 'INTEGRITY');
    const results = await Promise.allSettled([p1, p2]);
    
    let successCount = 0;
    let conflictCount = 0;
    let createdSessionId = '';
    
    for (const res of results) {
      if (res.status === 'fulfilled') {
        successCount++;
        createdSessionId = res.value.sessionId;
      } else if (res.reason.message.startsWith('ACTIVE_SESSION_CONFLICT')) {
        conflictCount++;
      } else {
        throw res.reason;
      }
    }
    
    if (successCount !== 1 || conflictCount !== 1) {
      throw new Error(`Test 3 failed: Concurrent success=${successCount}, conflict=${conflictCount}`);
    }
    
    // Verify DB state
    const activeSessionsQuery = await db.collection('codingIntegritySessions')
      .where('userId', '==', userId1)
      .where('status', '==', 'ACTIVE')
      .get();
      
    if (activeSessionsQuery.size !== 1) {
      throw new Error(`Test 3 failed: DB has ${activeSessionsQuery.size} active sessions for user, expected exactly 1.`);
    }
    console.log('✅ Concurrent creation correctly rejected one and left DB with exactly 1 active session');

    // 8. Stale heartbeat does not release lock (lock remains)
    console.log('\nTest 8 - Stale heartbeat behavior');
    // Make session stale
    await db.collection('codingIntegritySessions').doc(createdSessionId).update({
      lastHeartbeatAt: Timestamp.fromDate(new Date(Date.now() - 100000))
    });
    // Try to create another, should still conflict because status is ACTIVE
    try {
      await integrityService.createSession(userId1, problemId, language, 'INTEGRITY');
      throw new Error('Test 8 failed: Stale heartbeat allowed creation');
    } catch (e: any) {
      if (!e.message.startsWith('ACTIVE_SESSION_CONFLICT')) throw e;
      console.log('✅ Stale heartbeat correctly maintains lock');
    }

    // 9. Missing or inconsistent lock records handled safely
    console.log('\nTest 9 - Inconsistent lock recovery');
    // Force set the session to TERMINATED in DB directly without clearing lock
    await db.collection('codingIntegritySessions').doc(createdSessionId).update({
      status: 'TERMINATED'
    });
    
    // Now the lock exists but points to a TERMINATED session.
    // Creating a new session should succeed and overwrite the lock!
    const session3 = await integrityService.createSession(userId1, problemId, language, 'INTEGRITY');
    const lock3 = await db.collection('codingActiveSessionLocks').doc(userId1).get();
    if (lock3.data()?.activeSessionId !== session3.sessionId) {
      throw new Error('Test 9 failed: Did not overwrite stale lock');
    }
    console.log('✅ Stale lock recovered and overwritten');

    // Clean up
    await integrityService.endSession(session3.sessionId, userId1);
    await integrityService.endSession(session2.sessionId, userId2);

    console.log('\nALL C17 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runC17Tests();
