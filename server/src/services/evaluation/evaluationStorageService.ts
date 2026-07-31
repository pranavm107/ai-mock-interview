import { db } from '../../config/firebase.config';
import { doc, setDoc, collection } from 'firebase/firestore';
import { EvaluationSnapshot } from '../../types/evaluation';

export const saveEvaluationSnapshot = async (sessionId: string, snapshot: EvaluationSnapshot): Promise<void> => {
  try {
    const docRef = doc(collection(doc(collection(db, 'interviewSessions'), sessionId), 'live_evaluations'), snapshot.id);
    
    await setDoc(docRef, snapshot);
  } catch (error) {
    console.error('Failed to save live evaluation snapshot:', error);
    // Non-blocking error. Let it fail silently to avoid interrupting the interview.
  }
};
