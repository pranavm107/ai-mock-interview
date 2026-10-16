import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from './src/config/firebaseAdmin';
import { codingAnalyticsService } from './src/services/coding/codingAnalyticsService';

describe('C22 Coding Analytics Tests', () => {
  const userId = 'test-user-c22';

  beforeEach(async () => {
    // Clear submissions for the test user
    const existingSubmissions = await db.collection('codingSubmissions').where('userId', '==', userId).get();
    const batch = db.batch();
    existingSubmissions.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Create a couple of mock problems for breakdown
    await db.collection('codingProblems').doc('dummy-easy').set({
      id: 'dummy-easy',
      difficulty: 'EASY',
      topics: ['Arrays', 'Strings']
    });
    
    await db.collection('codingProblems').doc('dummy-hard').set({
      id: 'dummy-hard',
      difficulty: 'HARD',
      topics: ['Dynamic Programming']
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('Test 1 - Empty user history returns zeroed analytics gracefully', async () => {
    const analytics = await codingAnalyticsService.getUserAnalytics(userId);
    expect(analytics.totalAttempts).toBe(0);
    expect(analytics.totalSolved).toBe(0);
    expect(analytics.acceptanceRate).toBe(0);
    expect(analytics.recentActivity.length).toBe(0);
  });

  it('Test 2 - Correct acceptance rate and duplicate solved handling', async () => {
    // Add 3 submissions: 2 Accepted (same problem), 1 Wrong Answer
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-easy',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-easy',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-hard',
      status: 'WRONG_ANSWER',
      language: 'java',
      submittedAt: new Date()
    });

    const analytics = await codingAnalyticsService.getUserAnalytics(userId);
    
    expect(analytics.totalAttempts).toBe(3);
    
    // Unique solved problems should be 1 (dummy-easy was solved twice)
    expect(analytics.totalSolved).toBe(1);
    
    // Attempted unique problems
    expect(analytics.uniqueProblemsAttempted).toBe(2);

    // Acceptance rate = (2 ACCEPTED / 3 total) = 67%
    expect(analytics.acceptanceRate).toBe(67);
  });

  it('Test 3 - Difficulty, topic, and language aggregation', async () => {
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-easy',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-hard',
      status: 'ACCEPTED',
      language: 'java',
      submittedAt: new Date()
    });

    const analytics = await codingAnalyticsService.getUserAnalytics(userId);

    // Language breakdown includes all attempts
    expect(analytics.languageBreakdown['python']).toBe(1);
    expect(analytics.languageBreakdown['java']).toBe(1);

    // Difficulty breakdown only counts unique solved problems
    expect(analytics.difficultyBreakdown['EASY']).toBe(1);
    expect(analytics.difficultyBreakdown['HARD']).toBe(1);
    expect(analytics.difficultyBreakdown['MEDIUM']).toBe(0);

    // Topic breakdown only counts unique solved problems
    expect(analytics.topicBreakdown['Arrays']).toBe(1);
    expect(analytics.topicBreakdown['Strings']).toBe(1);
    expect(analytics.topicBreakdown['Dynamic Programming']).toBe(1);
  });

  it('Test 4 - 30-day window boundary for recent activity', async () => {
    // Current submission
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-easy',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });

    // 40 days ago submission
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40);
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-easy',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: oldDate
    });

    const analytics = await codingAnalyticsService.getUserAnalytics(userId);

    // Lifetime metrics should count both
    expect(analytics.totalAttempts).toBe(2);

    // Recent activity should only count the 1 in the last 30 days
    // Since recentActivity groups by date, we can sum the attempts
    const recentAttempts = analytics.recentActivity.reduce((acc, curr) => acc + curr.attempts, 0);
    expect(recentAttempts).toBe(1);
  });
});
