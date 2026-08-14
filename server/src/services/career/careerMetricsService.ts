import { getEnrichedUserSessions } from '../interview/interviewAggregationService';

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
  const enrichedSessions = await getEnrichedUserSessions(userId);

  const sessions: InterviewSession[] = enrichedSessions.map(session => {
    let status = 'Draft';
    if (['CREATED', 'READY'].includes(session.state)) status = 'Draft';
    else if (session.state === 'COMPLETED') status = 'Completed';
    else if (session.state === 'CANCELLED') status = 'Cancelled';
    else status = 'In Progress';

    // Calculate duration in minutes from metrics
    const durationMins = session.metrics?.totalDurationMs ? Math.round(session.metrics.totalDurationMs / 60000) : null;

    return {
      id: session.id,
      userId: session.userId,
      status,
      score: session.score,
      interviewType: session.interviewType,
      duration: durationMins || undefined,
      startedAt: session.startedAt || null,
      completedAt: session.completedAt || null,
      createdAt: session.createdAt?.toDate?.()?.toISOString() || new Date(session.createdAt || 0).toISOString()
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
