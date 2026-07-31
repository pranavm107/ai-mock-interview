import { useState, useCallback } from 'react';

// Since we enriched the session on the backend, let's define the local type
export interface EnrichedInterviewSession {
  id: string;
  interviewId: string;
  userId: string;
  state: string; // 'CREATED' | 'READY' | 'STARTED' | 'COMPLETED' etc.
  progress: {
    currentQuestionIndex: number;
    totalQuestions: number;
    isComplete: boolean;
  };
  metrics: {
    totalDurationMs: number;
    activeDurationMs: number;
    questionsAnswered: number;
    questionsSkipped: number;
  };
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  company: string;
  role: string;
  interviewType: string;
  difficulty: string;
  score: number | null;
}

export const useInterviewHistory = () => {
  const [sessions, setSessions] = useState<EnrichedInterviewSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSessions = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/api/interview-sessions/user/${userId}`);
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      
      const mappedSessions = data.map((session: EnrichedInterviewSession): any => {
        let status = 'Draft';
        if (['CREATED', 'READY'].includes(session.state)) status = 'Draft';
        else if (session.state === 'COMPLETED') status = 'Completed';
        else if (session.state === 'CANCELLED') status = 'Cancelled';
        else status = 'In Progress';
        
        return {
          id: session.id,
          userId: session.userId,
          company: session.company,
          role: session.role,
          difficulty: session.difficulty,
          interviewType: session.interviewType,
          status,
          score: session.score,
          totalQuestions: session.progress?.totalQuestions || 5,
          completedQuestions: session.metrics?.questionsAnswered || 0,
          duration: session.metrics?.totalDurationMs ? Math.round(session.metrics.totalDurationMs / 60000) : 30,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          state: session.state, 
          metrics: session.metrics 
        };
      });
      
      setSessions(mappedSessions);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch interview history');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    // Local state removal for now since DELETE /api/interview-sessions/:id is not implemented yet in this phase
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchUserSessions,
    deleteSession
  };
};
