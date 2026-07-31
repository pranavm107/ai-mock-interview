export type DecisionType = 
  | 'FOLLOW_UP'
  | 'NEXT_QUESTION'
  | 'CHANGE_TOPIC'
  | 'INCREASE_DIFFICULTY'
  | 'DECREASE_DIFFICULTY'
  | 'ASK_RESUME_PROJECT'
  | 'ASK_PROJECT_DEEP_DIVE'
  | 'ASK_SYSTEM_DESIGN'
  | 'ASK_CODING'
  | 'ASK_BEHAVIORAL'
  | 'ASK_HR'
  | 'REVISIT_WEAK_TOPIC'
  | 'REVISIT_STRONG_TOPIC'
  | 'FINISH_INTERVIEW';

export type DecisionConfidence = 'LOW' | 'MEDIUM' | 'HIGH' | 'ABSOLUTE';

export interface DecisionReason {
  description: string;
}

export interface DecisionEvidence {
  metric: string;
  value: string | number;
}

export interface DecisionContext {
  memory: any; // Using any for ConversationMemory as it's backend-heavy
  currentQuestion: string;
  currentSection: string;
  currentDifficulty: string;
  currentPersonality: string;
  answerScore: number;
  communicationScore?: number;
  remainingQuestions: number;
  remainingTimeMs?: number;
  durationMs: number;
  followUpCount: number;
  isFollowUpRequestedByEngine: boolean;
  interviewBlueprint?: string[];
  targetRole?: string;
}

export interface DecisionResult {
  decision: DecisionType;
  decisionConfidence: DecisionConfidence;
  reason: string;
  evidence: DecisionEvidence[];
  alternativeDecision?: DecisionType;
}

export interface DecisionProgress {
  currentSection: string;
  topicsCovered: string[];
  topicsRemaining: string[];
  estimatedTimeRemainingMs: number;
  isNearingEnd: boolean;
}
