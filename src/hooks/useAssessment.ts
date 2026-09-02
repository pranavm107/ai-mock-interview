import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { Assessment, AssessmentQuestionForUser, AssessmentResult, AssessmentSubmissionRequest } from '../types/assessment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseAssessmentReturn {
  loading: boolean;
  error: string | null;
  generateResumeAssessment: (resumeId: string) => Promise<{ id: string }>;
  fetchAssessment: (assessmentId: string) => Promise<{ assessment: Assessment; questions?: AssessmentQuestionForUser[]; result?: AssessmentResult }>;
  submitAssessment: (assessmentId: string, payload: AssessmentSubmissionRequest) => Promise<{ result: AssessmentResult }>;
}

export const useAssessment = (): UseAssessmentReturn => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = async () => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const generateResumeAssessment = useCallback(async (resumeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/assessments/resume/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resumeId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate assessment');
      }

      const data = await response.json();
      return { id: data.assessmentId || data.id };
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchAssessment = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to fetch assessment');
      }

      const data = await response.json();
      return { assessment: data.assessment, questions: data.questions, result: data.result };
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const submitAssessment = useCallback(async (assessmentId: string, payload: AssessmentSubmissionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to submit assessment');
      }

      const data = await response.json();
      return { result: data.result };
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return {
    loading,
    error,
    generateResumeAssessment,
    fetchAssessment,
    submitAssessment
  };
};
