export enum AchievementCategory {
  INTERVIEW = 'INTERVIEW',
  PERFORMANCE = 'PERFORMANCE',
  CONSISTENCY = 'CONSISTENCY',
  SKILLS = 'SKILLS',
  RESUME = 'RESUME'
}

export enum AchievementRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum RequirementType {
  INTERVIEW_COUNT = 'INTERVIEW_COUNT',
  SCORE_THRESHOLD = 'SCORE_THRESHOLD',
  STREAK_DAYS = 'STREAK_DAYS',
  PROFILE_COMPLETION = 'PROFILE_COMPLETION',
  RESUME_ADDED = 'RESUME_ADDED',
  ATS_SCORE = 'ATS_SCORE'
}

export interface AchievementDefinition {
  id?: string;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  requirementType: RequirementType;
  requirementValue: number;
  isActive: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface UserAchievement {
  id?: string;
  userId: string;
  achievementId: string; // Foreign key mapping to AchievementDefinition.id / key
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt: string | null; // ISO String
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export enum AchievementEventType {
  INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED",
  INTERVIEW_SCORED = "INTERVIEW_SCORED",
  STREAK_UPDATED = "STREAK_UPDATED",
  RESUME_ADDED = "RESUME_ADDED",
  RESUME_ATS_SCORED = "RESUME_ATS_SCORED",
  PROFILE_COMPLETED = "PROFILE_COMPLETED"
}

export interface AchievementEvent {
  type: AchievementEventType;
  userId: string;
  sourceId?: string;
  score?: number;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface AchievementEvaluationResult {
  evaluated: number;
  updated: number;
  unlocked: string[];
}

export interface AchievementSummary {
  total: number;
  unlocked: number;
  locked: number;
  completionPercentage: number;
  currentStreak?: number; // Optional based on endpoint capabilities
}

export interface AchievementWithProgress extends AchievementDefinition {
  progress: number;
  progressPercentage: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementsResponse {
  success: boolean;
  data: {
    summary: AchievementSummary;
    achievements: AchievementWithProgress[];
  };
}
