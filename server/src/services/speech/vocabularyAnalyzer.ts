export const analyzeVocabulary = (transcript: string): number => {
  if (!transcript || transcript.trim().length === 0) return 0;
  
  let score = 75; // Base score for answering
  const words = transcript.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) return 0;

  // 1. Vocabulary Diversity (Unique Words / Total Words)
  const uniqueWords = new Set(words);
  const diversityRatio = uniqueWords.size / words.length;
  
  // A good diversity ratio for spoken English is typically around 0.4 - 0.6 depending on length
  // The shorter the text, the higher the ratio should be naturally.
  if (diversityRatio > 0.45) score += 15;
  else if (diversityRatio > 0.35) score += 10;
  else if (diversityRatio > 0.25) score += 5;
  else score -= 10; // Highly repetitive

  // 2. Technical / Professional Language (Naive check)
  const professionalWords = [
    'implement', 'architect', 'design', 'optimize', 'scale', 'manage', 'facilitate', 
    'leverage', 'integrate', 'strategy', 'analysis', 'development', 'framework', 
    'leadership', 'collaborate', 'efficient', 'robust', 'deploy'
  ];

  let profCount = 0;
  uniqueWords.forEach(word => {
    if (professionalWords.includes(word)) profCount++;
  });

  score += Math.min(10, profCount * 2); // Max 10 bonus points for professional vocab

  return Math.max(0, Math.min(100, Math.round(score)));
};
