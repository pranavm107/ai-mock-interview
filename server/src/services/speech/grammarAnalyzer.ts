export const analyzeGrammar = (transcript: string): number => {
  if (!transcript || transcript.trim().length === 0) return 0;
  
  let score = 100;
  
  // Very naive grammar heuristics for the sake of the mock implementation
  
  // 1. Missing punctuation or capitalization at boundaries
  // Note: Deepgram smart_format handles most punctuation, so if it's missing, it implies run-on sentences.
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = transcript.split(/\s+/).length / (sentences.length || 1);
  
  if (avgSentenceLength > 30) {
    score -= 10; // Penalty for run-on sentences
  }

  // 2. Common grammatical errors (very simplistic)
  const errors = [
    /\\b(could of|should of|would of)\\b/gi,
    /\\b(is am|are am|was am)\\b/gi,
    /\\b(i seen|i done)\\b/gi
  ];

  errors.forEach(regex => {
    const matches = transcript.match(regex);
    if (matches) {
      score -= (matches.length * 5);
    }
  });

  return Math.max(0, Math.min(100, Math.round(score)));
};
