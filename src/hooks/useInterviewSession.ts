import { useState, useEffect, useCallback } from 'react';
import type { InterviewSession, SessionAnswer, Interview } from '../types/interview';
import type { LiveEvaluation } from '../types/liveEvaluation';
import type { DecisionType } from '../types/decision';
import type { DifficultyLevel, AdaptiveEvaluationResult } from '../types/adaptive';

export const useInterviewSession = (sessionId?: string) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [liveEvaluation, setLiveEvaluation] = useState<LiveEvaluation | null>(null);
  
  // New Adaptive State
  const [decision, setDecision] = useState<DecisionType | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [adaptiveResult, setAdaptiveResult] = useState<AdaptiveEvaluationResult | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsLastUpdated, setAnalyticsLastUpdated] = useState<string | null>(null);

  const [answers] = useState<SessionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportPending, setReportPending] = useState(false);

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
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 35000); // 35s timeout
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${session.id}/next`, { 
        method: 'POST',
        signal: abortController.signal
      });
      if (!res.ok) throw new Error('Failed to advance to next question');
      const data = await res.json();
      if (data.reportPending) {
        setReportPending(true);
        setSession(data.session);
      } else {
        setSession(data.session || data);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out while generating report.');
      } else {
        setError(err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answerText: string, startTime: string, wordCount: number) => {
    if (!session) return null;
    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      // We don't set global loading(true) here, only analytics loading
      // to prevent the main UI from blocking/showing global spinners.
      
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${session.id}/adaptive-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answerText, startTime, wordCount })
      });
      if (!res.ok) throw new Error('Failed to submit answer and generate analytics');
      const data = await res.json();
      setSession(data.session || data);
      
      if (data.liveEvaluation) {
        setLiveEvaluation(data.liveEvaluation);
        if (data.liveEvaluation.interviewProgress?.currentConfidence !== undefined) {
          setConfidence(data.liveEvaluation.interviewProgress.currentConfidence);
        }
      }
      
      if (data.adaptiveResult) {
        const adaptive = data.adaptiveResult as AdaptiveEvaluationResult;
        setAdaptiveResult(adaptive);
        setDecision(adaptive.decision || null);
        setDifficulty(adaptive.difficulty || null);
        setRemainingQuestions(adaptive.remainingQuestions ?? null);
        setRemainingTime(adaptive.remainingTime ?? null);
      }
      
      setAnalyticsLastUpdated(new Date().toISOString());
      return data;
    } catch (err: any) {
      setAnalyticsError(err.message);
      // Do NOT setError(err.message) to prevent crashing the interview runtime
      return null;
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const skipQuestion = async () => {
    if (!session) return;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 35000); // 35s timeout
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/interview-sessions/${session.id}/skip`, { 
        method: 'POST',
        signal: abortController.signal
      });
      if (!res.ok) throw new Error('Failed to skip question');
      const data = await res.json();
      if (data.reportPending) {
        setReportPending(true);
        setSession(data.session);
      } else {
        setSession(data.session || data);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out while generating report.');
      } else {
        setError(err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return {
    session,
    interview,
    answers,
    loading,
    error,
    reportPending,
    liveEvaluation,
    decision,
    difficulty,
    remainingQuestions,
    remainingTime,
    confidence,
    adaptiveResult,
    analyticsError,
    loadingAnalytics,
    analyticsLastUpdated,
    startSession,
    nextQuestion,
    submitAnswer,
    skipQuestion,
    refresh: () => sessionId && fetchSession(sessionId)
  };
};
