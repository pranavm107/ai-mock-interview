import { getCareerMetrics } from './careerMetricsService';
import { 
  computeCareerScore, 
  computeCareerReadiness, 
  computeTrends, 
  aggregateSkills 
} from './careerAnalyticsEngine';
import { 
  generateWeeklyFocus, 
  generateLearningRoadmap, 
  generateDailyGoals, 
  generateRecommendationSummary 
} from './careerRecommendationEngine';
import { db } from '../../config/firebaseAdmin';

export const getCareerDashboardIntelligence = async (userId: string) => {
  // 1. Fetch unified metrics
  const metrics = await getCareerMetrics(userId);

  // 2. Compute Analytics
  const scoreDetails = computeCareerScore(metrics);
  const readiness = computeCareerReadiness(scoreDetails.totalScore, metrics);
  const trends = computeTrends(metrics.sessions);
  const skills = aggregateSkills(metrics);

  // 3. Generate Recommendations
  const weakestSkill = Object.entries(skills)
    .sort(([, a], [, b]) => a - b)[0]?.[0] || 'Fundamentals';
    
  const weeklyFocus = generateWeeklyFocus(skills, metrics.sessions);
  const roadmap = generateLearningRoadmap(skills);
  const dailyGoals = generateDailyGoals(metrics.sessions, weakestSkill);
  const recommendations = generateRecommendationSummary(skills);

  // 4. Construct Monthly Summary
  const monthlySummary = {
    totalInterviews: metrics.completedInterviews,
    averageScore: metrics.averageScore !== null ? Math.round(metrics.averageScore) : 0,
    communicationTrend: trends.trend,
    summary: `You have completed ${metrics.completedInterviews} interviews so far. Your average score is ${metrics.averageScore !== null ? Math.round(metrics.averageScore) : 0}. Focus on ${weakestSkill} to improve your overall readiness.`,
    bestInterview: metrics.sessions.length > 0 
      ? metrics.sessions.reduce((max, s) => (s.score || 0) > (max.score || 0) ? s : max, metrics.sessions[0]) 
      : null,
  };

  // 5. Build Final Payload
  const payload = {
    metrics,
    profile: {
      userId,
      readinessLevel: readiness.level,
      readinessReason: readiness.reason,
      totalInterviews: metrics.totalInterviews,
      lastActive: metrics.lastActive,
      strengths: recommendations.strengths,
      weaknesses: recommendations.weaknesses,
      opportunities: recommendations.opportunities,
    },
    score: scoreDetails,
    trends,
    skills,
    weekly: weeklyFocus,
    roadmap,
    daily: dailyGoals,
    monthly: monthlySummary,
    recentPerformance: metrics.sessions.slice(0, 5).map(s => ({
      id: s.id,
      date: s.createdAt,
      score: s.score || 0,
      status: s.status,
      type: s.interviewType || 'Mixed'
    }))
  };

  return payload;
};
