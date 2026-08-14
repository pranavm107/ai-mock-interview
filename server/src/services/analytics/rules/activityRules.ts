import { AnalyticsRecommendation } from '../../../types/analyticsResponse';
import { RuleContext } from './recommendationTypes';

export const evaluateActivityRules = (context: RuleContext): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];
  const { overview, activityHeatmap } = context;

  // No interviews
  if (overview.totalInterviews === 0) {
    recommendations.push({
      id: 'activity-onboarding',
      priority: 'HIGH',
      title: 'Take your first interview',
      description: 'Get started by taking your first mock interview.',
      action: 'Start Interview',
      category: 'Practice'
    });
    return recommendations;
  }

  // Streak broken (0)
  if (overview.currentStreak === 0 && overview.completedInterviews > 0) {
    recommendations.push({
      id: 'activity-streak',
      priority: 'MEDIUM',
      title: 'Maintain consistency',
      description: 'You lost your streak. Consistent practice yields the best results.',
      action: 'Complete one interview today',
      category: 'Activity'
    });
  }

  // Inactive 7 days
  if (activityHeatmap.length > 0) {
    const dates = activityHeatmap.map(h => new Date(h.date).getTime()).sort((a, b) => b - a);
    const lastActive = dates[0];
    const daysSince = Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysSince >= 7) {
      recommendations.push({
        id: 'activity-inactive',
        priority: 'HIGH',
        title: 'Resume practice',
        description: `It has been ${daysSince} days since your last interview. Don't lose your edge.`,
        action: 'Practice Now',
        category: 'Activity'
      });
    }
  }

  return recommendations;
};
