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

export interface AchievementSummary {
  total: number;
  unlocked: number;
  locked: number;
  completionPercentage: number;
}

export interface AchievementWithProgress {
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
