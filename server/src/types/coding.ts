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
