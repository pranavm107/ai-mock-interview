import { integrityService } from './src/services/coding/integrityService';
import { db } from './src/config/firebaseAdmin';

async function runC14Tests() {
  console.log('--- Running C14 Suspicious Code Insertion Tests ---');
  
  const userId = 'test-user-c14';
  const problemId = 'c14-problem';
  
  try {
    const session = await integrityService.createSession(userId, problemId, 'typescript', 'INTEGRITY');
    const sessionId = session.sessionId;
    
    console.log(`\nTest 1 - LARGE_CODE_INSERTION is audited without strike increment`);
    const res1 = await integrityService.processSignal(sessionId, userId, 'sig-c14-1', 'LARGE_CODE_INSERTION', new Date().toISOString(), { length: 200 });
    console.log(`Accepted: ${res1.signalAccepted}, Strikes: ${res1.session.strikeCount}`);
    if (res1.session.strikeCount !== 0) throw new Error('LARGE_CODE_INSERTION incremented strikes!');

    // Check ledger
    const events = await integrityService.getEvents(sessionId, userId, 10);
    const insertionEvents = events.events.filter(e => e.type === 'LARGE_CODE_INSERTION');
    console.log(`\nFound ${insertionEvents.length} insertion events in C10 ledger.`);
    if (insertionEvents.length !== 1) throw new Error('C14 events were not properly persisted to the ledger.');
    if (insertionEvents[0].metadata?.length !== 200) throw new Error('C14 metadata length was not persisted correctly.');

    await integrityService.endSession(sessionId, userId);
    
    console.log('\nALL C14 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runC14Tests();
