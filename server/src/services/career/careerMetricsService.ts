import { db } from '../../config/firebaseAdmin';

export interface InterviewSession {
  id: string;
  userId: string;
  status: string;
  score: number | null;
  interviewType?: string;
  duration?: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CareerMetrics {
  userId: string;
  sessions: InterviewSession[];
  totalInterviews: number;
  completedInterviews: number;
  draftInterviews: number;
  inProgressInterviews: number;
  averageScore: number | null;
  averageDuration: number | null;
  completionRate: number;
  lastActive: string | null;
}

export const getCareerMetrics = async (userId: string): Promise<CareerMetrics> => {
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
      duration: data.duration,
      startedAt: data.startedAt?.toDate?.()?.toISOString() || null,
      completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };
  });

  const totalInterviews = sessions.length;
  const completedInterviews = sessions.filter(s => s.status === 'Completed').length;
  const draftInterviews = sessions.filter(s => s.status === 'Draft').length;
  const inProgressInterviews = sessions.filter(s => s.status === 'In Progress').length;
  
  const completedWithScore = sessions.filter(s => s.status === 'Completed' && s.score !== null);
  const averageScore = completedWithScore.length > 0 
    ? completedWithScore.reduce((sum, s) => sum + (s.score || 0), 0) / completedWithScore.length 
    : null;

  const completedWithDuration = sessions.filter(s => s.status === 'Completed' && s.duration != null);
  const averageDuration = completedWithDuration.length > 0 
    ? completedWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / completedWithDuration.length 
    : null;

  const completionRate = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;
  
  const lastActive = sessions.length > 0 ? sessions[0].createdAt : null;

  return {
    userId,
    sessions,
    totalInterviews,
    completedInterviews,
    draftInterviews,
    inProgressInterviews,
    averageScore,
    averageDuration,
    completionRate,
    lastActive
  };
};
