import { integrityService } from './src/services/coding/integrityService';
import { db } from './src/config/firebaseAdmin';

async function runC11Tests() {
  console.log('--- Running C11 Malpractice Record Tests ---');
  
  const userId = 'test-user-c11';
  const problemId = 'c11-problem';
  const language = 'typescript';
  
  try {
    console.log('\nTest 1 - Create session & terminate to create record');
    const session1 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    
    await integrityService.processSignal(session1.sessionId, userId, 'sig-1', 'WINDOW_BLUR');
    await integrityService.processSignal(session1.sessionId, userId, 'sig-2', 'TAB_SWITCH');
    
    // The third signal will terminate and trigger malpractice record creation
    const res3 = await integrityService.processSignal(session1.sessionId, userId, 'sig-3', 'FULLSCREEN_EXIT');
    console.log(`Termination signal accepted, Status: ${res3.session.status}`);
    
    if (res3.session.status !== 'TERMINATED') throw new Error('Test 1 failed: session not terminated');
    
    // Check for Malpractice Record
    const records = await integrityService.getMalpracticeRecords(userId);
    console.log(`Found ${records.length} malpractice records for user`);
    
    const record = records.find((r: any) => r.sessionId === session1.sessionId);
    if (!record) throw new Error('Test 1 failed: malpractice record not created');
    
    console.log(`Record ID: ${record.recordId}, Incident Type: ${record.incidentType}, Severity: ${record.severity}`);
    
    if (record.incidentType !== 'STRIKE_LIMIT_EXCEEDED' || record.severity !== 'HIGH') {
      throw new Error('Test 1 failed: incorrect record schema');
    }
    if (record.evidenceEventIds.length < 3) {
      throw new Error(`Test 1 failed: insufficient evidence event IDs, got ${record.evidenceEventIds.length}`);
    }
    
    console.log('\nTest 2 - Idempotency and Duplication Protection');
    // Send another signal after termination, should be rejected and NOT create another record
    const res4 = await integrityService.processSignal(session1.sessionId, userId, 'sig-4', 'WINDOW_BLUR');
    if (res4.signalAccepted) throw new Error('Test 2 failed: signal accepted after termination');
    
    const recordsAgain = await integrityService.getMalpracticeRecords(userId);
    const session1Records = recordsAgain.filter((r: any) => r.sessionId === session1.sessionId);
    if (session1Records.length !== 1) {
      throw new Error(`Test 2 failed: found ${session1Records.length} records for session, expected exactly 1`);
    }
    console.log('Duplicate record prevention successful.');
    
    console.log('\nTest 3 - Cross-user record access denied (backend check)');
    const otherUserRecords = await integrityService.getMalpracticeRecords('other-user-c11');
    if (otherUserRecords.length > 0) {
       // Assuming clean db, other user shouldn't see test-user-c11's records
       throw new Error('Test 3 failed: wrong records returned for other user');
    }
    console.log('User scope isolation verified.');

    console.log('\nTest 4 - Ending a session normally does not create a record');
    const session2 = await integrityService.createSession(userId, problemId, language, 'INTEGRITY');
    await integrityService.processSignal(session2.sessionId, userId, 'sig-1', 'WINDOW_BLUR');
    await integrityService.endSession(session2.sessionId, userId);
    
    const recordsEnd = await integrityService.getMalpracticeRecords(userId);
    const session2Records = recordsEnd.filter((r: any) => r.sessionId === session2.sessionId);
    if (session2Records.length > 0) {
      throw new Error('Test 4 failed: malpractice record created for normally ended session');
    }
    console.log('Ended session left no malpractice record.');

    console.log('\nALL C11 TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runC11Tests();
