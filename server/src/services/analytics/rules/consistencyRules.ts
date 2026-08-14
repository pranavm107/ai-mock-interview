import { AnalyticsRecommendation } from '../../../types/analyticsResponse';
import { RuleContext } from './recommendationTypes';

export const evaluateConsistencyRules = (context: RuleContext): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];
  const { performanceTrend } = context;

  if (performanceTrend.length < 3) return recommendations;

  // Calculate Variance/Standard Deviation of overallScore
  const scores = performanceTrend.map(p => p.overallScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // If very inconsistent (stdDev > 15 points)
  if (stdDev > 15) {
    recommendations.push({
      id: 'consistency-erratic',
      priority: 'MEDIUM',
      title: 'Focus on consistent practice',
      description: `Your scores fluctuate wildly (StdDev: ${stdDev.toFixed(1)}). Try to establish a reliable baseline.`,
      action: 'Practice consistent frameworks',
      category: 'Consistency'
    });
  }

  return recommendations;
};
