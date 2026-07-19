import { db } from "../../config/firebase.config";
import { doc, setDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { SessionEvent } from "../../types/interviewSession";

export const logSessionEvent = async (
  sessionId: string,
  type: string,
  questionId?: string,
  metadata?: any
): Promise<void> => {
  const eventId = `event_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const event: any = {
    id: eventId,
    sessionId,
    type,
    timestamp: new Date().toISOString()
  };

  if (questionId !== undefined) event.questionId = questionId;
  if (metadata !== undefined) event.metadata = metadata;

  const docRef = doc(db, "sessionEvents", eventId);
  await setDoc(docRef, event);
};

export const getSessionTimeline = async (sessionId: string): Promise<SessionEvent[]> => {
  const q = query(
    collection(db, "sessionEvents"), 
    where("sessionId", "==", sessionId)
  );
  
  const snap = await getDocs(q);
  const events = snap.docs.map(doc => doc.data() as SessionEvent);
  
  // Sort by timestamp manually to avoid missing Firestore index errors during dev
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};
