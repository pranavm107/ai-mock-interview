import { ConfidenceHistory, Trend } from '../../types/evaluation';

export const calculateTrend = (scores: number[]): Trend => {
  if (scores.length < 2) return 'Stable';
  
  const recent = scores.slice(-3); // look at last 3
  if (recent.length >= 2) {
    if (recent[recent.length - 1] > recent[0] + 5) return 'Improving';
    if (recent[recent.length - 1] < recent[0] - 5) return 'Declining';
  }
  return 'Stable';
};

export const updateConfidenceTimeline = (
  timeline: ConfidenceHistory[],
  confidenceScore: number,
  questionId: string,
  questionNumber: number
): ConfidenceHistory[] => {
  const scores = timeline.map(t => t.confidence);
  scores.push(confidenceScore);
  
  const trend = calculateTrend(scores);

  const newEntry: ConfidenceHistory = {
    questionNumber,
    questionId,
    confidence: confidenceScore,
    trend,
    timestamp: new Date().toISOString()
  };

  return [...timeline, newEntry];
};
