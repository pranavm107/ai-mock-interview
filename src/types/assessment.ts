export type AssessmentType = 'RESUME_MCQ' | 'APTITUDE';

export type AssessmentStatus = 'GENERATING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type AptitudeCategory = 
  | 'QUANTITATIVE' 
  | 'LOGICAL_REASONING' 
  | 'VERBAL' 
  | 'DATA_INTERPRETATION' 
  | 'PROBLEM_SOLVING';

export type AssessmentDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AssessmentOption {
  id: string;
  text: string;
}

/**
 * Safe question model for the frontend.
 * Correct answers and explanations are protected by the backend.
 */
export interface AssessmentQuestionForUser {
  id: string;
  assessmentId: string;
  question: string;
  options: AssessmentOption[];
  skill?: string;
  difficulty: AssessmentDifficulty;
  category?: AptitudeCategory;
}

/**
 * The core Assessment model as received by the frontend.
 */
export interface Assessment {
  id: string;
  userId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  
  // Specific to RESUME_MCQ
  resumeId?: string | null;
  
  // Specific to APTITUDE
  category?: AptitudeCategory;
  
  // Overall difficulty if applicable
  difficulty?: AssessmentDifficulty;
  
  title: string;
  description?: string;
  
  questionCount: number;
  answeredCount?: number;
  score?: number;
  
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

/**
 * Single answer submission from frontend.
 */
export interface AssessmentAnswerSubmission {
  questionId: string;
  selectedOptionId: string;
}

/**
 * Full submission payload.
 */
export interface AssessmentSubmissionRequest {
  answers: AssessmentAnswerSubmission[];
}

export interface SkillPerformance {
  skill: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  options: AssessmentOption[];
  selectedOptionId?: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
  skill?: string;
  difficulty: AssessmentDifficulty;
}

/**
 * The final authoritative result returned from the backend after submission.
 */
export interface AssessmentResult {
  assessmentId: string;
  userId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  percentage: number;
  skillPerformance: SkillPerformance[];
  questionResults: QuestionResult[];
  completedAt: string;
}
