import { PauseMetrics, WordMetadata } from '../../types/speech';

export const analyzePauses = (words: WordMetadata[], durationMs: number): PauseMetrics => {
  if (!words || words.length < 2) {
    return {
      averagePauseMs: 0,
      longestPauseMs: 0,
      silencePercentage: 0,
      longPausesCount: 0
    };
  }

  let totalPauseMs = 0;
  let longestPauseMs = 0;
  let longPausesCount = 0;

  const pauses: number[] = [];

  for (let i = 1; i < words.length; i++) {
    const prevWord = words[i - 1];
    const currWord = words[i];
    
    // Convert seconds to ms
    const pauseDuration = (currWord.start - prevWord.end) * 1000;
    
    if (pauseDuration > 0) {
      pauses.push(pauseDuration);
      totalPauseMs += pauseDuration;
      if (pauseDuration > longestPauseMs) {
        longestPauseMs = pauseDuration;
      }
      if (pauseDuration > 1500) { // arbitrary threshold for a "long" pause (1.5s)
        longPausesCount++;
      }
    }
  }

  const averagePauseMs = pauses.length > 0 ? Math.round(totalPauseMs / pauses.length) : 0;
  const silencePercentage = durationMs > 0 ? Math.round((totalPauseMs / durationMs) * 100) : 0;

  return {
    averagePauseMs,
    longestPauseMs,
    silencePercentage,
    longPausesCount
  };
};
