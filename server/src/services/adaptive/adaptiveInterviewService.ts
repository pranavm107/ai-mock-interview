import { 
  AdaptiveState, 
  AdaptiveEvaluationResult, 
  DifficultyLevel,
  InterviewerPersonalityType
} from '../../types/adaptive';
import { DecisionType } from '../../types/decision';
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
import { evaluateInterviewFlow, FlowEngineInput } from './interviewFlowEngine';
import { evaluateNextDifficulty } from './adaptiveDifficultyService';
import crypto from 'crypto';
import { FollowUpContext } from '../../types/followUp';
import { DecisionContext } from '../../types/decision';

export interface AdaptiveInput {
  sessionId: string;
  questionId: string;
  questionText: string;
  answerText: string;
  remainingQuestions: number;
  durationMs: number;
  remainingTimeMs?: number;
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
  const { sessionId, questionId, questionText, answerText, remainingQuestions, durationMs, remainingTimeMs, targetRole, expectedSkills } = input;
  
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

  // 4. Evaluate Interview Flow
  const flowInput: FlowEngineInput = {
    memory,
    durationMs,
    remainingQuestions,
    remainingTimeMs
  };
  const flowEvaluation = evaluateInterviewFlow(flowInput);

  // 5. Update follow-up queue if Gemini suggested one
  let isFollowUpRequestedByEngine = false;
  if (evalResult.followUp.shouldGenerate && evalResult.followUp.question) {
    isFollowUpRequestedByEngine = true;
    await queueFollowUp(sessionId, evalResult.followUp.question, 'Auto-generated', evalResult.followUp.category || 'Clarification');
    state.followUpHistory.push({
      originalQuestionId: questionId,
      followUpQuestion: evalResult.followUp.question,
      followUpType: evalResult.followUp.category as any || 'Clarification',
      timestamp: new Date().toISOString()
    });
  }

  // 6. Decide next action
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const followUpCount = memory.followUpHistory.filter(f => f.createdAt > twoMinsAgo).length;

  const decisionContext: DecisionContext = {
    memory,
    currentQuestion: questionText,
    currentSection: flowEvaluation.currentSection,
    currentDifficulty: state.currentDifficulty,
    currentPersonality: state.personality,
    answerScore: score,
    remainingQuestions,
    remainingTimeMs: flowEvaluation.estimatedTimeRemainingMs,
    durationMs,
    followUpCount,
    isFollowUpRequestedByEngine,
    targetRole
  };

  const decisionResult = await evaluateNextDecision(decisionContext);

  state.decisionHistory.push({
    timestamp: new Date().toISOString(),
    action: decisionResult.decision,
    reasoning: decisionResult.reason,
    context: { score, evidence: decisionResult.evidence }
  });

  // 7. Adjust Difficulty
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

  let nextDifficulty = state.currentDifficulty;
  if (decisionResult.decision === 'INCREASE_DIFFICULTY') {
    nextDifficulty = evaluateNextDifficulty({ currentDifficulty: state.currentDifficulty, answerScore: score, averageConfidence: avgConfidence, consecutiveHighScores: 2, consecutiveLowScores: 0 });
  } else if (decisionResult.decision === 'DECREASE_DIFFICULTY') {
    nextDifficulty = evaluateNextDifficulty({ currentDifficulty: state.currentDifficulty, answerScore: score, averageConfidence: avgConfidence, consecutiveHighScores: 0, consecutiveLowScores: 2 });
  }

  if (nextDifficulty !== state.currentDifficulty) {
    state.difficultyHistory.push({
      timestamp: new Date().toISOString(),
      previousLevel: state.currentDifficulty,
      newLevel: nextDifficulty,
      reason: `Engine decided ${decisionResult.decision}`
    });
    state.currentDifficulty = nextDifficulty;
  }

  await saveAdaptiveState(sessionId, state);

  return {
    decision: decisionResult.decision,
    decisionConfidence: decisionResult.decisionConfidence,
    reason: decisionResult.reason,
    evidence: decisionResult.evidence,
    difficulty: state.currentDifficulty,
    nextAction: decisionResult.alternativeDecision || 'NEXT_QUESTION',
    remainingQuestions,
    remainingTime: flowEvaluation.estimatedTimeRemainingMs,
    topicsCovered: flowEvaluation.topicsCovered,
    topicsRemaining: flowEvaluation.topicsRemaining,
    weakTopics: memory.weakAreas,
    strongTopics: memory.strongAreas,
    followUp: evalResult.followUp.question ? evalResult.followUp : undefined,
    interviewProgress: flowEvaluation,
    memoryUpdated: true,
    personality: state.personality,
    reasoning: decisionResult.reason
  };
};
