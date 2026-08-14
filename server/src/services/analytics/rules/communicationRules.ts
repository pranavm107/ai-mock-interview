import { AnalyticsRecommendation } from '../../../types/analyticsResponse';
import { RuleContext } from './recommendationTypes';

export const evaluateCommunicationRules = (context: RuleContext): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];
  const { categoryTrend, speechAnalytics } = context;

  if (categoryTrend.length === 0) return recommendations;

  const latestCategory = categoryTrend[categoryTrend.length - 1];

  // Rule: Communication < 65
  if (latestCategory.communication > 0 && latestCategory.communication < 65) {
    recommendations.push({
      id: 'comm-score-low',
      priority: 'MEDIUM',
      title: 'Improve Communication',
      description: 'Your communication score is low. Practice structured answers.',
      action: 'Use STAR method',
      category: 'Communication'
    });
  }

  // Rule: Confidence < 70
  if (speechAnalytics.averageConfidence !== undefined && speechAnalytics.averageConfidence > 0 && speechAnalytics.averageConfidence < 70) {
    recommendations.push({
      id: 'comm-confidence-low',
      priority: 'MEDIUM',
      title: 'Reduce hesitation',
      description: 'Your AI-measured confidence is below 70.',
      action: 'Practice speaking aloud',
      category: 'Communication'
    });
  }

  // Rule: Behavioral low (< 65)
  if (latestCategory.behavioral > 0 && latestCategory.behavioral < 65) {
    recommendations.push({
      id: 'comm-behavioral-low',
      priority: 'LOW',
      title: 'Improve storytelling',
      description: 'Behavioral interview performance needs improvement.',
      action: 'Practice behavioral scenarios',
      category: 'Behavioral'
    });
  }

  return recommendations;
};
