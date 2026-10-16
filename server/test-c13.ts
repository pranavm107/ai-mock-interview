import { integrityService } from './src/services/coding/integrityService';
import { db } from './src/config/firebaseAdmin';

async function runC13Tests() {
  console.log('--- Running C13 Tab/Window Monitoring Tests ---');
  
  const userId = 'test-user-c13';
  const problemId = 'c13-problem';
  
  try {
    const session = await integrityService.createSession(userId, problemId, 'typescript', 'INTEGRITY');
    const sessionId = session.sessionId;
    
    console.log(`\nTest 1 - TAB_RETURN is audited without strike increment`);
    const res1 = await integrityService.processSignal(sessionId, userId, 'sig-c13-1', 'TAB_RETURN');
    console.log(`Accepted: ${res1.signalAccepted}, Strikes: ${res1.session.strikeCount}`);
    if (res1.session.strikeCount !== 0) throw new Error('TAB_RETURN incremented strikes!');
    
    console.log(`\nTest 2 - WINDOW_FOCUS is audited without strike increment`);
    const res2 = await integrityService.processSignal(sessionId, userId, 'sig-c13-2', 'WINDOW_FOCUS');
    console.log(`Accepted: ${res2.signalAccepted}, Strikes: ${res2.session.strikeCount}`);
    if (res2.session.strikeCount !== 0) throw new Error('WINDOW_FOCUS incremented strikes!');

    // Check ledger
    const events = await integrityService.getEvents(sessionId, userId, 10);
    const returnEvents = events.events.filter(e => e.type === 'TAB_RETURN' || e.type === 'WINDOW_FOCUS');
    console.log(`\nFound ${returnEvents.length} return events in C10 ledger.`);
    if (returnEvents.length !== 2) throw new Error('C13 events were not properly persisted to the ledger.');

    await integrityService.endSession(sessionId, userId);
    
    console.log('\nALL C13 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runC13Tests();
