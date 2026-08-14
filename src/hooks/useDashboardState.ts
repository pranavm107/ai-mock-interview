import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

export enum DashboardState {
  NEW_USER = "NEW_USER",
  RESUME_UPLOADED = "RESUME_UPLOADED",
  READY_FOR_INTERVIEW = "READY_FOR_INTERVIEW",
  INTERVIEW_IN_PROGRESS = "INTERVIEW_IN_PROGRESS",
  RETURNING_USER = "RETURNING_USER",
  POWER_USER = "POWER_USER",
}

export interface GettingStartedProgress {
  uploadResume: boolean;
  resumeAnalysis: boolean;
  generateInterview: boolean;
  completeInterview: boolean;
  viewFeedback: boolean;
  completedSteps: number;
  totalSteps: number;
  progress: number;
}

export interface DashboardMetadata {
  resumeUploaded: boolean;
  resumeAnalysed: boolean;
  careerGenerated: boolean;
  completedInterviews: number;
  draftInterviews: number;
  activeInterview: boolean;
  latestInterviewId?: string;
  latestDraftInterviewId?: string;
  latestCompletedReportId?: string;
  latestResumeId?: string;
  gettingStarted: GettingStartedProgress;
}

export interface DashboardStateResult {
  dashboardState: DashboardState;
  metadata: DashboardMetadata;
}

export const useDashboardState = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStateResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardState = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to load dashboard state');
      }
      const data = await res.json();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard state:', err);
      setError(err.message || 'Failed to fetch dashboard state');
      // Graceful fallback to NEW_USER
      setDashboardData({
        dashboardState: DashboardState.NEW_USER,
        metadata: {
          resumeUploaded: false,
          resumeAnalysed: false,
          careerGenerated: false,
          completedInterviews: 0,
          draftInterviews: 0,
          activeInterview: false,
          gettingStarted: {
            uploadResume: false,
            resumeAnalysis: false,
            generateInterview: false,
            completeInterview: false,
            viewFeedback: false,
            completedSteps: 0,
            totalSteps: 5,
            progress: 0
          }
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dashboardData,
    dashboardState: dashboardData?.dashboardState,
    loading,
    error,
    fetchDashboardState
  };
};
