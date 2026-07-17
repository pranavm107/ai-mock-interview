export type InterviewType = "Technical" | "HR" | "Behavioral" | "Mixed";
export type InterviewDifficulty = "Easy" | "Medium" | "Hard" | "EASY" | "MEDIUM" | "HARD" | "MIXED";
export type ExperienceLevel = "Fresher" | "Junior" | "Mid" | "Senior" | "Student" | "Lead";

export type InterviewSessionState =
  | 'CREATED'
  | 'READY'
  | 'STARTED'
  | 'ASKING'
  | 'ANSWERING'
  | 'EVALUATING'
  | 'PAUSED'
  | 'RESUMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'EXPIRED';

// The Immutable Generated Blueprint
export interface Interview {
  id: string;
  userId: string;
  resumeId: string | null;
  title: string;
  company: string;
  role: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  experienceLevel: ExperienceLevel;
  language: string;
  duration: number; // legacy format (some fields from Phase 4 still exist)
  totalQuestions: number;
  completedQuestions: number;
  score: number | null;
  feedbackId: string | null;
  aiProvider: string;
  status: InterviewStatus;
  startedAt: any | null;
  completedAt: any | null;
  createdAt: any; 
  updatedAt: any;
  
  // Phase 5 specific fields
  settings?: any;
  metadata?: any;
  questions?: any[]; // Generated questions
}

export type InterviewStatus = "Draft" | "Ready" | "In Progress" | "Completed" | "Cancelled";

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  order: number;
  question: string;
  expectedAnswer: string;
  userAnswer: string;
  aiFeedback: string;
  aiScore: number;
  answered: boolean;
  skipped: boolean;
  duration: number;
  createdAt: any;
}

// The Stateful Runtime Session
export interface InterviewSession {
  id: string;
  interviewId: string;
  userId: string;
  state: InterviewSessionState;
  progress: {
    currentQuestionIndex: number;
    totalQuestions: number;
    isComplete: boolean;
  };
  metrics: {
    totalDurationMs: number;
    activeDurationMs: number;
    pausedDurationMs: number;
    questionsAnswered: number;
    questionsSkipped: number;
    averageAnswerDurationMs: number;
  };
  settings: {
    allowSkip: boolean;
    allowPause: boolean;
    timeLimitPerQuestionMs?: number;
    totalTimeLimitMs?: number;
  };
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerText: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  wordCount: number;
  questionIndex: number;
  createdAt: string;
  updatedAt: string;
}
