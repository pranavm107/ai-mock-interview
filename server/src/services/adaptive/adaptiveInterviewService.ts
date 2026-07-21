import { 
  AdaptiveState, 
  AdaptiveEvaluationResult, 
  DifficultyLevel,
  InterviewerPersonalityType,
  DecisionAction
} from '../../types/adaptive';
import { 
  getAdaptiveState, 
  saveAdaptiveState 
} from './adaptiveStorageService';
import { 
  getMemory,
  initializeMemory,
  updateMemory,
  queueFollowUp 
} from './conversationMemory';
import { evaluateAnswerAndGenerateFollowUp } from './followUpEngine';
import { evaluateNextDecision } from './decisionEngine';
import { evaluateNextDifficulty } from './adaptiveDifficultyService';
import crypto from 'crypto';
import { FollowUpContext } from '../../types/followUp';

export interface AdaptiveInput {
  sessionId: string;
  questionId: string;
  questionText: string;
  answerText: string;
  remainingQuestions: number;
  durationMs: number;
  targetRole?: string;
  expectedSkills?: string[];
}

const initializeState = async (sessionId: string): Promise<AdaptiveState> => {
  const initialState: AdaptiveState = {
    id: crypto.randomUUID(),
    sessionId,
    currentDifficulty: 'Medium',
    personality: 'Friendly',
    difficultyHistory: [],
    decisionHistory: [],
    followUpHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveAdaptiveState(sessionId, initialState);
  return initialState;
};

const getMaxFollowUps = (difficulty: string): number => {
  switch (difficulty) {
    case 'Beginner': return 0;
    case 'Easy': return 1;
    case 'Medium': return 2;
    case 'Advanced': return 3;
    case 'Senior': return 4;
    case 'Expert': return 4;
    default: return 2;
  }
};

export const processAdaptiveAnswer = async (input: AdaptiveInput): Promise<AdaptiveEvaluationResult> => {
  const { sessionId, questionId, questionText, answerText, remainingQuestions, durationMs, targetRole, expectedSkills } = input;
  
  let state = await getAdaptiveState(sessionId);
  if (!state) {
    state = await initializeState(sessionId);
  }
  let memory = await getMemory(sessionId);
  if (!memory) {
    memory = await initializeMemory(sessionId, [], { targetRole });
  }

  // 1. Context for FollowUp Engine
  const followUpContext: FollowUpContext = {
    memory,
    currentDifficulty: state.currentDifficulty,
    currentPersonality: state.personality,
    currentQuestion: questionText,
    candidateAnswer: answerText,
    targetRole,
    expectedSkills
  };

  // 2. Evaluate Answer via Gemini for Follow-ups and Score
  const evalResult = await evaluateAnswerAndGenerateFollowUp(followUpContext);
  const score = evalResult.followUp.score;

  // 3. Extensively parse candidate answer and update conversation memory engine
  await updateMemory(sessionId, questionId, questionText, answerText, score);

  // Refresh memory from DB since updateMemory updated it
  memory = await getMemory(sessionId) as NonNullable<typeof memory>;

  // 4. Update follow-up queue if Gemini suggested one
  if (evalResult.followUp.shouldGenerate && evalResult.followUp.question) {
    await queueFollowUp(sessionId, evalResult.followUp.question, 'Auto-generated', evalResult.followUp.category || 'Clarification');
    state.followUpHistory.push({
      originalQuestionId: questionId,
      followUpQuestion: evalResult.followUp.question,
      followUpType: evalResult.followUp.category as any || 'Clarification',
      timestamp: new Date().toISOString()
    });
  }

  // 5. Decide next action
  const lastAction = state.decisionHistory.length > 0 ? state.decisionHistory[state.decisionHistory.length - 1].action : undefined;
  
  const decisionResult = await evaluateNextDecision({
    memory,
    currentScore: score,
    remainingQuestions,
    currentDifficulty: state.currentDifficulty,
    durationMs,
    lastAction
  });

  // If follow-up engine says we should generate, override the decision to FOLLOW_UP
  let finalDecision = decisionResult.action;
  if (evalResult.followUp.shouldGenerate && evalResult.followUp.question) {
    finalDecision = 'FOLLOW_UP';
  }

  state.decisionHistory.push({
    timestamp: new Date().toISOString(),
    action: finalDecision,
    reasoning: evalResult.followUp.reason || decisionResult.reasoning,
    context: { score }
  });

  // 6. Adjust Difficulty
  const recentScores = memory.confidenceHistory.slice(-3).map(c => c.score);
  const avgConfidence = recentScores.length ? recentScores.reduce((a,b)=>a+b, 0) / recentScores.length : 50;
  
  let consecutiveHighScores = 0;
  for (let i = recentScores.length - 1; i >= 0; i--) {
    if (recentScores[i] >= 85) consecutiveHighScores++;
    else break;
  }
  
  let consecutiveLowScores = 0;
  for (let i = recentScores.length - 1; i >= 0; i--) {
    if (recentScores[i] <= 50) consecutiveLowScores++;
    else break;
  }

  const nextDifficulty = evaluateNextDifficulty({
    currentDifficulty: state.currentDifficulty,
    answerScore: score,
    averageConfidence: avgConfidence,
    consecutiveHighScores,
    consecutiveLowScores
  });

  if (nextDifficulty !== state.currentDifficulty) {
    state.difficultyHistory.push({
      timestamp: new Date().toISOString(),
      previousLevel: state.currentDifficulty,
      newLevel: nextDifficulty,
      reason: `Score was ${score}, avg confidence ${avgConfidence}`
    });
    state.currentDifficulty = nextDifficulty;
  }

  await saveAdaptiveState(sessionId, state);

  // Calculate remaining follow ups
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const currentCount = memory.followUpHistory.filter(f => f.createdAt > twoMinsAgo).length;
  const maxLimit = getMaxFollowUps(state.currentDifficulty);

  return {
    decision: finalDecision,
    followUpQuestion: evalResult.followUp.question || undefined,
    difficulty: state.currentDifficulty,
    memoryUpdated: true,
    personality: state.personality,
    reasoning: evalResult.followUp.reason || decisionResult.reasoning,
    category: evalResult.followUp.category,
    priority: evalResult.followUp.priority,
    reason: evalResult.followUp.reason,
    remainingFollowUps: Math.max(0, maxLimit - currentCount)
  };
};
