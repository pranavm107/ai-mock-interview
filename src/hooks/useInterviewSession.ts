import { useState, useEffect, useCallback, useRef } from 'react';
import type { InterviewSession, SessionAnswer, Interview, InterviewQuestion } from '../types/interview';
import type { LiveEvaluation } from '../types/liveEvaluation';
import type { DecisionType } from '../types/decision';
import type { DifficultyLevel, AdaptiveEvaluationResult } from '../types/adaptive';
import type { CommunicationAnalytics, SpeechAnalyticsRecord } from '../types/speech';
import * as interviewService from '../services/interviewService';
import { useSpeechRecognition } from './useSpeechRecognition';
import { API_BASE_URL } from '../config/api';

type SaveStatus = 'saved' | 'saving' | 'offline' | 'error';

export const useInterviewSession = (sessionIdOrInterviewId?: string) => {
  // Backend Session State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [liveEvaluation, setLiveEvaluation] = useState<LiveEvaluation | null>(null);
  const [communicationAnalytics, setCommunicationAnalytics] = useState<CommunicationAnalytics | null>(null);
  const [speechTimeline, setSpeechTimeline] = useState<SpeechAnalyticsRecord[]>([]);
  
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

  const [reportPending, setReportPending] = useState(false);

  // Common State
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client Runtime State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAnswerRef = useRef(currentAnswer);

  const fetchSessionData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      // Try backend session endpoint first
      const res = await fetch(`${API_BASE_URL}/api/interview-sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        const interviewRes = await fetch(`${API_BASE_URL}/api/interviews/${data.interviewId}`);
        if (interviewRes.ok) {
          setInterview(await interviewRes.json());
        }
      } else {
        // Fallback to client/firestore interview lookup
        const [fetchedInterview, fetchedQuestions] = await Promise.all([
          interviewService.loadInterview(id),
          interviewService.loadQuestions(id)
        ]);

        if (fetchedInterview) {
          setInterview(fetchedInterview);
          setElapsedSeconds(fetchedInterview.elapsedSeconds || 0);
          setIsPaused(fetchedInterview.status === 'Paused');

          const qIndex = Math.max(0, Math.min((fetchedInterview.currentQuestion || 1) - 1, fetchedQuestions.length - 1));
          setCurrentQuestionIndex(qIndex);

          if (fetchedQuestions.length > 0) {
            setCurrentAnswer(fetchedQuestions[qIndex]?.answer || '');
            currentAnswerRef.current = fetchedQuestions[qIndex]?.answer || '';
          }
        }
        setQuestions(fetchedQuestions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionIdOrInterviewId) {
      fetchSessionData(sessionIdOrInterviewId);
    }
  }, [sessionIdOrInterviewId, fetchSessionData]);

  // Timer
  useEffect(() => {
    if (loading || !interview || isPaused || interview.status === 'Completed') return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, interview, isPaused]);

  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);

  const saveCurrentAnswer = useCallback(async (_isImmediate = false) => {
    if (!interview || questions.length === 0 || isPaused) return;

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    if (currentQ.answer === currentAnswerRef.current) return;

    setSaveStatus('saving');
    try {
      await interviewService.saveAnswer(
        interview.id,
        currentQ.id,
        currentAnswerRef.current,
        0
      );

      setQuestions(prev => prev.map((q, idx) =>
        idx === currentQuestionIndex
          ? { ...q, answer: currentAnswerRef.current, status: currentAnswerRef.current.trim() ? 'answered' : 'pending' }
          : q
      ));
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  }, [interview, questions, currentQuestionIndex, isPaused]);

  // Auto-save
  useEffect(() => {
    if (loading || isPaused) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentAnswer();
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [currentAnswer, saveCurrentAnswer, loading, isPaused]);

  // Periodic Firestore Sync
  useEffect(() => {
    if (loading || !interview || isPaused || interview.status === 'Completed') return;

    const syncTimer = setInterval(() => {
      interviewService.updateProgress(interview.id, currentQuestionIndex + 1, elapsedSeconds).catch(console.error);
    }, 10000);

    return () => clearInterval(syncTimer);
  }, [loading, interview, isPaused, currentQuestionIndex, elapsedSeconds]);

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isPaused) return;

    if (isFinal) {
      setCurrentAnswer(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text);
      setInterimTranscript('');
      if (saveStatus === 'saved' || saveStatus === 'error') {
        setSaveStatus('saving');
      }
    } else {
      setInterimTranscript(text);
    }
  }, [isPaused, saveStatus]);

  const speech = useSpeechRecognition(handleTranscript, null);

  // Backend session actions
  const startSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/interview-sessions/${session.id}/start`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start session');
      setSession(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeQuestion = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length || isPaused) return;

    await saveCurrentAnswer(true);
    setInterimTranscript('');

    setCurrentQuestionIndex(newIndex);
    setCurrentAnswer(questions[newIndex]?.answer || '');
    currentAnswerRef.current = questions[newIndex]?.answer || '';

    if (interview) {
      interviewService.updateProgress(interview.id, newIndex + 1, elapsedSeconds).catch(console.error);
    }
  };

  const nextQuestion = async () => {
    if (session) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 35000);
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/interview-sessions/${session.id}/next`, { 
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
    } else {
      changeQuestion(currentQuestionIndex + 1);
    }
  };

  const submitAnswer = async (questionId: string, answerText: string, startTime: string, wordCount: number) => {
    if (!session) return null;
    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      // We don't set global loading(true) here, only analytics loading
      // to prevent the main UI from blocking/showing global spinners.
      
      const res = await fetch(`${API_BASE_URL}/api/interview-sessions/${session.id}/adaptive-answer`, {
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
      
      if (data.communicationAnalytics) {
        setCommunicationAnalytics(data.communicationAnalytics);
      }
      
      if (data.timeline) {
        setSpeechTimeline(data.timeline);
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
    const timeoutId = setTimeout(() => abortController.abort(), 35000);
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/interview-sessions/${session.id}/skip`, { 
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

  const pause = async () => {
    if (!interview || isPaused) return;
    speech.pauseRecording();
    await saveCurrentAnswer(true);
    setIsPaused(true);
    await interviewService.pauseInterview(interview.id, currentQuestionIndex + 1, elapsedSeconds);
  };

  const resume = async () => {
    if (!interview || !isPaused) return;
    setIsPaused(false);
    speech.resumeRecording();
    await interviewService.resumeInterview(interview.id);
  };

  const finish = async () => {
    if (!interview) return;
    speech.stopRecording();
    speech.disconnectWebSocket();
    await saveCurrentAnswer(true);

    const durationMinutes = Math.ceil(elapsedSeconds / 60);
    const answeredCount = questions.filter(q => (q.answer && q.answer.trim().length > 0) || (q.id === questions[currentQuestionIndex]?.id && currentAnswerRef.current.trim().length > 0)).length;
    const interimScore = Math.round((answeredCount / (questions.length || 1)) * 100);

    await interviewService.finishInterview(interview.id, durationMinutes, interimScore);
    setInterview(prev => prev ? { ...prev, status: 'Completed', score: interimScore, duration: durationMinutes } : prev);
  };

  const prevQuestion = () => changeQuestion(currentQuestionIndex - 1);

  const updateAnswer = (text: string) => {
    if (isPaused) return;
    setCurrentAnswer(text);
    if (saveStatus === 'saved' || saveStatus === 'error') {
      setSaveStatus('saving');
    }
  };

  const currentQuestionObj = questions[currentQuestionIndex];

  return {
    session,
    interview,
    answers,
    setAnswers,
    questions,
    loading,
    error,
    reportPending,
    liveEvaluation,
    communicationAnalytics,
    speechTimeline,
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
    refresh: () => sessionIdOrInterviewId && fetchSessionData(sessionIdOrInterviewId),
    currentQuestionIndex,
    currentQuestion: currentQuestionObj,
    currentAnswer,
    elapsedSeconds,
    saveStatus,
    isPaused,
    updateAnswer,
    prevQuestion,
    goToQuestion: changeQuestion,
    pauseInterview: pause,
    resumeInterview: resume,
    finishInterview: finish,
    speech,
    interimTranscript
  };
};

