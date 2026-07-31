export const analyzeFluency = (transcript: string): number => {
  if (!transcript || transcript.trim().length === 0) return 0;

  let fluencyScore = 100;
  const lowerTranscript = transcript.toLowerCase();

  // Penalty for restarts/stutters (e.g. "I went to the, I went to the store")
  const words = lowerTranscript.split(/\s+/).filter(w => w.length > 0);
  
  let stutterCount = 0;
  for (let i = 1; i < words.length; i++) {
    // Basic heuristic: exact word repeated sequentially
    if (words[i] === words[i - 1] && words[i].length > 1) {
      stutterCount++;
    }
  }
  
  fluencyScore -= (stutterCount * 3); // -3 for every repeated word
  
  // Penalty for false starts detected via hyphenation or abrupt phrasing
  // This is a naive implementation; production could use NLP
  const abruptStarts = (transcript.match(/--/g) || []).length;
  fluencyScore -= (abruptStarts * 5);

  return Math.max(0, Math.min(100, Math.round(fluencyScore)));
};
