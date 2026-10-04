import { z } from 'zod';

export type RecommendationSource = 
  | 'analytics'
  | 'weak_areas'
  | 'career_goal'
  | 'interview_history'
  | 'profile'
  | 'resume'
  | 'streak_recovery'
  | 'default';

export interface SuggestedInterview {
  targetRole: string; 
  targetCompany?: string | null; 
  interviewType: "Technical" | "HR" | "Behavioral" | "Mixed" | "MCQ"; 
  difficulty: "EASY" | "MEDIUM" | "HARD"; 
  experienceLevel: "Student" | "Junior" | "Mid" | "Senior" | "Lead"; 
  questionCount: number; 
  durationMinutes: number; 
  resumeId?: string | null; 
  focusAreas?: string[]; 
  recommendationReason?: string; 
  recommendationSource?: RecommendationSource; 
  generatedAt: string; 
  coachingMessage?: string;
  preparationFocus?: string[];
  questionEmphasis?: string[];
}

export const SuggestedInterviewRequestSchema = z.object({
  resumeId: z.string().optional()
});

export const SuggestedInterviewValidationSchema = z.object({
  targetRole: z.string().trim().min(1),
  targetCompany: z.string().trim().min(1).nullable().optional(),
  interviewType: z.enum(["Technical", "HR", "Behavioral", "Mixed", "MCQ"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  experienceLevel: z.enum(["Student", "Junior", "Mid", "Senior", "Lead"]),
  questionCount: z.number().int().min(3).max(10),
  durationMinutes: z.number().int().min(15).max(60),
  resumeId: z.string().min(1).nullable().optional(),
  focusAreas: z.array(z.string().trim().min(1)).max(3),
  recommendationReason: z.string().trim().min(1),
  recommendationSource: z.enum([
    'analytics',
    'weak_areas',
    'career_goal',
    'interview_history',
    'profile',
    'resume',
    'streak_recovery',
    'default'
  ]),
  generatedAt: z.string().datetime(),
  coachingMessage: z.string().optional(),
  preparationFocus: z.array(z.string()).max(5).optional(),
  questionEmphasis: z.array(z.string()).max(5).optional()
}).strict();

export interface IncompleteProfileState {
  status: 'incomplete_profile';
  message: string;
  missingFields: string[];
}

export interface SuggestedInterviewRequest {
  resumeId?: string; 
}

export interface SuggestionResponse {
  success: boolean;
  status?: 'ready' | 'incomplete_profile';
  message?: string;
  missingFields?: string[];
  data?: {
    suggestion: SuggestedInterview;
  };
}
