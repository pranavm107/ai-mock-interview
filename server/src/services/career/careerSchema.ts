import { z } from 'zod';

export const CareerScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  interviewPerformance: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  practiceFrequency: z.number().min(0).max(100),
  skillGrowth: z.number().min(0).max(100),
  atsReadiness: z.number().min(0).max(100)
});

export const WeeklyCoachingSchema = z.object({
  focusAreas: z.array(z.string()),
  tasks: z.array(z.string()),
  recommendations: z.array(z.string())
});

export const MonthlyCoachingSchema = z.object({
  achievements: z.array(z.string()),
  focusAreas: z.array(z.string()),
  improvementTrends: z.array(z.string()),
  longTermAdvice: z.string()
});

export const RoadmapItemSchema = z.object({
  learningGoal: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
  estimatedHours: z.number(),
  resources: z.array(z.string()),
  status: z.enum(['Pending', 'In Progress', 'Completed'])
});

export const LearningRoadmapSchema = z.object({
  thisWeek: z.array(RoadmapItemSchema),
  thisMonth: z.array(RoadmapItemSchema),
  next3Months: z.array(RoadmapItemSchema),
  futureSkills: z.array(RoadmapItemSchema)
});

export const DailyGoalSchema = z.object({
  description: z.string()
});

export const AICareerResponseSchema = z.object({
  careerScore: z.number().min(0).max(100),
  careerReadiness: z.string(),
  weeklyCoaching: WeeklyCoachingSchema,
  monthlyCoaching: MonthlyCoachingSchema,
  learningRoadmap: LearningRoadmapSchema,
  dailyGoals: z.object({ tasks: z.array(DailyGoalSchema) }),
  careerSummary: z.string(),
  recommendedSkills: z.array(z.string()),
  priorityTopics: z.array(z.string()),
  estimatedHiringReadiness: z.string()
});

export type CareerScoreParams = z.infer<typeof CareerScoreSchema>;
export type WeeklyCoachingParams = z.infer<typeof WeeklyCoachingSchema>;
export type MonthlyCoachingParams = z.infer<typeof MonthlyCoachingSchema>;
export type LearningRoadmapParams = z.infer<typeof LearningRoadmapSchema>;
export type DailyGoalParams = z.infer<typeof DailyGoalSchema>;
export type AICareerResponseParams = z.infer<typeof AICareerResponseSchema>;
