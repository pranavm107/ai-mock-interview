import { FillerWordMetrics } from '../../types/speech';

const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'i mean', 'right', 'so'];

export const analyzeFillerWords = (transcript: string): FillerWordMetrics => {
  const lowerTranscript = transcript.toLowerCase();
  
  let count = 0;
  const wordsFound: string[] = [];
  
  for (const filler of FILLER_WORDS) {
    // Regex to match whole words/phrases
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    if (matches) {
      count += matches.length;
      wordsFound.push(filler);
    }
  }

  // Calculate severity based on words per 100 words roughly
  const totalWords = transcript.split(/\s+/).length;
  const ratio = totalWords > 0 ? count / totalWords : 0;
  
  let severity: "Low" | "Medium" | "High" = "Low";
  if (ratio > 0.05) severity = "High"; // > 5% are fillers
  else if (ratio > 0.02) severity = "Medium";

  return {
    count,
    words: wordsFound,
    severity
  };
};
