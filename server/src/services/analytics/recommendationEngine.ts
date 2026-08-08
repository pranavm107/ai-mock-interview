import { AnalyticsRecommendation, AnalyticsResponse } from '../../types/analyticsResponse';
import { evaluatePerformanceRules } from './rules/performanceRules';
import { evaluateCommunicationRules } from './rules/communicationRules';
import { evaluateSpeechRules } from './rules/speechRules';
import { evaluateResumeRules } from './rules/resumeRules';
import { evaluateDifficultyRules } from './rules/difficultyRules';
import { evaluateActivityRules } from './rules/activityRules';
import { evaluateConsistencyRules } from './rules/consistencyRules';

export const generateRecommendations = (
  analyticsData: Omit<AnalyticsResponse, 'recommendations' | 'generatedAt'>
): AnalyticsRecommendation[] => {
  let recommendations: AnalyticsRecommendation[] = [];

  // Evaluate all rules modularly
  recommendations.push(...evaluatePerformanceRules(analyticsData));
  recommendations.push(...evaluateCommunicationRules(analyticsData));
  recommendations.push(...evaluateSpeechRules(analyticsData));
  recommendations.push(...evaluateResumeRules(analyticsData));
  recommendations.push(...evaluateDifficultyRules(analyticsData));
  recommendations.push(...evaluateActivityRules(analyticsData));
  recommendations.push(...evaluateConsistencyRules(analyticsData));

  // Deduplicate by ID just in case
  const uniqueRecs = new Map<string, AnalyticsRecommendation>();
  recommendations.forEach(r => uniqueRecs.set(r.id, r));
  recommendations = Array.from(uniqueRecs.values());

  // Priority Engine Sorting (HIGH -> MEDIUM -> LOW)
  const priorityScore = {
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  };

  recommendations.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

  // Fallback if doing perfect
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'keep-practicing',
      priority: 'LOW',
      title: 'Keep Practicing',
      description: 'You are doing great! Maintain consistency by practicing regularly.',
      action: 'Start a new interview',
      category: 'General'
    });
  }

  // Cap at maximum of 5 recommendations
  return recommendations.slice(0, 5);
};
