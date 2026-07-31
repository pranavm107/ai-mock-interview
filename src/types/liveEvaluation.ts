export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
export type Trend = 'Improving' | 'Declining' | 'Stable';

export interface SkillScore {
  name: string;
  score: number;
}

export interface ConfidenceHistory {
  questionNumber: number;
  questionId: string;
  confidence: number;
  trend: Trend;
  timestamp: string;
}

export interface Strength {
  topic: string;
  evidence: string;
  questionNumber: number;
  confidence: number;
}

export interface Weakness {
  topic: string;
  evidence: string;
  questionNumber: number;
  recommendation: string;
}

export interface InterviewProgress {
  overallScore: number;
  questionProgress: number; // e.g. 5 out of 10
  averageScore: number;
  bestAnswerScore?: number;
  worstAnswerScore?: number;
  currentDifficulty: DifficultyLevel;
  currentConfidence: number;
  currentPerformanceTrend: Trend;
  
  // From DecisionProgress
  currentQuestionIndex: number;
  totalQuestions: number;
  phase: string;
  isComplete: boolean;
  score: number;
  difficulty: DifficultyLevel;
}

export interface LiveEvaluation {
  overallScore: number;
  technicalScore: number;
  behavioralScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  leadershipScore: number;
  performanceTrend: Trend;
  skillMatrix: SkillScore[];
  strengths: Strength[];
  weaknesses: Weakness[];
  confidenceTimeline: ConfidenceHistory[];
  interviewProgress: InterviewProgress;
}
