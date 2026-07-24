import { CareerContext } from './careerAggregationService';

export interface ScoreFactors {
  interviewPerformance: number;
  communication: number;
  confidence: number;
  consistency: number;
  practiceFrequency: number;
  atsReadiness: number;
  skillGrowth: number;
}

export const calculateCareerScore = (factors: ScoreFactors): number => {
  const wInterview = 0.25;
  const wCommunication = 0.15;
  const wConfidence = 0.10;
  const wConsistency = 0.15;
  const wPractice = 0.10;
  const wATS = 0.10;
  const wSkill = 0.15;

  const score = 
    (factors.interviewPerformance * wInterview) +
    (factors.communication * wCommunication) +
    (factors.confidence * wConfidence) +
    (factors.consistency * wConsistency) +
    (factors.practiceFrequency * wPractice) +
    (factors.atsReadiness * wATS) +
    (factors.skillGrowth * wSkill);
    
  return Math.min(Math.max(Math.round(score), 0), 100);
};

export const calculateScoreFromContext = (context: CareerContext): ScoreFactors => {
  // In a real app with more analytics, these would be derived from speech metrics,
  // review intelligence, and skill matrices. Here we approximate based on the available data.
  const interviewPerformance = context.averageScore || 0;
  const practiceFrequency = Math.min(context.totalInterviews * 5, 100); // 20 interviews = 100%
  const consistency = context.totalInterviews > 2 ? 80 : 40;
  const communication = Math.min(interviewPerformance + 5, 100); 
  const confidence = Math.min(interviewPerformance, 100);
  const skillGrowth = Math.min(context.totalInterviews * 10, 100);
  const atsReadiness = 50; // Placeholder until Resume Intelligence phase

  return {
    interviewPerformance,
    communication,
    confidence,
    consistency,
    practiceFrequency,
    atsReadiness,
    skillGrowth
  };
};

export const evaluateCareerReadiness = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
};
