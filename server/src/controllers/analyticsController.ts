import { Request, Response } from 'express';
import { db } from '../config/firebaseAdmin';
import { 
  getDashboardAnalytics, 
  getPerformanceTrend, 
  getSkillTrend, 
  getCategoryTrend, 
  getDifficultyAnalytics, 
  getActivityHeatmap, 
  getSpeechAnalytics, 
  getResumeAnalytics 
} from '../services/analytics/analyticsService';
import { calculateQuestionAnalytics } from '../services/analytics/questionAnalytics';
import { generateRecommendations } from '../services/analytics/recommendationEngine';
import { getAuth } from '@clerk/express';
import { AnalyticsResponse } from '../types/analyticsResponse';
import { InterviewSession } from '../types/interviewSession';

export const getUnifiedAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const startTime = Date.now();

    // Exactly one Firestore query for sessions
    const sessionsSnapshot = await db.collection('interviewSessions').where('userId', '==', userId).get();
    const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InterviewSession));

    // Execute in parallel where possible (resumes still needs async fetch inside service)
    const [
      resumeAnalytics
    ] = await Promise.all([
      getResumeAnalytics(userId)
    ]);

    // Memory aggregations
    const overview = getDashboardAnalytics(sessions);
    const performanceTrend = getPerformanceTrend(sessions);
    const skillTrend = getSkillTrend(sessions);
    const categoryTrend = getCategoryTrend(sessions);
    const difficultyAnalytics = getDifficultyAnalytics(sessions);
    const activityHeatmap = getActivityHeatmap(sessions);
    const speechAnalytics = getSpeechAnalytics(sessions);
    const questionAnalytics = calculateQuestionAnalytics(sessions);

    const analyticsData = {
      overview,
      performanceTrend,
      skillTrend,
      categoryTrend,
      difficultyAnalytics,
      activityHeatmap,
      speechAnalytics,
      questionAnalytics,
      resumeAnalytics
    };

    const recommendations = generateRecommendations(analyticsData);

    const payload: AnalyticsResponse = {
      ...analyticsData,
      recommendations,
      generatedAt: new Date().toISOString()
    };

    if (process.env.NODE_ENV !== 'production') {
      const execTime = Date.now() - startTime;
      const payloadSize = JSON.stringify(payload).length;
      console.log(`Analytics Request | User ID: ${userId} | Execution Time: ${execTime}ms | Functions Executed: 10 | Payload Size: ${payloadSize} bytes`);
    }

    return res.status(200).json(payload);

  } catch (error: any) {
    console.error('Analytics Error:', error.message || error);
    return res.status(500).json({ error: 'Failed to generate analytics payload' });
  }
};
