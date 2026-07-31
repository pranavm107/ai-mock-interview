import { db } from "../../config/firebase.config";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { SessionAnswer } from "../../types/interviewSession";

export const saveSessionAnswer = async (answer: SessionAnswer): Promise<string> => {
  const docRef = doc(db, "sessionAnswers", answer.id);
  await setDoc(docRef, answer);
  return answer.id;
};

export const getSessionAnswerById = async (answerId: string): Promise<SessionAnswer | null> => {
  const docRef = doc(db, "sessionAnswers", answerId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as SessionAnswer;
  }
  return null;
};

export const getAnswersBySession = async (sessionId: string): Promise<SessionAnswer[]> => {
  const q = query(collection(db, "sessionAnswers"), where("sessionId", "==", sessionId));
  const snap = await getDocs(q);
  // Sort by questionIndex manually since Firestore requires composite indexes for complex sorting with where clauses
  const answers = snap.docs.map(doc => doc.data() as SessionAnswer);
  return answers.sort((a, b) => a.questionIndex - b.questionIndex);
};
