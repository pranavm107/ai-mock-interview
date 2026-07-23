import { WordMetadata } from '../../types/speech';

export const analyzePronunciation = (words: WordMetadata[]): number => {
  if (!words || words.length === 0) return 0;

  // Confidence from Deepgram is 0.0 to 1.0
  let totalConfidence = 0;
  let validWords = 0;

  words.forEach(w => {
    if (w.confidence !== undefined) {
      totalConfidence += w.confidence;
      validWords++;
    }
  });

  if (validWords === 0) return 0;

  const averageConfidence = totalConfidence / validWords;
  
  // Scale to 0-100
  // e.g. 0.95 avg confidence -> 95 score
  return Math.max(0, Math.min(100, Math.round(averageConfidence * 100)));
};
