export interface WordMetadata {
  word: string;
  start: number; // in seconds
  end: number; // in seconds
  confidence: number;
}

export type PaceRating = "Too Slow" | "Ideal" | "Too Fast" | "Unknown";

export interface PaceMetrics {
  wpm: number;
  cpm: number;
  rating: PaceRating;
}

export interface PauseMetrics {
  averagePauseMs: number;
  longestPauseMs: number;
  silencePercentage: number;
  longPausesCount: number;
}

export interface FillerWordMetrics {
  count: number;
  words: string[];
  severity: "Low" | "Medium" | "High";
}

export interface SpeechRecommendation {
  suggestion: string;
  category: "Fluency" | "Pace" | "Vocabulary" | "Grammar" | "Pronunciation" | "General";
}

export interface CommunicationAnalytics {
  communicationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  confidenceScore: number;
  
  pace: PaceMetrics;
  pauseMetrics: PauseMetrics;
  fillerWords: FillerWordMetrics;
  
  recommendations: string[];
}

export interface SpeechSummary {
  overallCommunicationScore: number;
  averageFluency: number;
  averageGrammar: number;
  averageVocabulary: number;
  averagePronunciation: number;
  averagePace: number;
  totalFillerWords: number;
  topRecommendations: string[];
}

export interface SpeechAnalyticsRecord {
  id: string;
  sessionId: string;
  answerId: string;
  questionId?: string; // Optional if not easily available
  questionIndex: number;
  timestamp: string;
  durationMs: number;
  analytics: CommunicationAnalytics;
  liveEvaluation?: any; 
}

export interface SessionSpeechSummary {
  id: string; // sessionId
  averageCommunicationScore: number;
  averageFluency: number;
  averageGrammar: number;
  averageVocabulary: number;
  averagePronunciation: number;
  averageConfidence: number;
  averagePace: number;
  averagePauseDuration: number;
  averageFillers: number;
  trend: "Improving" | "Stable" | "Declining";
  recommendations: string[];
  updatedAt: string;
}
