import type { SessionEvent } from './interviewSession';
import type { SpeechSummary } from './speech';

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  userAnswer: string;
  durationMs: number;
  correctness: number;
  completeness: number;
  technicalDepth: number;
  clarity: number;
  confidence: number;
  feedback: string;
  goodPoints: string[];
  areasForImprovement: string[];
}

export interface TechnicalEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface CommunicationEvaluation {
  score: number;
  clarity: string;
  conciseness: string;
}

export interface BehaviorEvaluation {
  score: number;
  leadership: string;
  collaboration: string;
}

export interface SkillAnalysis {
  skillName: string;
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  evidence: string;
}

export interface Recommendation {
  category: "Technical" | "Communication" | "Behavioral" | "General";
  priority: "High" | "Medium" | "Low";
  suggestion: string;
  resourceLinks?: string[];
}

export interface ImprovementPlan {
  shortTerm: string[];
  longTerm: string[];
  recommendedPracticeTopics: string[];
}

export interface OverallEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  behavioralScore: number;
  problemSolvingScore: number;
  timeManagementScore: number;
  summary: string;
}

export interface HiringRecommendation {
  verdict: 'Recommended' | 'Hold' | 'Not Ready';
  rating: number; // 1 to 5 stars
  reasons: string[];
}

export interface ATSReadiness {
  resumeScore: number;
  interviewScore: number;
  overallEmployability: number;
}

export interface InterviewReport {
  id: string; // Document ID (reportId)
  sessionId: string;
  interviewId: string;
  userId: string;
  generatedAt: string;
  
  overallEvaluation: OverallEvaluation;
  technicalEvaluation: TechnicalEvaluation;
  communicationEvaluation: CommunicationEvaluation;
  behavioralEvaluation: BehaviorEvaluation;
  speechSummary?: SpeechSummary;
  
  hiringRecommendation?: HiringRecommendation;
  atsReadiness?: ATSReadiness;
  timeline?: SessionEvent[];
  
  strengths: string[];
  weaknesses: string[];
  skillsAnalysis: SkillAnalysis[];
  recommendations: Recommendation[];
  improvementPlan: ImprovementPlan;
  
  questionEvaluations: QuestionEvaluation[];
  
  version: string;
}
