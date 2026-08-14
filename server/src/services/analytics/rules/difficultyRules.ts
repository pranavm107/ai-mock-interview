import { AnalyticsRecommendation } from '../../../types/analyticsResponse';
import { RuleContext } from './recommendationTypes';

export const evaluateDifficultyRules = (context: RuleContext): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];
  const { difficultyAnalytics } = context;

  if (difficultyAnalytics.length === 0) return recommendations;

  const hardDiff = difficultyAnalytics.find(d => d.difficulty.toLowerCase() === 'hard');
  const mediumDiff = difficultyAnalytics.find(d => d.difficulty.toLowerCase() === 'medium');
  const easyDiff = difficultyAnalytics.find(d => d.difficulty.toLowerCase() === 'easy');

  // Hard success < 60%
  if (hardDiff && hardDiff.interviewCount > 0 && hardDiff.successRate < 60) {
    recommendations.push({
      id: 'diff-hard-practice',
      priority: 'HIGH',
      title: 'Practice Hard interviews',
      description: `Your success rate on Hard interviews is ${hardDiff.successRate}%. Keep practicing to master them.`,
      action: 'Attempt more Hard interviews',
      category: 'Practice'
    });
  }

  // Medium high -> Ready for hard
  if (mediumDiff && mediumDiff.interviewCount >= 3 && mediumDiff.successRate >= 80) {
    recommendations.push({
      id: 'diff-ready-hard',
      priority: 'MEDIUM',
      title: 'Ready for Hard interviews',
      description: `You have an ${mediumDiff.successRate}% success rate on Medium. You are ready to step up.`,
      action: 'Take a Hard interview',
      category: 'Practice'
    });
  }

  // Easy high -> Increase difficulty
  if (easyDiff && easyDiff.interviewCount >= 3 && easyDiff.successRate >= 80 && !mediumDiff && !hardDiff) {
    recommendations.push({
      id: 'diff-increase',
      priority: 'LOW',
      title: 'Increase interview difficulty',
      description: 'You are crushing Easy interviews. Time to level up.',
      action: 'Try Medium difficulty',
      category: 'Practice'
    });
  }

  return recommendations;
};
