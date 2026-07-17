export type InterviewSection = "RESUME" | "ROLE" | "COMPANY" | "BEHAVIORAL";

export type InterviewQuestionType =
  | "TECHNICAL"
  | "BEHAVIORAL"
  | "SYSTEM_DESIGN"
  | "CODING"
  | "HR";

export type InterviewDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface InterviewQuestionSource {
  resumeWeight: number;
  roleWeight: number;
  companyWeight: number;
  behavioralWeight: number;
}

export interface InterviewQuestion {
  id?: string;
  section: InterviewSection;
  type: InterviewQuestionType;
  difficulty: InterviewDifficulty;
  question: string;
  expectedTopics: string[];
  skillsEvaluated: string[];
  followUps: string[];
  estimatedTime?: number; // in minutes
  source?: InterviewQuestionSource;
}

export interface InterviewSettings {
  durationMinutes: number; // e.g. 45
  totalQuestions: number; // derived or explicitly set
  targetRole: string;
  targetCompany: string;
  candidateExperienceLevel: "Student" | "Junior" | "Mid" | "Senior" | "Lead";
  atsScore?: number; // Optional
}

export interface InterviewMetadata {
  promptVersion: string;
  plannerVersion: string;
  validatorVersion: string;
  profileVersion: string;
  model: string;
  generationTimeMs: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  questionDistribution: {
    resume: number;
    role: number;
    company: number;
    behavioral: number;
  };
  resumeHash: string;
  createdAt: string;
}

export interface InterviewAnalytics {
  resumeCoveragePercent: number;
  skillCoveragePercent: number;
  difficultyAlignmentPercent: number;
  roleAlignmentPercent: number;
  companyAlignmentPercent: number;
  questionDiversityPercent: number;
}

export interface Interview {
  id?: string;
  userId?: string;
  resumeId: string | null;
  company: string;
  role: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "MIXED";
  settings: InterviewSettings;
  metadata: InterviewMetadata;
  blueprint?: any; // Will be InterviewBlueprint
  coverage?: any;
  analytics?: InterviewAnalytics;
  questions: InterviewQuestion[];
}

export interface InterviewGenerationResponse {
  title: string;
  estimatedDuration: number;
  questions: Omit<InterviewQuestion, "id" | "source">[];
}
