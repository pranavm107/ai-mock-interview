import { useState, useCallback } from 'react';
import * as interviewService from '../services/interviewService';
import type { Interview, InterviewQuestion } from '../types';

export const useInterview = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshInterviews = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await interviewService.getUserInterviews(userId);
      setInterviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInterview = useCallback(async (
    userId: string, 
    data: Omit<Interview, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'startedAt' | 'completedAt' | 'status' | 'completedQuestions' | 'score'>,
    questions: Omit<InterviewQuestion, 'id' | 'createdAt' | 'interviewId'>[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newInterview = await interviewService.createInterview(userId, data);
      await interviewService.saveQuestions(newInterview.id, questions);
      setCurrentInterview(newInterview);
      const savedQuestions = await interviewService.getQuestions(newInterview.id);
      setCurrentQuestions(savedQuestions);
      setInterviews(prev => [newInterview, ...prev]);
      return newInterview;
    } catch (err: any) {
      setError(err.message || 'Failed to create interview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInterview = useCallback(async (interviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      const interviewData = await interviewService.getInterview(interviewId);
      setCurrentInterview(interviewData);
      if (interviewData) {
        const questionsData = await interviewService.getQuestions(interviewId);
        setCurrentQuestions(questionsData);
      }
      return interviewData;
    } catch (err: any) {
      setError(err.message || 'Failed to get interview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInterview = useCallback(async (userId: string, interviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      await interviewService.deleteInterview(userId, interviewId);
      setInterviews(prev => prev.filter(i => i.id !== interviewId));
      if (currentInterview?.id === interviewId) {
        setCurrentInterview(null);
        setCurrentQuestions([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete interview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentInterview]);

  const startInterview = useCallback(async (interviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      await interviewService.startInterview(interviewId);
      setCurrentInterview(prev => prev ? { ...prev, status: 'In Progress', startedAt: new Date() as any } : prev);
      setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, status: 'In Progress' } : i));
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeInterview = useCallback(async (interviewId: string, score: number) => {
    setLoading(true);
    setError(null);
    try {
      await interviewService.completeInterview(interviewId, score);
      setCurrentInterview(prev => prev ? { ...prev, status: 'Completed', score, completedAt: new Date() as any } : prev);
      setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, status: 'Completed', score } : i));
    } catch (err: any) {
      setError(err.message || 'Failed to complete interview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelInterview = useCallback(async (interviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      await interviewService.cancelInterview(interviewId);
      setCurrentInterview(prev => prev ? { ...prev, status: 'Cancelled' } : prev);
      setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, status: 'Cancelled' } : i));
    } catch (err: any) {
      setError(err.message || 'Failed to cancel interview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAnswer = useCallback(async (interviewId: string, questionId: string, userAnswer: string, duration: number) => {
    setLoading(true);
    setError(null);
    try {
      await interviewService.saveAnswer(interviewId, questionId, userAnswer, duration);
      setCurrentQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, userAnswer, duration, answered: true } : q
      ));
      
      // Update completed questions count
      const updatedInterview = { completedQuestions: (currentInterview?.completedQuestions || 0) + 1 };
      await interviewService.updateInterview(interviewId, updatedInterview);
      setCurrentInterview(prev => prev ? { ...prev, completedQuestions: prev.completedQuestions + 1 } : prev);
      
    } catch (err: any) {
      setError(err.message || 'Failed to save answer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentInterview]);

  return {
    interviews,
    currentInterview,
    currentQuestions,
    loading,
    error,
    refreshInterviews,
    createInterview,
    getInterview,
    deleteInterview,
    startInterview,
    completeInterview,
    cancelInterview,
    saveAnswer
  };
};
