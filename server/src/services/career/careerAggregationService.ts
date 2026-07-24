
import { db } from '../../config/firebaseAdmin';

export interface InterviewSession {
  id: string;
  userId: string;
  status: string;
  score: number | null;
  interviewType?: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CareerContext {
  userId: string;
  interviewSessions: InterviewSession[];
  totalInterviews: number;
  averageScore: number;
  lastInterviewDate: string | null;
}

export const aggregateCareerData = async (userId: string): Promise<CareerContext> => {
  if (!db) throw new Error("Firestore not initialized");

  const interviewsRef = db.collection('interviews');
  const snapshot = await interviewsRef
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  const sessions: InterviewSession[] = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      status: data.status,
      score: data.score,
      interviewType: data.interviewType,
      startedAt: data.startedAt?.toDate?.()?.toISOString() || null,
      completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };
  });

  const completedSessions = sessions.filter(s => s.status === 'Completed' && s.score !== null);
  const totalScore = completedSessions.reduce((sum, s) => sum + (s.score || 0), 0);
  const averageScore = completedSessions.length > 0 ? totalScore / completedSessions.length : 0;
  
  const lastInterviewDate = sessions.length > 0 ? sessions[0].createdAt : null;

  return {
    userId,
    interviewSessions: sessions,
    totalInterviews: sessions.length,
    averageScore,
    lastInterviewDate
  };
};
