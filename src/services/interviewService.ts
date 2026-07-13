import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
  writeBatch,
  orderBy,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import type { Interview, InterviewQuestion } from '../types';

export const createInterview = async (
  userId: string,
  data: Omit<Interview, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'startedAt' | 'completedAt' | 'status' | 'completedQuestions' | 'score'>
): Promise<Interview> => {
  try {
    const interviewsRef = collection(db, 'interviews');
    const newInterviewRef = doc(interviewsRef);
    const interviewId = newInterviewRef.id;

    const newInterview: Interview = {
      ...data,
      id: interviewId,
      userId,
      status: 'Draft',
      completedQuestions: 0,
      score: null,
      startedAt: null,
      completedAt: null,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await writeBatch(db).set(newInterviewRef, newInterview).commit();

    return { ...newInterview, createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
  } catch (error) {
    console.error('Error creating interview:', error);
    throw error;
  }
};

export const getInterview = async (interviewId: string): Promise<Interview | null> => {
  try {
    const docRef = doc(db, 'interviews', interviewId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Interview;
    }
    return null;
  } catch (error) {
    console.error('Error fetching interview:', error);
    throw error;
  }
};

export const getUserInterviews = async (userId: string): Promise<Interview[]> => {
  try {
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Interview);
  } catch (error) {
    console.error('Error fetching user interviews:', error);
    throw error;
  }
};

export const updateInterview = async (interviewId: string, data: Partial<Interview>): Promise<void> => {
  try {
    const interviewRef = doc(db, 'interviews', interviewId);
    await updateDoc(interviewRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    throw error;
  }
};

export const deleteInterview = async (userId: string, interviewId: string): Promise<void> => {
  try {
    const interviewRef = doc(db, 'interviews', interviewId);
    const interviewSnap = await getDoc(interviewRef);

    if (!interviewSnap.exists()) return;
    
    if (interviewSnap.data().userId !== userId) {
      throw new Error("Unauthorized to delete this interview.");
    }

    // Must delete all questions inside the subcollection first
    const questionsRef = collection(db, 'interviews', interviewId, 'questions');
    const qSnap = await getDocs(questionsRef);
    
    const batch = writeBatch(db);
    qSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    
    batch.delete(interviewRef);
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
};

export const startInterview = async (interviewId: string): Promise<void> => {
  try {
    const interviewRef = doc(db, 'interviews', interviewId);
    await updateDoc(interviewRef, {
      status: 'In Progress',
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    throw error;
  }
};

export const completeInterview = async (interviewId: string, finalScore: number): Promise<void> => {
  try {
    const interviewRef = doc(db, 'interviews', interviewId);
    await updateDoc(interviewRef, {
      status: 'Completed',
      score: finalScore,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    throw error;
  }
};

export const cancelInterview = async (interviewId: string): Promise<void> => {
  try {
    const interviewRef = doc(db, 'interviews', interviewId);
    await updateDoc(interviewRef, {
      status: 'Cancelled',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error cancelling interview:', error);
    throw error;
  }
};

export const updateStatus = async (interviewId: string, status: Interview['status']): Promise<void> => {
  try {
    const interviewRef = doc(db, 'interviews', interviewId);
    await updateDoc(interviewRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating interview status:', error);
    throw error;
  }
};

export const saveQuestion = async (interviewId: string, question: Omit<InterviewQuestion, 'id' | 'createdAt'>): Promise<InterviewQuestion> => {
  try {
    const questionsRef = collection(db, 'interviews', interviewId, 'questions');
    const newQuestionRef = doc(questionsRef);
    const newQuestion: InterviewQuestion = {
      ...question,
      id: newQuestionRef.id,
      createdAt: serverTimestamp() as Timestamp,
    };
    await writeBatch(db).set(newQuestionRef, newQuestion).commit();
    return { ...newQuestion, createdAt: Timestamp.now() };
  } catch (error) {
    console.error('Error saving question:', error);
    throw error;
  }
};

export const saveQuestions = async (interviewId: string, questions: Omit<InterviewQuestion, 'id' | 'createdAt' | 'interviewId'>[]): Promise<InterviewQuestion[]> => {
  try {
    const questionsRef = collection(db, 'interviews', interviewId, 'questions');
    const batch = writeBatch(db);
    
    const savedQuestions: InterviewQuestion[] = [];
    const now = Timestamp.now();
    
    questions.forEach((q) => {
      const newQuestionRef = doc(questionsRef);
      const newQuestion: InterviewQuestion = {
        ...q,
        id: newQuestionRef.id,
        interviewId,
        createdAt: serverTimestamp() as Timestamp,
      };
      batch.set(newQuestionRef, newQuestion);
      savedQuestions.push({ ...newQuestion, createdAt: now });
    });
    
    await batch.commit();
    return savedQuestions;
  } catch (error) {
    console.error('Error saving questions batch:', error);
    throw error;
  }
};

export const getQuestions = async (interviewId: string): Promise<InterviewQuestion[]> => {
  try {
    const q = query(
      collection(db, 'interviews', interviewId, 'questions'),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as InterviewQuestion);
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const saveAnswer = async (interviewId: string, questionId: string, userAnswer: string, duration: number): Promise<void> => {
  try {
    const questionRef = doc(db, 'interviews', interviewId, 'questions', questionId);
    
    // We should run a transaction to update both question answer and interview completed count
    // but a batch is simpler if we just update the question first and then client calls updateInterview
    await updateDoc(questionRef, {
      userAnswer,
      duration,
      answered: true
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
};

export const deleteQuestion = async (interviewId: string, questionId: string): Promise<void> => {
  try {
    const questionRef = doc(db, 'interviews', interviewId, 'questions', questionId);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
