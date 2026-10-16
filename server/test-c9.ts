import { integrityService } from './src/services/coding/integrityService';

async function runTests() {
  console.log('--- Running C9 Server-Authoritative Integrity Tests ---');
  
  const userId = 'test-user-123';
  const problemId = 'valid-parentheses';
  const language = 'python';
  
  try {
    console.log('\\nTest 1 - Create session');
    const session1 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    console.log(`Session created: ${session1.sessionId}, Status: ${session1.status}, Strikes: ${session1.strikeCount}`);
    if (session1.strikeCount !== 0 || session1.status !== 'ACTIVE') throw new Error('Test 1 failed');
    
    console.log('\\nTest 2 - First signal');
    const res1 = await integrityService.processSignal(session1.sessionId, userId, 'sig-1', 'WINDOW_BLUR');
    console.log(`Signal accepted: ${res1.signalAccepted}, Strikes: ${res1.session.strikeCount}, Status: ${res1.session.status}`);
    if (res1.session.strikeCount !== 1 || res1.session.status !== 'ACTIVE') throw new Error('Test 2 failed');

    console.log('\\nTest 3 - Second signal');
    const res2 = await integrityService.processSignal(session1.sessionId, userId, 'sig-2', 'TAB_SWITCH');
    console.log(`Signal accepted: ${res2.signalAccepted}, Strikes: ${res2.session.strikeCount}, Status: ${res2.session.status}`);
    if (res2.session.strikeCount !== 2 || res2.session.status !== 'ACTIVE') throw new Error('Test 3 failed');

    console.log('\\nTest 4 - Third signal (Termination)');
    const res3 = await integrityService.processSignal(session1.sessionId, userId, 'sig-3', 'FULLSCREEN_EXIT');
    console.log(`Signal accepted: ${res3.signalAccepted}, Strikes: ${res3.session.strikeCount}, Status: ${res3.session.status}`);
    if (res3.session.strikeCount !== 3 || res3.session.status !== 'TERMINATED') throw new Error('Test 4 failed');

    console.log('\\nTest 5 - Fourth signal (Ignored)');
    const res4 = await integrityService.processSignal(session1.sessionId, userId, 'sig-4', 'NAVIGATION_ATTEMPT');
    console.log(`Signal accepted: ${res4.signalAccepted}, Strikes: ${res4.session.strikeCount}, Status: ${res4.session.status}`);
    if (res4.session.strikeCount !== 3 || res4.session.status !== 'TERMINATED' || res4.signalAccepted) throw new Error('Test 5 failed');

    console.log('\\nTest 6 - Duplicate signal');
    const session2 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    const res5 = await integrityService.processSignal(session2.sessionId, userId, 'dup-1', 'WINDOW_BLUR');
    const res6 = await integrityService.processSignal(session2.sessionId, userId, 'dup-1', 'WINDOW_BLUR');
    console.log(`Duplicate response accepted: ${res6.signalAccepted}, Duplicate flag: ${res6.duplicate}, Strikes: ${res6.session.strikeCount}`);
    if (res6.signalAccepted || !res6.duplicate || res6.session.strikeCount !== 1) throw new Error('Test 6 failed');

    console.log('\\nTest 7 - Invalid signal type');
    try {
      await integrityService.processSignal(session2.sessionId, userId, 'inv-1', 'UNKNOWN_TYPE');
      throw new Error('Test 7 failed: Should have thrown INVALID_SIGNAL');
    } catch (e: any) {
      if (e.message !== 'INVALID_SIGNAL') throw e;
      console.log('Caught INVALID_SIGNAL as expected.');
    }

    console.log('\\nTest 9 - Wrong user');
    try {
      await integrityService.processSignal(session2.sessionId, 'wrong-user', 'sig-x', 'WINDOW_BLUR');
      throw new Error('Test 9 failed: Should have thrown SESSION_ACCESS_DENIED');
    } catch (e: any) {
      if (e.message !== 'SESSION_ACCESS_DENIED') throw e;
      console.log('Caught SESSION_ACCESS_DENIED as expected.');
    }

    console.log('\\nTest 11 & 12 - State recovery');
    const fetchedSession = await integrityService.getSession(session1.sessionId, userId);
    console.log(`Recovered session: Strikes: ${fetchedSession.strikeCount}, Status: ${fetchedSession.status}`);
    if (fetchedSession.strikeCount !== 3 || fetchedSession.status !== 'TERMINATED') throw new Error('Test 11/12 failed');

    console.log('\\nTest 13 - End session');
    const session3 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    await integrityService.processSignal(session3.sessionId, userId, 's-1', 'WINDOW_BLUR');
    const endRes = await integrityService.endSession(session3.sessionId, userId);
    console.log(`Ended session status: ${endRes.status}, Strikes: ${endRes.strikeCount}`);
    if (endRes.status !== 'ENDED' || endRes.strikeCount !== 1) throw new Error('Test 13 failed');

    console.log('\\nTest 14 - Terminated cannot be resumed (End session on terminated)');
    const termEndRes = await integrityService.endSession(session1.sessionId, userId);
    console.log(`End on terminated status: ${termEndRes.status}`);
    if (termEndRes.status !== 'TERMINATED') throw new Error('Test 14 failed');

    console.log('\\nTest 16 - Concurrent signals (Atomic increment)');
    const session4 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    await Promise.all([
      integrityService.processSignal(session4.sessionId, userId, 'c-1', 'WINDOW_BLUR'),
      integrityService.processSignal(session4.sessionId, userId, 'c-2', 'TAB_SWITCH'),
      integrityService.processSignal(session4.sessionId, userId, 'c-3', 'FULLSCREEN_EXIT')
    ]);
    const finalS4 = await integrityService.getSession(session4.sessionId, userId);
    console.log(`Final concurrent strikes: ${finalS4.strikeCount}, Status: ${finalS4.status}`);
    if (finalS4.strikeCount !== 3 || finalS4.status !== 'TERMINATED') throw new Error('Test 16 failed');

    console.log('\\nALL C9 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
