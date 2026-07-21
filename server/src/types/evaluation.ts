import { DifficultyLevel } from './adaptive';
import { InterviewProgress as DecisionProgress } from './decision';

export interface SkillScore {
  name: string;
  score: number;
}

export interface SkillHistoryEntry {
  timestamp: string;
  score: number;
  questionId: string;
}

export interface SkillHistory {
  name: string;
  history: SkillHistoryEntry[];
}

export type Trend = 'Improving' | 'Declining' | 'Stable';

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

export interface AnswerEvaluation {
  technicalAccuracy: number;
  communication: number;
  completeness: number;
  correctness: number;
  depthOfKnowledge: number;
  problemSolving: number;
  confidence: number;
  structure: number;
  vocabulary: number;
  industryKnowledge: number;
  behavioralThinking: number;
  leadership: number;
  decisionMaking: number;
  criticalThinking: number;
  baseScore: number; // 0-100
}

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  answerText: string;
  score: number; // Base score
  detailedScores: AnswerEvaluation;
  strengths: Strength[];
  weaknesses: Weakness[];
  skillsUpdated: string[];
  confidence: number;
  difficulty: DifficultyLevel;
  decision: string;
  evaluationTimestamp: string;
}

export interface InterviewProgress extends DecisionProgress {
  overallScore: number;
  questionProgress: number; // e.g. 5 out of 10
  averageScore: number;
  bestAnswerScore?: number;
  worstAnswerScore?: number;
  currentDifficulty: DifficultyLevel;
  currentConfidence: number;
  currentPerformanceTrend: Trend;
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

export interface EvaluationSnapshot {
  id: string;
  sessionId: string;
  timestamp: string;
  liveEvaluation: LiveEvaluation;
  latestQuestionEvaluation: QuestionEvaluation;
}
