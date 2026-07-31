export enum InterviewSessionState {
  CREATED = 'CREATED',
  READY = 'READY',
  STARTED = 'STARTED',
  ASKING = 'ASKING',
  ANSWERING = 'ANSWERING',
  EVALUATING = 'EVALUATING',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

export enum QuestionState {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ANSWERED = 'ANSWERED',
  SKIPPED = 'SKIPPED',
  EXPIRED = 'EXPIRED'
}

export interface SessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerText: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  durationMs: number;
  wordCount: number;
  questionIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionMetrics {
  totalDurationMs: number;
  activeDurationMs: number;
  pausedDurationMs: number;
  questionsAnswered: number;
  questionsSkipped: number;
  averageAnswerDurationMs: number;
}

export interface SessionProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  type: string; // e.g. 'Session Created', 'Interview Started', 'Paused'
  timestamp: string; // ISO String
  questionId?: string;
  metadata?: any;
}

export interface RuntimeSettings {
  allowSkip: boolean;
  allowPause: boolean;
  timeLimitPerQuestionMs?: number;
  totalTimeLimitMs?: number;
}

export interface InterviewSession {
  id: string;
  interviewId: string;
  userId: string;
  state: InterviewSessionState;
  progress: SessionProgress;
  metrics: SessionMetrics;
  settings: RuntimeSettings;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  startedAt?: string; // ISO String
  completedAt?: string; // ISO String
}
