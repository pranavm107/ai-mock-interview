export const calculateCommunicationScore = (
  fluencyScore: number,
  grammarScore: number,
  vocabularyScore: number,
  pronunciationScore: number, // May be 0 if text-only
  isVoice: boolean
): number => {
  if (isVoice && pronunciationScore > 0) {
    // Weighted average for Voice
    // Fluency: 30%, Grammar: 20%, Vocab: 20%, Pronunciation: 30%
    const score = (fluencyScore * 0.3) + (grammarScore * 0.2) + (vocabularyScore * 0.2) + (pronunciationScore * 0.3);
    return Math.round(score);
  } else {
    // Weighted average for Text (skip pronunciation)
    // Fluency (readability/flow): 40%, Grammar: 30%, Vocab: 30%
    const score = (fluencyScore * 0.4) + (grammarScore * 0.3) + (vocabularyScore * 0.3);
    return Math.round(score);
  }
};
