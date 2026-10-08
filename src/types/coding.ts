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
