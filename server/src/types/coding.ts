import { Timestamp } from 'firebase-admin/firestore';

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

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
  testCases?: CodingTestCase[];
  estimatedMinutes?: number;
  isActive: boolean;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
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
  assignedAt: Timestamp | any;
  startedAt?: Timestamp | any;
  completedAt?: Timestamp | any;
  timezone?: string;
}

export interface CodingDashboardData {
  dailyAssignment: (CodingDailyAssignment & { problem?: CodingProblem }) | null;
  recentTasks: (CodingDailyAssignment & { problem?: CodingProblem })[];
  progress: {
    problemsAssigned: number;
    problemsCompleted: number;
    topicsPracticed: string[];
  };
}

export type CodingIntegritySessionStatus = "ACTIVE" | "TERMINATED" | "ENDED";

export interface CodingIntegritySession {
  sessionId: string;
  userId: string;
  problemId: string;
  language: string;
  mode: string;
  status: CodingIntegritySessionStatus;
  strikeCount: number;
  maxStrikes: number;
  recentSignalIds: string[]; // Bounded deduplication mechanism
  createdAt: Timestamp;
  updatedAt: Timestamp;
  terminatedAt?: Timestamp;
  lastProcessedSignalId?: string;
  lastProcessedSignalAt?: Timestamp;
  lastHeartbeatAt?: Timestamp;
}

export type IntegrityEventType =
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'FULLSCREEN_EXIT'
  | 'NAVIGATION_ATTEMPT'
  | 'HEARTBEAT_FAILURE'
  | 'COPY_DETECTED'
  | 'PASTE_DETECTED'
  | 'CUT_DETECTED'
  | 'TAB_RETURN'
  | 'WINDOW_FOCUS'
  | 'LARGE_CODE_INSERTION';

export interface CodingIntegrityEvent {
  eventId: string;
  sessionId: string;
  userId: string;
  type: IntegrityEventType;
  occurredAt?: string;
  receivedAt: Timestamp;
  strikeCountAtEvent: number;
  sessionStatusAtEvent: CodingIntegritySessionStatus;
  metadata?: Record<string, string | number | boolean>;
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
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  reviewedAt?: Timestamp | any;
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
