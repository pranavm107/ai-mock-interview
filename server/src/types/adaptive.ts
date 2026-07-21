export type DifficultyLevel = 'Beginner' | 'Easy' | 'Medium' | 'Advanced' | 'Senior' | 'Expert';
import { ConversationMemory } from './conversationMemory';

export type InterviewerPersonalityType = 
  | 'Friendly' 
  | 'Strict' 
  | 'FAANG' 
  | 'HR' 
  | 'Engineering Manager' 
  | 'Startup Founder' 
  | 'System Design';

import { DecisionType } from './decision';

export type FollowUpType = 
  | 'Clarification' 
  | 'Technical Deep Dive' 
  | 'Optimization' 
  | 'Architecture' 
  | 'Tradeoffs' 
  | 'Behavioral' 
  | 'Leadership' 
  | 'Debugging' 
  | 'Real-world Example';

export interface AnswerHistoryEntry {
  questionId: string;
  question: string;
  answerText: string;
  difficulty: DifficultyLevel;
  score?: number; // Estimated answer quality (0-100)
  timestamp: string;
}

export interface FollowUpHistoryEntry {
  originalQuestionId: string;
  followUpQuestion: string;
  followUpType: FollowUpType;
  answerText?: string;
  timestamp: string;
}



export interface DifficultyHistoryEntry {
  timestamp: string;
  previousLevel: DifficultyLevel;
  newLevel: DifficultyLevel;
  reason: string;
}

export interface DecisionHistoryEntry {
  timestamp: string;
  action: DecisionType;
  reasoning: string;
  context: any;
}

export interface AdaptiveState {
  id: string;
  sessionId: string;
  currentDifficulty: DifficultyLevel;
  personality: InterviewerPersonalityType;
  difficultyHistory: DifficultyHistoryEntry[];
  decisionHistory: DecisionHistoryEntry[];
  followUpHistory: FollowUpHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AdaptiveEvaluationResult {
  decision: DecisionType;
  followUpQuestion?: string;
  difficulty: DifficultyLevel;
  memoryUpdated: boolean;
  personality: InterviewerPersonalityType;
  reasoning: string;
  category?: string | null;
  reason?: string | null;
  priority?: string | null;
  decisionConfidence?: string;
  evidence?: any[];
  nextAction?: string;
  remainingQuestions?: number;
  remainingTime?: number;
  topicsCovered?: string[];
  topicsRemaining?: string[];
  weakTopics?: any[];
  strongTopics?: any[];
  followUp?: any;
  interviewProgress?: any;
}
