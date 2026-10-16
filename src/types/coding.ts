export interface CodingProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topics: string[];
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  estimatedMinutes?: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface CodingDailyAssignment {
  id: string;
  userId: string;
  dateKey: string;
  problemId: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  reason: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  assignedAt: any;
  startedAt?: any;
  completedAt?: any;
  timezone?: string;
  problem?: CodingProblem;
}

export interface CodingDashboardData {
  dailyAssignment: CodingDailyAssignment | null;
  recentTasks: CodingDailyAssignment[];
  progress: {
    problemsAssigned: number;
    problemsCompleted: number;
    topicsPracticed: string[];
  };
}

export type CodingSessionMode = "PRACTICE" | "INTEGRITY";

export type CodingIntegrityState =
  | "INACTIVE"
  | "CONSENT_REQUIRED"
  | "STARTING"
  | "ACTIVE"
  | "ENDING"
  | "ENDED"
  | "CONFLICT";

export type IntegrityEventType =
  | "TAB_SWITCH"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "NAVIGATION_ATTEMPT"
  | "HEARTBEAT_FAILURE"
  | "COPY_DETECTED"
  | "PASTE_DETECTED"
  | "CUT_DETECTED"
  | "TAB_RETURN"
  | "WINDOW_FOCUS"
  | "LARGE_CODE_INSERTION";

export interface IntegritySignal {
  id: string;
  type: IntegrityEventType;
  timestamp: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export type CodingStrikeLevel = 0 | 1 | 2 | 3;

export type CodingEnforcementState =
  | "ACTIVE"
  | "WARNING"
  | "FINAL_WARNING"
  | "TERMINATED";

export interface CodingStrikeState {
  level: CodingStrikeLevel;
  enforcementState: CodingEnforcementState;
  lastStrikeAt: string | null;
  lastSignalType: IntegrityEventType | null;
}

export interface StrikeResult {
  applied: boolean;
  level: CodingStrikeLevel;
  enforcementState: CodingEnforcementState;
  signal: IntegritySignal;
}

export type IntegritySessionStatus = "ACTIVE" | "TERMINATED" | "ENDED";

export interface ServerIntegritySession {
  sessionId: string;
  status: IntegritySessionStatus;
  strikeCount: number;
  maxStrikes: number;
  lastHeartbeatAt?: string;
  isStale?: boolean;
}

export interface IntegritySignalRequest {
  signalId: string;
  type: IntegrityEventType;
}

export interface IntegritySignalResponse {
  signalAccepted: boolean;
  duplicate: boolean;
  session: ServerIntegritySession;
}

export type CodingMalpracticeIncidentType = 'STRIKE_LIMIT_EXCEEDED';
export type CodingMalpracticeSeverity = 'HIGH';
export type CodingMalpracticeStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED' | 'CONFIRMED';

export interface CodingMalpracticeRecord {
  recordId: string;
  sessionId: string;
  userId: string;
  incidentType: CodingMalpracticeIncidentType;
  severity: CodingMalpracticeSeverity;
  status: CodingMalpracticeStatus;
  summary: string;
  evidenceEventIds: string[];
  createdAt: any;
  updatedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  resolutionNote?: string;
}

export interface AIAnalysisResult {
  explanation: string;
  correctnessIssues: string[];
  complexity: {
    time: string;
    space: string;
    reasoning: string;
  };
  readability: string;
  suggestions: string[];
}

export interface CodingAnalyticsData {
  totalAttempts: number;
  totalSolved: number;
  uniqueProblemsAttempted: number;
  acceptanceRate: number;
  difficultyBreakdown: { [difficulty: string]: number };
  topicBreakdown: { [topic: string]: number };
  languageBreakdown: { [language: string]: number };
  recentActivity: { date: string; attempts: number; solved: number }[];
  solvedProblemIds?: string[];
  attemptedProblemIds?: string[];
}

export interface CodingReadinessData {
  score: number;
  level: 'Getting Started' | 'Building Foundations' | 'Interview Ready';
  factors: {
    successScore: number;
    difficultyScore: number;
    topicScore: number;
    consistencyScore: number;
  };
  strengths: string[];
  improvementAreas: string[];
  recommendation: string;
  isNewUser: boolean;
}
