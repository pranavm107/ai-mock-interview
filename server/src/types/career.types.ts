export interface CareerProfile {
  id?: string;
  userId: string;
  careerScore: number;
  careerReadiness: string;
  careerSummary: string;
  recommendedSkills: string[];
  priorityTopics: string[];
  estimatedHiringReadiness: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerScoreHistory {
  id?: string;
  userId: string;
  careerScore: number;
  interviewPerformance: number;
  communication: number;
  confidence: number;
  consistency: number;
  practiceFrequency: number;
  atsReadiness: number;
  skillGrowth: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyCoaching {
  id?: string;
  userId: string;
  focusAreas: string[];
  tasks: string[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyCoaching {
  id?: string;
  userId: string;
  achievements: string[];
  focusAreas: string[];
  improvementTrends: string[];
  longTermAdvice: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningRoadmap {
  id?: string;
  userId: string;
  thisWeek: RoadmapItem[];
  thisMonth: RoadmapItem[];
  next3Months: RoadmapItem[];
  futureSkills: RoadmapItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  learningGoal: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  resources: string[];
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface DailyGoal {
  id?: string;
  userId: string;
  tasks: DailyTask[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyTask {
  id: string;
  description: string;
  status: 'Completed' | 'Pending' | 'Skipped';
}

export interface AICareerResponse {
  careerScore: number;
  careerReadiness: string;
  weeklyCoaching: Omit<WeeklyCoaching, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  monthlyCoaching: Omit<MonthlyCoaching, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  dailyGoals: { tasks: Pick<DailyTask, 'description'>[] };
  learningRoadmap: Omit<LearningRoadmap, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  careerSummary: string;
  recommendedSkills: string[];
  priorityTopics: string[];
  estimatedHiringReadiness: string;
}
