import { ConversationMemory } from './conversationMemory';
import { DifficultyLevel, InterviewerPersonalityType } from './adaptive';

export type FollowUpCategory = 
  | 'Clarification'
  | 'Technical Deep Dive'
  | 'Architecture'
  | 'Optimization'
  | 'Tradeoffs'
  | 'Debugging'
  | 'Security'
  | 'Scalability'
  | 'Behavioral'
  | 'Leadership'
  | 'Conflict Resolution'
  | 'Decision Making'
  | 'Communication'
  | 'Coding'
  | 'System Design'
  | 'Resume Validation'
  | 'Project Exploration';

export type FollowUpPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FollowUpReason {
  description: string;
}

export interface FollowUpQuestion {
  shouldGenerate: boolean;
  category: FollowUpCategory | null;
  reason: string | null;
  priority: FollowUpPriority | null;
  question: string | null;
  estimatedDifficulty: DifficultyLevel | null;
  score: number; // Candidate's answer score (0-100) added for Option A optimization
}

export interface FollowUpContext {
  memory: ConversationMemory;
  currentDifficulty: DifficultyLevel;
  currentPersonality: InterviewerPersonalityType;
  currentQuestion: string;
  candidateAnswer: string;
  targetRole?: string;
  expectedSkills?: string[];
}

export interface FollowUpEvaluation {
  followUp: FollowUpQuestion;
  generationTimeMs: number;
  isFallback: boolean;
  validationFailures: number;
}
