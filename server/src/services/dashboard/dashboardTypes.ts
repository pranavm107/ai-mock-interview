export enum DashboardState {
  NEW_USER = "NEW_USER",
  RESUME_UPLOADED = "RESUME_UPLOADED",
  READY_FOR_INTERVIEW = "READY_FOR_INTERVIEW",
  INTERVIEW_IN_PROGRESS = "INTERVIEW_IN_PROGRESS",
  RETURNING_USER = "RETURNING_USER",
  POWER_USER = "POWER_USER",
}

export interface OnboardingStep {
  id: string;
  completed: boolean;
  enabled: boolean;
}

export interface OnboardingProgress {
  totalSteps: number;
  completedCount: number;
  isCompleted: boolean;
  completedSteps: string[];
  nextStep: string | null;
  steps: OnboardingStep[];
}

export interface DashboardStateResult {
  dashboardState: DashboardState;
  resumeUploaded: boolean;
  resumeAnalysed: boolean;
  careerGenerated: boolean;
  completedInterviews: number;
  draftInterviews: number;
  activeInterview: boolean;
  latestInterviewId?: string;
  latestResumeId?: string;
  latestCompletedReportId?: string;
  latestDraftInterviewId?: string;
  onboardingProgress: OnboardingProgress;

  // New Rich Data Fields
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
