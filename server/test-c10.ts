import { integrityService } from './src/services/coding/integrityService';

async function runC10Tests() {
  console.log('--- Running C10 Integrity Event Ledger Tests ---');
  
  const userId = 'test-user-c10';
  const problemId = 'c10-problem';
  const language = 'typescript';
  
  try {
    console.log('\nTest 1 - Create session & New event');
    const session1 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    
    const res1 = await integrityService.processSignal(session1.sessionId, userId, 'sig-1', 'WINDOW_BLUR', '2026-10-09T00:00:00Z', { foo: 'bar' });
    console.log(`Signal accepted: ${res1.signalAccepted}, EventId: ${res1.eventId}, Strikes: ${res1.session.strikeCount}`);
    if (res1.session.strikeCount !== 1) throw new Error('Test 1 failed on strike');
    
    // Check history
    let eventsRes = await integrityService.getEvents(session1.sessionId, userId);
    console.log(`Found ${eventsRes.events.length} events`);
    if (eventsRes.events.length !== 1) throw new Error('Test 1 failed on event length');
    let e1: any = eventsRes.events[0];
    if (e1.eventId !== `${session1.sessionId}_sig-1` || e1.type !== 'WINDOW_BLUR' || e1.strikeCountAtEvent !== 1 || e1.sessionStatusAtEvent !== 'ACTIVE' || e1.metadata?.foo !== 'bar') {
      throw new Error('Test 1 failed on event data: ' + JSON.stringify(e1));
    }
    
    console.log('\nTest 2 - Duplicate request');
    const res2 = await integrityService.processSignal(session1.sessionId, userId, 'sig-1', 'WINDOW_BLUR');
    console.log(`Signal accepted: ${res2.signalAccepted}, Duplicate flag: ${res2.duplicate}`);
    if (res2.signalAccepted || !res2.duplicate) throw new Error('Test 2 failed on duplication');
    
    eventsRes = await integrityService.getEvents(session1.sessionId, userId);
    if (eventsRes.events.length !== 1) throw new Error('Test 2 failed: duplicate created another event');
    
    console.log('\nTest 3 - Conflicting duplicate');
    const res3 = await integrityService.processSignal(session1.sessionId, userId, 'sig-1', 'TAB_SWITCH'); // Different type, same id
    if (res3.signalAccepted) throw new Error('Test 3 failed: conflicting duplicate was accepted');
    
    eventsRes = await integrityService.getEvents(session1.sessionId, userId);
    if (eventsRes.events.length !== 1) throw new Error('Test 3 failed: duplicate created another event');
    
    console.log('\nTest 8 - Third-strike event');
    await integrityService.processSignal(session1.sessionId, userId, 'sig-2', 'TAB_SWITCH');
    const res4 = await integrityService.processSignal(session1.sessionId, userId, 'sig-3', 'FULLSCREEN_EXIT');
    if (res4.session.status !== 'TERMINATED' || res4.session.strikeCount !== 3) throw new Error('Test 8 failed to terminate');
    
    eventsRes = await integrityService.getEvents(session1.sessionId, userId);
    if (eventsRes.events.length !== 3) throw new Error('Test 8 failed: expected 3 events');
    const e3: any = eventsRes.events[0]; // descending order
    if (e3.sessionStatusAtEvent !== 'TERMINATED' || e3.strikeCountAtEvent !== 3) {
      throw new Error('Test 8 failed: event does not reflect termination');
    }
    console.log(`Termination event recorded: ${e3.eventId}, Status: ${e3.sessionStatusAtEvent}`);
    
    console.log('\nTest 9 - Signal after termination');
    const res5 = await integrityService.processSignal(session1.sessionId, userId, 'sig-4', 'NAVIGATION_ATTEMPT');
    if (res5.signalAccepted) throw new Error('Test 9 failed: signal accepted after termination');
    
    eventsRes = await integrityService.getEvents(session1.sessionId, userId);
    if (eventsRes.events.length !== 3) throw new Error('Test 9 failed: event recorded after termination');
    
    console.log('\nTest 10 - Concurrent signals');
    const session2 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    await Promise.all([
      integrityService.processSignal(session2.sessionId, userId, 'csig-1', 'WINDOW_BLUR'),
      integrityService.processSignal(session2.sessionId, userId, 'csig-2', 'TAB_SWITCH'),
      integrityService.processSignal(session2.sessionId, userId, 'csig-3', 'FULLSCREEN_EXIT')
    ]);
    const cEvents = await integrityService.getEvents(session2.sessionId, userId);
    if (cEvents.events.length !== 3) throw new Error('Test 10 failed: missing concurrent events');
    console.log(`Concurrent events recorded: ${cEvents.events.length}`);
    
    console.log('\nTest 12 - Event history pagination');
    const session3 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    // create 4 events
    await integrityService.processSignal(session3.sessionId, userId, 'psig-1', 'WINDOW_BLUR');
    await new Promise(r => setTimeout(r, 100)); // Sleep slightly to ensure distinct timestamps
    await integrityService.processSignal(session3.sessionId, userId, 'psig-2', 'TAB_SWITCH');
    await new Promise(r => setTimeout(r, 100));
    await integrityService.processSignal(session3.sessionId, userId, 'psig-3', 'FULLSCREEN_EXIT');
    
    const page1 = await integrityService.getEvents(session3.sessionId, userId, 2);
    if (page1.events.length !== 2 || !page1.nextCursor) throw new Error('Test 12 failed on page 1');
    
    const page2 = await integrityService.getEvents(session3.sessionId, userId, 2, JSON.parse(Buffer.from(page1.nextCursor, 'base64').toString('utf8')));
    if (page2.events.length !== 1) throw new Error('Test 12 failed on page 2');
    
    console.log('Pagination successful.');

    console.log('\nALL C10 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runC10Tests();
