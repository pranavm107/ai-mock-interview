import { AnalyticsRecommendation } from '../../../types/analyticsResponse';
import { RuleContext } from './recommendationTypes';

export const evaluatePerformanceRules = (context: RuleContext): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];
  const { overview, performanceTrend } = context;

  if (overview.totalInterviews === 0) return recommendations;

  // Rule: Overall Score < 70
  if (overview.averageScore > 0 && overview.averageScore < 70) {
    recommendations.push({
      id: 'perf-improve-score',
      priority: 'HIGH',
      title: 'Improve Interview Performance',
      description: `Your average score is ${overview.averageScore}, which is below the recommended threshold.`,
      action: 'Complete 3 mock interviews this week',
      category: 'Performance'
    });
  }

  // Rule: Negative Trend
  if (performanceTrend.length >= 2) {
    const latest = performanceTrend[performanceTrend.length - 1].overallScore;
    const previous = performanceTrend[performanceTrend.length - 2].overallScore;
    if (latest < previous) {
      recommendations.push({
        id: 'perf-negative-trend',
        priority: 'MEDIUM',
        title: 'Performance is declining',
        description: `Your latest score (${latest}) is lower than your previous score (${previous}).`,
        action: 'Review your previous interview',
        category: 'Performance'
      });
    }
  }

  // Rule: Low Completion Rate
  if (overview.completionRate > 0 && overview.completionRate < 80) {
    recommendations.push({
      id: 'perf-completion-rate',
      priority: 'HIGH',
      title: 'Finish every interview session',
      description: `Your completion rate is ${overview.completionRate}%. Finishing sessions gives you the best AI feedback.`,
      action: 'Complete your drafted or in-progress interviews',
      category: 'Practice'
    });
  }

  return recommendations;
};
