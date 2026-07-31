import { PaceMetrics, PaceRating, WordMetadata } from '../../types/speech';

export const analyzePace = (transcript: string, durationMs: number): PaceMetrics => {
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const durationMinutes = durationMs > 0 ? durationMs / 60000 : 1;
  
  const wpm = wordCount > 0 ? Math.round(wordCount / durationMinutes) : 0;
  const cpm = transcript.length > 0 ? Math.round(transcript.length / durationMinutes) : 0;
  
  let rating: PaceRating = "Unknown";
  if (wpm > 0) {
    if (wpm < 110) rating = "Too Slow";
    else if (wpm > 160) rating = "Too Fast";
    else rating = "Ideal";
  }

  return {
    wpm,
    cpm,
    rating
  };
};
