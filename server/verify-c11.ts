import { db } from './src/config/firebaseAdmin';

async function verifyC11() {
  console.log('--- Direct Database Verification ---');
  try {
    const recordsSnap = await db.collection('codingMalpracticeRecords').orderBy('createdAt', 'desc').limit(1).get();
    
    if (recordsSnap.empty) {
      console.log('FAIL: No malpractice records found in Firestore.');
      return;
    }

    const recordDoc = recordsSnap.docs[0];
    const record = recordDoc.data();
    
    const redactedUserId = record.userId.substring(0, 5) + '***';
    const redactedSessionId = record.sessionId.substring(0, 5) + '***';
    const redactedRecordId = record.recordId.substring(0, 5) + '***';
    
    console.log(`Found Malpractice Record:`);
    console.log(`- Record ID: ${redactedRecordId}`);
    console.log(`- Session ID: ${redactedSessionId}`);
    console.log(`- User ID: ${redactedUserId}`);
    console.log(`- Incident Type: ${record.incidentType}`);
    console.log(`- Status: ${record.status}`);
    
    if (record.incidentType === 'STRIKE_LIMIT_EXCEEDED') {
      console.log('PASS: Record has incident type STRIKE_LIMIT_EXCEEDED.');
    } else {
      console.log(`FAIL: Expected STRIKE_LIMIT_EXCEEDED, got ${record.incidentType}`);
    }

    const sessionRef = db.collection('codingIntegritySessions').doc(record.sessionId);
    const sessionSnap = await sessionRef.get();
    
    if (!sessionSnap.exists) {
      console.log('FAIL: Associated session does not exist.');
    } else {
      const session = sessionSnap.data();
      if (session?.status === 'TERMINATED') {
        console.log(`PASS: Associated session status is TERMINATED (Strike count: ${session.strikeCount}/${session.maxStrikes}).`);
      } else {
        console.log(`FAIL: Associated session status is ${session?.status}, expected TERMINATED.`);
      }
    }

    console.log('\n--- Evidence Verification ---');
    const evidenceIds: string[] = record.evidenceEventIds || [];
    console.log(`Evidence Event IDs: ${evidenceIds.map(id => id.substring(0, 5) + '***').join(', ')}`);
    
    let allValid = true;
    for (const eventId of evidenceIds) {
      const eventSnap = await sessionRef.collection('events').doc(eventId).get();
      if (!eventSnap.exists) {
        console.log(`FAIL: Evidence event ${eventId.substring(0,5)}*** not found in ledger.`);
        allValid = false;
      } else {
        const eventData = eventSnap.data();
        if (eventData?.sessionId !== record.sessionId) {
          console.log(`FAIL: Event ${eventId.substring(0,5)}*** belongs to different session!`);
          allValid = false;
        }
      }
    }
    
    if (allValid && evidenceIds.length > 0) {
      console.log('PASS: All evidence events exist and belong to the correct session.');
    } else if (evidenceIds.length === 0) {
      console.log('FAIL: No evidence events found in record.');
    }
    
  } catch (err) {
    console.error('Error during verification:', err);
  }
}

verifyC11();
