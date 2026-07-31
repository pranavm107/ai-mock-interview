import { CommunicationAnalytics, WordMetadata, PaceMetrics } from '../../types/speech';
import { analyzeFluency } from './fluencyAnalyzer';
import { analyzeGrammar } from './grammarAnalyzer';
import { analyzeVocabulary } from './vocabularyAnalyzer';
import { analyzePace } from './paceAnalyzer';
import { analyzePauses } from './pauseAnalyzer';
import { analyzeFillerWords } from './fillerWordAnalyzer';
import { analyzePronunciation } from './pronunciationAnalyzer';
import { calculateCommunicationScore } from './communicationScoringService';
import { generateRecommendations } from './speechRecommendationService';

export const generateCommunicationAnalytics = async (
  transcript: string,
  wordMetadata: WordMetadata[],
  durationMs: number,
  isVoice: boolean
): Promise<CommunicationAnalytics> => {
  
  // Execute pure text analytics concurrently
  const [
    fluencyScore,
    grammarScore,
    vocabularyScore,
    fillerWords
  ] = await Promise.all([
    Promise.resolve(analyzeFluency(transcript)),
    Promise.resolve(analyzeGrammar(transcript)),
    Promise.resolve(analyzeVocabulary(transcript)),
    Promise.resolve(analyzeFillerWords(transcript))
  ]);

  // Voice metrics
  let pace: PaceMetrics = { wpm: 0, cpm: 0, rating: "Unknown" };
  let pauseMetrics = { averagePauseMs: 0, longestPauseMs: 0, silencePercentage: 0, longPausesCount: 0 };
  let pronunciationScore = 0;
  let confidenceScore = 80;

  if (isVoice) {
    [pace, pauseMetrics, pronunciationScore] = await Promise.all([
      Promise.resolve(analyzePace(transcript, durationMs)),
      Promise.resolve(analyzePauses(wordMetadata, durationMs)),
      Promise.resolve(analyzePronunciation(wordMetadata))
    ]);

    // Approximate confidence based on fluency and pauses
    confidenceScore = Math.max(0, Math.min(100, Math.round(
      (fluencyScore * 0.5) + (100 - pauseMetrics.silencePercentage) * 0.5
    )));
  } else {
    // Basic text pace approximation
    pace = analyzePace(transcript, durationMs);
    confidenceScore = Math.max(0, Math.min(100, Math.round(
      (fluencyScore * 0.7) + (vocabularyScore * 0.3)
    )));
  }

  const communicationScore = calculateCommunicationScore(
    fluencyScore,
    grammarScore,
    vocabularyScore,
    pronunciationScore,
    isVoice
  );

  const recommendations = generateRecommendations(
    fluencyScore,
    grammarScore,
    vocabularyScore,
    pronunciationScore,
    pace,
    fillerWords,
    pauseMetrics,
    isVoice
  );

  return {
    communicationScore,
    fluencyScore,
    grammarScore,
    vocabularyScore,
    pronunciationScore,
    confidenceScore,
    pace,
    pauseMetrics,
    fillerWords,
    recommendations
  };
};
