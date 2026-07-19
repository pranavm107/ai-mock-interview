import { db } from "../../config/firebase.config";
import { doc, setDoc, getDoc, deleteDoc, query, collection, where, getDocs, updateDoc } from "firebase/firestore";
import { InterviewSession, SessionAnswer, SessionEvent } from "../../types/interviewSession";

export const createInterviewSession = async (session: InterviewSession): Promise<string> => {
  const docRef = doc(db, "interviewSessions", session.id);
  await setDoc(docRef, session);
  return session.id;
};

export const updateInterviewSession = async (sessionId: string, updates: Partial<InterviewSession>): Promise<void> => {
  const docRef = doc(db, "interviewSessions", sessionId);
  await updateDoc(docRef, updates);
};

export const getInterviewSessionById = async (sessionId: string): Promise<InterviewSession | null> => {
  const docRef = doc(db, "interviewSessions", sessionId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as InterviewSession;
  }
  return null;
};

export const deleteInterviewSession = async (sessionId: string): Promise<void> => {
  const docRef = doc(db, "interviewSessions", sessionId);
  await deleteDoc(docRef);
};

export const listSessionsByUser = async (userId: string): Promise<InterviewSession[]> => {
  const q = query(collection(db, "interviewSessions"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as InterviewSession);
};
