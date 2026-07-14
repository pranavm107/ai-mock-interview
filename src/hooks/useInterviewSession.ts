import { useState, useEffect, useCallback, useRef } from 'react';
import * as interviewService from '../services/interviewService';
import type { Interview, InterviewQuestion } from '../types';
import { useSpeechRecognition } from './useSpeechRecognition';

type SaveStatus = 'saved' | 'saving' | 'offline' | 'error';

export const useInterviewSession = (interviewId: string | undefined) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAnswerRef = useRef(currentAnswer);

  const fetchSession = useCallback(async () => {
    if (!interviewId) return;
    try {
      setLoading(true);
      const [fetchedInterview, fetchedQuestions] = await Promise.all([
        interviewService.loadInterview(interviewId),
        interviewService.loadQuestions(interviewId)
      ]);

      if (fetchedInterview) {
        setInterview(fetchedInterview);
        setElapsedSeconds(fetchedInterview.elapsedSeconds || 0);
        setIsPaused(fetchedInterview.status === 'Paused');

        // Ensure currentQuestion is within bounds
        const qIndex = Math.max(0, Math.min((fetchedInterview.currentQuestion || 1) - 1, fetchedQuestions.length - 1));
        setCurrentQuestionIndex(qIndex);

        if (fetchedQuestions.length > 0) {
          setCurrentAnswer(fetchedQuestions[qIndex]?.answer || '');
          currentAnswerRef.current = fetchedQuestions[qIndex]?.answer || '';
        }
      }
      setQuestions(fetchedQuestions);
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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

  // Sync refs
  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);

  const saveCurrentAnswer = useCallback(async (_isImmediate = false) => {
    if (!interview || questions.length === 0 || isPaused) return;

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    if (currentQ.answer === currentAnswerRef.current) return; // No changes

    console.log('Autosaving...');
    setSaveStatus('saving');
    try {
      await interviewService.saveAnswer(
        interview.id,
        currentQ.id,
        currentAnswerRef.current,
        0 // Add individual question duration logic later if needed
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
    }, 1000); // 1 second after typing stops

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [currentAnswer, saveCurrentAnswer, loading, isPaused]);

  // Periodic Firestore Progress Sync (every 10s)
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
      console.log('Transcript appended');
      setCurrentAnswer(prev => {
        const newAnswer = prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text;
        return newAnswer;
      });
      setInterimTranscript('');
      if (saveStatus === 'saved' || saveStatus === 'error') {
        setSaveStatus('saving');
      }
    } else {
      setInterimTranscript(text);
    }
  }, [isPaused, saveStatus]);

  const speech = useSpeechRecognition(handleTranscript, null);

  // Sync pause/resume/finish with speech
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

    // Calculate simple mock score based on answered questions
    const answeredCount = questions.filter(q => q.answer.trim().length > 0 || (q.id === questions[currentQuestionIndex].id && currentAnswerRef.current.trim().length > 0)).length;
    const mockScore = Math.round((answeredCount / questions.length) * 100);

    await interviewService.finishInterview(interview.id, durationMinutes, mockScore);

    setInterview(prev => prev ? { ...prev, status: 'Completed', score: mockScore, duration: durationMinutes } : prev);
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

  const nextQuestion = () => changeQuestion(currentQuestionIndex + 1);
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
    interview,
    questions,
    loading,
    error,
    currentQuestionIndex,
    currentQuestion: currentQuestionObj,
    currentAnswer,
    elapsedSeconds,
    saveStatus,
    isPaused,
    updateAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion: changeQuestion,
    pauseInterview: pause,
    resumeInterview: resume,
    finishInterview: finish,
    speech,
    interimTranscript
  };
};
