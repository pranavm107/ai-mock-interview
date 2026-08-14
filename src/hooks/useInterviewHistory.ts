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
  resumeName: string | null;
  estimatedTime: number | null;
}

import { useAuth } from '@clerk/clerk-react';

import type { Interview } from '../types';

import { API_BASE_URL } from '../config/api';

export const useInterviewHistory = () => {
  const [sessions, setSessions] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();

  const fetchUserSessions = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/interview-sessions/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      
      const mappedSessions = data.map((session: EnrichedInterviewSession): Interview => {
        let status = 'Draft';
        if (['CREATED', 'READY'].includes(session.state)) status = 'Draft';
        else if (session.state === 'COMPLETED') status = 'Completed';
        else if (session.state === 'CANCELLED') status = 'Cancelled';
        else status = 'In Progress';
        
        return {
          id: session.id,
          userId: session.userId,
          resumeId: session.resumeName ? session.resumeName : null, // keep this for legacy checks
          resumeName: session.resumeName,
          title: `${session.role} Interview`,
          company: session.company,
          role: session.role,
          difficulty: session.difficulty as any,
          interviewType: session.interviewType as any,
          experienceLevel: 'Mid' as any, // Not strictly used in card UI, but kept for type compat
          language: 'English',
          status: status as any,
          score: session.score,
          totalQuestions: session.progress?.totalQuestions || 0,
          completedQuestions: session.metrics?.questionsAnswered || 0,
          duration: session.estimatedTime ? Math.round(session.estimatedTime / 60000) : (session.metrics?.totalDurationMs ? Math.round(session.metrics.totalDurationMs / 60000) : 0),
          currentQuestion: session.progress?.currentQuestionIndex || 0,
          elapsedSeconds: Math.round((session.metrics?.totalDurationMs || 0) / 1000),
          feedbackId: null,
          aiProvider: 'openai',
          startedAt: session.startedAt || null,
          completedAt: session.completedAt || null,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
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
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/interview-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete session');
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      console.error('Error deleting session:', err);
      setError(err.message || 'Failed to delete interview session');
    }
  }, [getToken]);

  return {
    sessions,
    loading,
    error,
    fetchUserSessions,
    deleteSession
  };
};
