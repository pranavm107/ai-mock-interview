import { useState, useEffect, useCallback } from 'react';
import type { InterviewSession, SessionAnswer, Interview } from '../types/interview';

export const useInterviewSession = (sessionId?: string) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${id}`);
      if (!res.ok) throw new Error('Failed to load session');
      const data = await res.json();
      setSession(data);
      
      // Also fetch the interview template to get the questions
      const interviewRes = await fetch(`http://localhost:3001/api/interviews/${data.interviewId}`);
      if (interviewRes.ok) {
        setInterview(await interviewRes.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  const startSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${session.id}/start`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start session');
      setSession(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${session.id}/next`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to advance to next question');
      setSession(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answerText: string, startTime: string, wordCount: number) => {
    if (!session) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${session.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answerText, startTime, wordCount })
      });
      if (!res.ok) throw new Error('Failed to submit answer');
      setSession(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${session.id}/skip`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to skip question');
      setSession(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    interview,
    answers,
    loading,
    error,
    startSession,
    nextQuestion,
    submitAnswer,
    skipQuestion,
    refresh: () => sessionId && fetchSession(sessionId)
  };
};
