import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';

export interface DashboardData {
  dashboardState: string;
  metadata: {
    resumeUploaded: boolean;
    resumeAnalysed: boolean;
    careerGenerated: boolean;
    completedInterviews: number;
    draftInterviews: number;
    activeInterview: boolean;
    latestInterviewId?: string;
    latestDraftInterviewId?: string;
    latestCompletedReportId?: string;
    onboardingProgress: {
      totalSteps: number;
      completedCount: number;
      isCompleted: boolean;
      completedSteps: string[];
      nextStep: string | null;
      steps: {
        id: string;
        completed: boolean;
        enabled: boolean;
      }[];
    };
    
    activeResume?: {
      id: string;
      filename: string;
      uploadedAt: string;
      size: number;
      hasAnalysis: boolean;
      atsScore?: number;
    };
    recentInterviews: any[];
    stats: {
      totalResumes: number;
      completedInterviews: number;
      averageScore: number;
      scoreTrend: number;
      currentStreak: number;
      averageDuration: number;
    };
    achievements: {
      id: string;
      title: string;
      unlocked: boolean;
      progress?: number;
      max?: number;
    }[];
    performanceData: { 
      name: string; 
      date: string;
      score: number;
      interviewId: string;
      role: string;
      company: string;
    }[];
    recommendations: string[];
  }
}

interface AppState {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDashboardData: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  dashboardData: null,
  loading: false,
  error: null,
  
  fetchDashboardData: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // In a real app we'd pass the auth token. Currently the backend 
      // uses the session cookie / params for dashboard endpoint
      const res = await fetch(`${API_BASE_URL}/api/dashboard/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to load dashboard data');
      }
      const data = await res.json();
      set({ dashboardData: data, loading: false });
    } catch (err: any) {
      console.error('Error fetching dashboard state:', err);
      set({ 
        error: err.message, 
        loading: false,
        // Fallback state
        dashboardData: {
          dashboardState: "NEW_USER",
          metadata: {
            resumeUploaded: false,
            resumeAnalysed: false,
            careerGenerated: false,
            completedInterviews: 0,
            draftInterviews: 0,
            activeInterview: false,
            onboardingProgress: {
              totalSteps: 5,
              completedCount: 0,
              isCompleted: false,
              completedSteps: [],
              nextStep: 'UPLOAD_RESUME',
              steps: [
                { id: 'UPLOAD_RESUME', completed: false, enabled: true },
                { id: 'ANALYZE_RESUME', completed: false, enabled: false },
                { id: 'GENERATE_INTERVIEW', completed: false, enabled: false },
                { id: 'COMPLETE_INTERVIEW', completed: false, enabled: false },
                { id: 'VIEW_FEEDBACK', completed: false, enabled: false }
              ]
            },
            recentInterviews: [],
            stats: {
              totalResumes: 0,
              completedInterviews: 0,
              averageScore: 0,
              scoreTrend: 0,
              currentStreak: 0,
              averageDuration: 0
            },
            achievements: [],
            performanceData: [],
            recommendations: []
          }
        }
      });
    }
  }
}));
