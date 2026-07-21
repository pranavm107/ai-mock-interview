import { 
  AnswerEvaluation, 
  SkillScore, 
  Strength, 
  Weakness, 
  ConfidenceHistory,
  LiveEvaluation,
  Trend,
  InterviewProgress
} from '../../types/evaluation';
import { ConversationMemory } from '../../types/conversationMemory';
import { calculateTrend } from './confidenceTracker';

export interface AggregatorInput {
  memory: ConversationMemory;
  currentAnswerEvaluation: AnswerEvaluation;
  skillMatrix: SkillScore[];
  strengths: Strength[];
  weaknesses: Weakness[];
  confidenceTimeline: ConfidenceHistory[];
  interviewProgress: InterviewProgress;
}

export const aggregateLiveEvaluation = (input: AggregatorInput): LiveEvaluation => {
  const { 
    memory, 
    currentAnswerEvaluation, 
    skillMatrix, 
    strengths, 
    weaknesses, 
    confidenceTimeline,
    interviewProgress
  } = input;

  // Calculate moving averages for macro scores
  // If we had history of evaluations, we'd average them. 
  // Since we only have the current answer and the conversation memory's confidence history,
  // we'll use the confidence history to find the rolling base average, and apply modifiers.

  const recentScores = memory.confidenceHistory.map(c => c.score);
  // Add the current base score to the rolling average
  recentScores.push(currentAnswerEvaluation.baseScore);
  
  const overallScore = recentScores.length > 0 
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
    : currentAnswerEvaluation.baseScore;

  // Find specific skill scores or fallback to overall average
  const getSkillScore = (skillName: string) => {
    const s = skillMatrix.find(s => s.name === skillName);
    return s ? s.score : overallScore;
  };

  const performanceTrend = calculateTrend(recentScores);

  return {
    overallScore,
    technicalScore: getSkillScore('Technical') !== overallScore ? getSkillScore('Technical') : overallScore,
    behavioralScore: getSkillScore('Behavioral') !== overallScore ? getSkillScore('Behavioral') : overallScore,
    communicationScore: getSkillScore('Communication'),
    confidenceScore: currentAnswerEvaluation.confidence,
    problemSolvingScore: getSkillScore('Problem Solving'),
    leadershipScore: getSkillScore('Leadership') !== overallScore ? getSkillScore('Leadership') : overallScore,
    performanceTrend,
    skillMatrix,
    strengths,
    weaknesses,
    confidenceTimeline,
    interviewProgress
  };
};
