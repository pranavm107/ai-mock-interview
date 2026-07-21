import { DecisionAction, DifficultyLevel } from '../../types/adaptive';
import { ConversationMemory } from '../../types/conversationMemory';

export interface DecisionEngineInput {
  memory: ConversationMemory;
  currentScore: number;
  remainingQuestions: number;
  currentDifficulty: DifficultyLevel;
  durationMs: number;
  lastAction?: DecisionAction;
}

export interface DecisionResult {
  action: DecisionAction;
  reasoning: string;
}

export const evaluateNextDecision = (input: DecisionEngineInput): DecisionResult => {
  const { memory, currentScore, remainingQuestions, durationMs, lastAction } = input;

  if (remainingQuestions <= 0) {
    return { action: 'FINISH', reasoning: 'No remaining questions.' };
  }

  // If the last action was a follow up, let's not get stuck in a follow-up loop
  if (lastAction === 'FOLLOW_UP') {
    if (currentScore < 50) {
      return { action: 'CHANGE_TOPIC', reasoning: 'Candidate struggled with follow-up. Moving to new topic to preserve confidence.' };
    }
    return { action: 'NEXT_QUESTION', reasoning: 'Follow-up answered adequately. Moving to next main question.' };
  }

  // Consider asking a follow-up if the answer was okay but could be deeper
  if (currentScore >= 60 && currentScore <= 85) {
    // Arbitrary probability or condition for a follow-up
    // E.g. we only ask follow up if we haven't asked too many
    const recentFollowUps = memory.answerHistory.filter(a => a.timestamp > new Date(Date.now() - 5 * 60 * 1000).toISOString()).length;
    if (recentFollowUps < 2) {
      return { action: 'FOLLOW_UP', reasoning: 'Answer was acceptable but has room for deeper technical exploration.' };
    }
  }

  // If they bombed the question
  if (currentScore < 40) {
    // If they bombed an easy question, we might want to repeat/rephrase or change topic
    if (input.currentDifficulty === 'Beginner' || input.currentDifficulty === 'Easy') {
      return { action: 'CHANGE_TOPIC', reasoning: 'Candidate struggled on easy difficulty. Changing topic to find a strength.' };
    }
    return { action: 'DECREASE_DIFFICULTY', reasoning: 'Candidate struggled. Decreasing difficulty for the next question.' };
  }

  // If they nailed it perfectly
  if (currentScore >= 90) {
    return { action: 'INCREASE_DIFFICULTY', reasoning: 'Candidate gave an excellent answer. Increasing difficulty.' };
  }

  // Default action
  return { action: 'NEXT_QUESTION', reasoning: 'Proceeding normally to the next question based on interview plan.' };
};
