import { integrityService } from './src/services/coding/integrityService';
import { db } from './src/config/firebaseAdmin';

async function runC12Tests() {
  console.log('--- Running C12 Clipboard Event Tests ---');
  
  const userId = 'test-user-c12';
  const problemId = 'c12-problem';
  const language = 'typescript';
  
  try {
    const session = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    const sessionId = session.sessionId;
    console.log(`\nTest 1 - Session created: ${sessionId}`);
    
    // Test copy event
    const res1 = await integrityService.processSignal(sessionId, userId, 'sig-1', 'COPY_DETECTED', undefined, { targetTag: 'TEXTAREA' });
    console.log(`Signal COPY_DETECTED accepted: ${res1.signalAccepted}, Strikes: ${res1.session.strikeCount}`);
    if (res1.session.strikeCount !== 0) throw new Error('Test failed: COPY_DETECTED should not increment strikes');
    
    // Test paste event
    const res2 = await integrityService.processSignal(sessionId, userId, 'sig-2', 'PASTE_DETECTED', undefined, { targetTag: 'TEXTAREA' });
    console.log(`Signal PASTE_DETECTED accepted: ${res2.signalAccepted}, Strikes: ${res2.session.strikeCount}`);
    if (res2.session.strikeCount !== 0) throw new Error('Test failed: PASTE_DETECTED should not increment strikes');

    // Test cut event
    const res3 = await integrityService.processSignal(sessionId, userId, 'sig-3', 'CUT_DETECTED');
    console.log(`Signal CUT_DETECTED accepted: ${res3.signalAccepted}, Strikes: ${res3.session.strikeCount}`);
    if (res3.session.strikeCount !== 0) throw new Error('Test failed: CUT_DETECTED should not increment strikes');
    
    // Check ledger
    const events = await integrityService.getEvents(sessionId, userId, 10);
    const clipboardEvents = events.events.filter(e => e.type === 'COPY_DETECTED' || e.type === 'PASTE_DETECTED' || e.type === 'CUT_DETECTED');
    console.log(`Found ${clipboardEvents.length} clipboard events in ledger`);
    if (clipboardEvents.length !== 3) throw new Error('Test failed: Not all clipboard events were saved to ledger');

    // Ensure metadata doesn't contain source code (it shouldn't, but let's check)
    if (clipboardEvents.some(e => e.metadata?.text || e.metadata?.clipboardData)) {
      throw new Error('Test failed: Clipboard content was erroneously captured in metadata');
    }

    // Verify it doesn't create malpractice record
    const records = await integrityService.getMalpracticeRecords(userId);
    const sessionRecords = records.filter((r: any) => r.sessionId === sessionId);
    if (sessionRecords.length > 0) throw new Error('Test failed: Clipboard activity created a malpractice record');

    // End session
    await integrityService.endSession(sessionId, userId);
    
    console.log('\nALL C12 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runC12Tests();
