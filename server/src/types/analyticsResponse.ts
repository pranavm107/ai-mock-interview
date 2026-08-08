import { 
  DashboardAnalytics, 
  PerformanceTrend, 
  SkillTrend, 
  CategoryTrend, 
  DifficultyAnalytics, 
  ActivityHeatmap, 
  SpeechAnalytics, 
  QuestionAnalytics,
  ResumeAnalytics 
} from './analytics';

export interface AnalyticsRecommendation {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  action: string;
  category: string;
}

export interface AnalyticsResponse {
  overview: DashboardAnalytics;
  performanceTrend: PerformanceTrend;
  skillTrend: SkillTrend;
  categoryTrend: CategoryTrend;
  difficultyAnalytics: DifficultyAnalytics;
  activityHeatmap: ActivityHeatmap;
  speechAnalytics: SpeechAnalytics;
  questionAnalytics: QuestionAnalytics;
  resumeAnalytics: ResumeAnalytics | null;
  recommendations: AnalyticsRecommendation[];
  generatedAt: string;
}
