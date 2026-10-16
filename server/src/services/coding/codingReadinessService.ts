import { codingAnalyticsService } from './codingAnalyticsService';
import { CodingReadinessData } from '../../types/coding';

export class CodingReadinessService {
  /**
   * Calculates a coding readiness score (0-100) based on user's historical performance.
   * Leverages the C22 Coding Analytics engine to avoid duplicate database queries.
   */
  async getReadiness(userId: string, timezone: string): Promise<CodingReadinessData> {
    const analytics = await codingAnalyticsService.getUserAnalytics(userId, timezone);

    // If the user has literally 0 attempts, return an honest "onboarding" state
    if (analytics.totalAttempts === 0) {
      return {
        score: 0,
        level: 'Getting Started',
        factors: {
          successScore: 0,
          difficultyScore: 0,
          topicScore: 0,
          consistencyScore: 0
        },
        strengths: [],
        improvementAreas: ['Start practicing to unlock your readiness score.'],
        recommendation: 'Complete your first few coding problems to establish a baseline.',
        isNewUser: true
      };
    }

    // 1. Success Factor (Max 20 points)
    // Acceptance rate maps linearly. 100% acceptance = 20 pts.
    const successScore = Math.min(20, Math.round(analytics.acceptanceRate * 0.20));

    // 2. Volume & Difficulty Factor (Max 50 points)
    // Easy: 1 pt, Medium: 3 pts, Hard: 5 pts.
    const easyCount = analytics.difficultyBreakdown['EASY'] || 0;
    const medCount = analytics.difficultyBreakdown['MEDIUM'] || 0;
    const hardCount = analytics.difficultyBreakdown['HARD'] || 0;
    
    const rawDifficultyScore = (easyCount * 1) + (medCount * 3) + (hardCount * 5);
    const difficultyScore = Math.min(50, rawDifficultyScore);

    // 3. Topic Coverage Factor (Max 20 points)
    // 4 points per unique mastered topic.
    const uniqueTopics = Object.keys(analytics.topicBreakdown).length;
    const topicScore = Math.min(20, uniqueTopics * 4);

    // 4. Consistency Factor (Max 10 points)
    // 2 points per unique active day in the last 30 days.
    const activeDays = analytics.recentActivity.filter(a => a.attempts > 0).length;
    const consistencyScore = Math.min(10, activeDays * 2);

    const totalScore = successScore + difficultyScore + topicScore + consistencyScore;

    // Determine Readiness Level
    let level: 'Getting Started' | 'Building Foundations' | 'Interview Ready' = 'Getting Started';
    if (totalScore >= 80) {
      level = 'Interview Ready';
    } else if (totalScore >= 40) {
      level = 'Building Foundations';
    }

    // Generate explainable insights
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    if (successScore >= 15) strengths.push(`High accuracy (${analytics.acceptanceRate}% acceptance rate)`);
    else if (successScore < 10 && analytics.totalAttempts > 5) improvementAreas.push(`Accuracy could improve (currently ${analytics.acceptanceRate}%)`);

    if (topicScore >= 16) strengths.push(`Broad topic coverage (${uniqueTopics} topics mastered)`);
    else improvementAreas.push(`Broaden topic coverage (only ${uniqueTopics} topics mastered so far)`);

    if (difficultyScore >= 40) strengths.push('Strong performance on Medium/Hard problems');
    else if (hardCount === 0 && medCount === 0) improvementAreas.push('Try attempting Medium difficulty problems');

    if (consistencyScore >= 8) strengths.push('Consistent recent practice');
    else improvementAreas.push('Try to practice more consistently over the month');

    // Default recommendation
    let recommendation = 'Keep practicing to build your foundation.';
    if (level === 'Interview Ready') {
      recommendation = 'You are showing strong competence! Maintain your edge with occasional Hard problems.';
    } else if (level === 'Building Foundations') {
      if (topicScore < 12) {
        recommendation = 'Focus on diversifying the topics you practice.';
      } else {
        recommendation = 'Start challenging yourself with more Medium difficulty problems.';
      }
    }

    return {
      score: totalScore,
      level,
      factors: {
        successScore,
        difficultyScore,
        topicScore,
        consistencyScore
      },
      strengths,
      improvementAreas,
      recommendation,
      isNewUser: false
    };
  }
}

export const codingReadinessService = new CodingReadinessService();
