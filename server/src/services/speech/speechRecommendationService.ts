import { 
  PaceMetrics, 
  FillerWordMetrics, 
  PauseMetrics 
} from '../../types/speech';

export const generateRecommendations = (
  fluencyScore: number,
  grammarScore: number,
  vocabularyScore: number,
  pronunciationScore: number,
  pace: PaceMetrics,
  fillerWords: FillerWordMetrics,
  pauseMetrics: PauseMetrics,
  isVoice: boolean
): string[] => {
  const recommendations: string[] = [];

  // 1. Pace
  if (isVoice) {
    if (pace.rating === "Too Slow") {
      recommendations.push("Try to speak slightly faster to maintain a natural conversational flow.");
    } else if (pace.rating === "Too Fast") {
      recommendations.push("Slow down your pacing to ensure better clarity and articulation.");
    } else if (pace.rating === "Ideal") {
      recommendations.push("Excellent pacing, keep it up.");
    }
  }

  // 2. Filler Words
  if (fillerWords.severity === "High") {
    recommendations.push("Noticeable use of filler words. Try pausing silently instead of using 'um' or 'like'.");
  } else if (fillerWords.severity === "Medium") {
    recommendations.push("Moderate use of filler words. Be mindful of crutch words.");
  }

  // 3. Pauses
  if (isVoice) {
    if (pauseMetrics.silencePercentage > 25) {
      recommendations.push("High percentage of silence detected. Try to structure your thoughts quickly before answering.");
    }
    if (pauseMetrics.longPausesCount > 2) {
      recommendations.push("Avoid overly long awkward pauses. Use bridging phrases to buy time.");
    }
  }

  // 4. Grammar & Vocab
  if (grammarScore < 75) {
    recommendations.push("Pay attention to sentence structure and avoid run-on sentences.");
  }
  if (vocabularyScore < 70) {
    recommendations.push("Try to incorporate more professional and technical vocabulary related to the role.");
  }

  // 5. Fluency
  if (fluencyScore < 75) {
    recommendations.push("Work on sentence continuity. Avoid false starts and repeating the same words.");
  }

  // 6. Pronunciation
  if (isVoice && pronunciationScore > 0 && pronunciationScore < 80) {
    recommendations.push("Focus on enunciating words clearly, especially technical terms.");
  }

  // Fallback if none trigger
  if (recommendations.length === 0) {
    recommendations.push("Clear and concise communication.");
  }

  // Limit to max 5
  return recommendations.slice(0, 5);
};
