export type AssessmentType = 'RESUME_MCQ' | 'APTITUDE' | 'TECHNICAL_MCQ';

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
 * Backend-authoritative question model (contains correct answers).
 * Kept in Firestore 'assessments/{assessmentId}/questions/{questionId}'.
 */
export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  question: string;
  options: AssessmentOption[];
  correctOptionId: string;
  explanation: string;
  skill?: string;
  difficulty: AssessmentDifficulty;
  category?: AptitudeCategory;
}

/**
 * Safe question model for the frontend (strips correct answers and explanations).
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
 * The core Assessment model stored in Firestore.
 * Does not contain the questions directly to avoid massive document sizes.
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
  
  // Specific to Preparation Module
  topic?: string;
  mode?: 'PRACTICE' | 'TIMED';
  
  // Overall difficulty if applicable
  difficulty?: AssessmentDifficulty;
  
  title: string;
  description?: string;
  
  questionCount: number;
  answeredCount?: number;
  
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
 * The final authoritative result calculated by the backend.
 * Stored in Firestore and returned to the frontend.
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

/**
 * Expected JSON output schema from Groq during generation.
 */
export interface AssessmentGenerationAIOutput {
  questions: Omit<AssessmentQuestion, 'id' | 'assessmentId'>[];
}
