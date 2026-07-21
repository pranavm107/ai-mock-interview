import { ConversationMemory } from '../../types/conversationMemory';
import { DifficultyLevel } from '../../types/adaptive';
import { LiveEvaluation, QuestionEvaluation, EvaluationSnapshot, SkillScore, SkillHistory, ConfidenceHistory, Strength, Weakness } from '../../types/evaluation';
import { evaluateAnswer } from './answerScoringService';
import { updateSkillMatrix } from './skillMatrixService';
import { updateConfidenceTimeline } from './confidenceTracker';
import { updateStrengthsAndWeaknesses } from './strengthWeaknessAnalyzer';
import { aggregateLiveEvaluation } from './evaluationAggregator';
import { saveEvaluationSnapshot } from './evaluationStorageService';
import { InterviewProgress as DecisionProgress } from '../../types/decision';
import crypto from 'crypto';

export interface LiveEvaluationInput {
  sessionId: string;
  questionId: string;
  questionText: string;
  answerText: string;
  baseScore: number;
  extractedSkills: string[];
  extractedWeaknesses: string[];
  memory: ConversationMemory;
  difficulty: DifficultyLevel;
  decision: string;
  interviewProgress: DecisionProgress;
  // State from previous evaluations (if this were persisted properly outside memory, but we'll infer it or pass it)
  // For this implementation, we can maintain it in the session or reconstruct it.
  currentSkillMatrix?: SkillScore[];
  currentSkillHistory?: SkillHistory[];
  currentConfidenceTimeline?: ConfidenceHistory[];
  currentStrengths?: Strength[];
  currentWeaknesses?: Weakness[];
}

export const executeLiveEvaluation = async (input: LiveEvaluationInput): Promise<LiveEvaluation> => {
  const startTime = Date.now();
  
  const { 
    sessionId, questionId, questionText, answerText, baseScore, extractedSkills, 
    extractedWeaknesses, memory, difficulty, decision, interviewProgress,
    currentSkillMatrix = [], currentSkillHistory = [], currentConfidenceTimeline = [],
    currentStrengths = [], currentWeaknesses = []
  } = input;

  const questionNumber = memory.questionHistory.length + 1;

  // 1. Score the answer
  const answerEvaluation = evaluateAnswer({
    baseScore,
    answerText,
    difficulty,
    memory,
    expectedSkills: extractedSkills
  });

  // 2. Update Skill Matrix
  const { matrix: skillMatrix } = updateSkillMatrix(
    currentSkillMatrix, 
    currentSkillHistory, 
    extractedSkills, 
    answerEvaluation.technicalAccuracy, 
    questionId
  );

  // 3. Update Confidence Timeline
  const confidenceTimeline = updateConfidenceTimeline(
    currentConfidenceTimeline,
    answerEvaluation.confidence,
    questionId,
    questionNumber
  );

  // 4. Update Strengths and Weaknesses
  const { strengths, weaknesses } = updateStrengthsAndWeaknesses(
    currentStrengths,
    currentWeaknesses,
    memory,
    questionNumber,
    baseScore,
    extractedSkills,
    extractedWeaknesses
  );

  // 5. Expand Interview Progress
  const expandedProgress = {
    ...interviewProgress,
    overallScore: 0, // placeholder, filled in aggregator
    questionProgress: questionNumber,
    averageScore: 0, // placeholder
    currentDifficulty: difficulty,
    currentConfidence: answerEvaluation.confidence,
    currentPerformanceTrend: confidenceTimeline[confidenceTimeline.length - 1].trend
  };

  // 6. Aggregate Final Evaluation
  const liveEvaluation = aggregateLiveEvaluation({
    memory,
    currentAnswerEvaluation: answerEvaluation,
    skillMatrix,
    strengths,
    weaknesses,
    confidenceTimeline,
    interviewProgress: expandedProgress
  });

  // Update placeholders
  liveEvaluation.interviewProgress.overallScore = liveEvaluation.overallScore;
  liveEvaluation.interviewProgress.averageScore = liveEvaluation.overallScore;

  // 7. Create Snapshot
  const latestQuestionEvaluation: QuestionEvaluation = {
    questionId,
    questionText,
    answerText,
    score: baseScore,
    detailedScores: answerEvaluation,
    strengths: strengths.filter(s => s.questionNumber === questionNumber),
    weaknesses: weaknesses.filter(w => w.questionNumber === questionNumber),
    skillsUpdated: extractedSkills,
    confidence: answerEvaluation.confidence,
    difficulty,
    decision,
    evaluationTimestamp: new Date().toISOString()
  };

  const snapshot: EvaluationSnapshot = {
    id: crypto.randomUUID(),
    sessionId,
    timestamp: new Date().toISOString(),
    liveEvaluation,
    latestQuestionEvaluation
  };

  // 8. Fire-and-forget Storage
  saveEvaluationSnapshot(sessionId, snapshot).catch(console.error);

  const duration = Date.now() - startTime;
  console.log(`[LiveEvaluationEngine] Evaluated answer in ${duration}ms for session ${sessionId}`);

  return liveEvaluation;
};
