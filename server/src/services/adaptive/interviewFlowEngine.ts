import { ConversationMemory } from '../../types/conversationMemory';
import { InterviewProgress } from '../../types/decision';

export interface FlowEngineInput {
  memory: ConversationMemory;
  durationMs: number;
  remainingQuestions: number;
  remainingTimeMs?: number;
  blueprint?: string[]; // E.g., ['Technical', 'System Design', 'Behavioral']
}

export interface FlowEvaluation {
  currentSection: string;
  nextSection: string | null;
  shouldTransitionSection: boolean;
  topicsCovered: string[];
  topicsRemaining: string[];
  estimatedTimeRemainingMs: number;
  isNearingEnd: boolean;
}

const DEFAULT_BLUEPRINT = ['Technical', 'Behavioral', 'HR'];
const AVG_MS_PER_QUESTION = 5 * 60 * 1000; // 5 minutes

export const evaluateInterviewFlow = (input: FlowEngineInput): FlowEvaluation => {
  const { memory, durationMs, remainingQuestions, remainingTimeMs, blueprint = DEFAULT_BLUEPRINT } = input;
  
  // Track covered topics vs remaining from blueprint
  const covered = memory.topicsCovered || [];
  
  // A simplistic mapping: if they talked about React, it's Technical.
  // In a real system, we'd map specific skills to blueprint sections.
  // For now, we'll determine the current section based on how many questions have been asked.
  // E.g., first 50% Technical, next 30% Behavioral, last 20% HR.
  const totalQuestions = memory.questionHistory.length + remainingQuestions;
  const progressRatio = totalQuestions > 0 ? memory.questionHistory.length / totalQuestions : 0;
  
  let currentSection = blueprint[0];
  let nextSection = blueprint.length > 1 ? blueprint[1] : null;
  let shouldTransitionSection = false;

  if (progressRatio > 0.8 && blueprint.length >= 3) {
    currentSection = blueprint[2];
    nextSection = null;
  } else if (progressRatio > 0.5 && blueprint.length >= 2) {
    currentSection = blueprint[1];
    nextSection = blueprint.length >= 3 ? blueprint[2] : null;
    
    // If we just crossed the 50% mark, signal a transition
    if (progressRatio <= 0.6) {
      shouldTransitionSection = true;
    }
  }

  // Time calculations
  let estimatedRemainingMs = remainingTimeMs !== undefined 
    ? remainingTimeMs 
    : (45 * 60 * 1000) - durationMs; // default 45 min

  // Ensure it doesn't go below 0
  estimatedRemainingMs = Math.max(0, estimatedRemainingMs);

  // If we have less than 5 minutes left or 1 question left, we are nearing the end
  const isNearingEnd = estimatedRemainingMs < 5 * 60 * 1000 || remainingQuestions <= 1;

  // Filter remaining topics
  const topicsRemaining = memory.topicsRemaining.filter(t => !covered.includes(t));

  return {
    currentSection,
    nextSection,
    shouldTransitionSection,
    topicsCovered: covered,
    topicsRemaining,
    estimatedTimeRemainingMs: estimatedRemainingMs,
    isNearingEnd
  };
};
