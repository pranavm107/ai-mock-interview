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
  | "ENDED";

export type IntegrityEventType =
  | "TAB_SWITCH"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "NAVIGATION_ATTEMPT"
  | "HEARTBEAT_FAILURE";

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



