export interface DashboardAnalytics {
  totalInterviews: number;
  completedInterviews: number;
  draftInterviews: number;
  inProgressInterviews: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalPracticeDuration: number;
  averageInterviewDuration: number;
}

export interface PerformanceTrendPoint {
  date: string;
  overallScore: number;
}
export type PerformanceTrend = PerformanceTrendPoint[];

export interface SkillTrendItem {
  skill: string;
  history: {
    date: string;
    score: number;
  }[];
}
export type SkillTrend = SkillTrendItem[];

export interface CategoryTrendPoint {
  date: string;
  technical: number;
  communication: number;
  behavioral: number;
  confidence: number;
  problemSolving: number;
  timeManagement: number;
}
export type CategoryTrend = CategoryTrendPoint[];

export interface DifficultyAnalyticsItem {
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  averageScore: number;
  interviewCount: number;
  successRate: number;
}
export type DifficultyAnalytics = DifficultyAnalyticsItem[];

export interface ActivityHeatmapPoint {
  date: string; // ISO date string
  completedCount: number;
}
export type ActivityHeatmap = ActivityHeatmapPoint[];

export interface SpeechAnalytics {
  averageFillerWords: number;
  averageFillerRatio: number;
  averageSilenceDuration: number;
  averageSilenceRatio: number;
  averageSpeakingSpeed: number;
  averageConfidence?: number;
}

export interface QuestionAnalytics {
  totalQuestions: number;
  answered: number;
  skipped: number;
  completionRate: number;
  skipRate: number;
}

export interface ResumeAnalytics {
  atsScore: number | null;
  resumeScore: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  completionScore: number | null;
  skillsCount: number;
  projectsCount: number;
  experienceCount: number;
}
