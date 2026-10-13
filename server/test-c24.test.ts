import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from './src/config/firebaseAdmin';
import { codingReadinessService } from './src/services/coding/codingReadinessService';
import { codingAnalyticsService } from './src/services/coding/codingAnalyticsService';

describe('C24 Coding Readiness Tests', () => {
  const userId = 'test-user-c24';
  const timezone = 'UTC';

  beforeEach(async () => {
    // Clear submissions for the test user
    const existingSubmissions = await db.collection('codingSubmissions').where('userId', '==', userId).get();
    const batch = db.batch();
    existingSubmissions.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Create a couple of mock problems for breakdown
    await db.collection('codingProblems').doc('c24-easy').set({
      id: 'c24-easy',
      difficulty: 'EASY',
      topics: ['Arrays', 'Strings']
    });
    
    await db.collection('codingProblems').doc('c24-hard').set({
      id: 'c24-hard',
      difficulty: 'HARD',
      topics: ['Dynamic Programming', 'Graphs'] // 2 topics
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('Test 1 - A user with no history receives an honest onboarding state', async () => {
    const readiness = await codingReadinessService.getReadiness(userId, timezone);
    expect(readiness.score).toBe(0);
    expect(readiness.level).toBe('Getting Started');
    expect(readiness.isNewUser).toBe(true);
    expect(readiness.recommendation).toContain('first few coding problems');
  });

  it('Test 2, 3 - Repeated accepted submissions do not inflate unique solved counts, failed submissions do not count', async () => {
    // 2 Accepted for same easy problem, 1 failed for hard problem
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c24-easy',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c24-easy',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c24-hard',
      status: 'WRONG_ANSWER',
      language: 'java',
      submittedAt: new Date()
    });

    const readiness = await codingReadinessService.getReadiness(userId, timezone);
    expect(readiness.isNewUser).toBe(false);
    
    // Success Score: 2 ACCEPTED / 3 TOTAL = 67% acceptance rate. 67 * 0.20 = 13 points.
    expect(readiness.factors.successScore).toBe(13);
    
    // Difficulty Score: Only 1 unique easy problem solved -> 1 pt.
    expect(readiness.factors.difficultyScore).toBe(1);

    // Topic Score: c24-easy has 2 topics ('Arrays', 'Strings'). 2 * 4 = 8 points.
    expect(readiness.factors.topicScore).toBe(8);

    // Total = 13 + 1 + 8 + consistency (2 pt for 1 day) = 24
    expect(readiness.score).toBe(24);
    expect(readiness.level).toBe('Getting Started'); // < 40
  });

  it('Test 4 - Difficulty and topic coverage are calculated correctly', async () => {
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c24-easy',
      status: 'ACCEPTED',
      submittedAt: new Date()
    });
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c24-hard',
      status: 'ACCEPTED',
      submittedAt: new Date()
    });

    const readiness = await codingReadinessService.getReadiness(userId, timezone);
    // Success: 2/2 = 100% -> 20 pts
    // Difficulty: 1 easy (1 pt) + 1 hard (5 pts) -> 6 pts
    // Topics: Arrays, Strings, DP, Graphs (4 topics) -> 4 * 4 = 16 pts
    // Consistency: 1 day -> 2 pts
    // Total = 20 + 6 + 16 + 2 = 44 pts (Building Foundations)
    expect(readiness.factors.successScore).toBe(20);
    expect(readiness.factors.difficultyScore).toBe(6);
    expect(readiness.factors.topicScore).toBe(16);
    expect(readiness.score).toBe(44);
    expect(readiness.level).toBe('Building Foundations');
  });

  it('Test 6 - Missing problem metadata is handled safely', async () => {
    await db.collection('codingProblems').doc('c24-missing').set({
      id: 'c24-missing',
      difficulty: 'EASY'
      // missing topics array
    });
    
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c24-missing',
      status: 'ACCEPTED',
      submittedAt: new Date()
    });

    const readiness = await codingReadinessService.getReadiness(userId, timezone);
    // Topics count should be 0 safely
    expect(readiness.factors.topicScore).toBe(0);
  });

  it('Test exact score boundaries for levels (39/40, 79/80)', async () => {
    // 39 -> Getting Started
    // Mock codingAnalyticsService to return specific raw numbers to yield exactly 39
    vi.spyOn(codingAnalyticsService, 'getUserAnalytics').mockResolvedValueOnce({
      totalAttempts: 10,
      totalSolved: 10,
      uniqueProblemsAttempted: 10,
      acceptanceRate: 50, // success: 10 pts
      difficultyBreakdown: { 'EASY': 10, 'MEDIUM': 3 }, // diff: 19 pts
      topicBreakdown: { 'T1': 1, 'T2': 1 }, // topics: 8 pts
      languageBreakdown: {},
      recentActivity: [{ date: '2020-01-01', attempts: 1, solved: 1 }], // 1 day = 2 pts
      // total = 10 + 19 + 8 + 2 = 39
    });
    
    let readiness = await codingReadinessService.getReadiness(userId, timezone);
    expect(readiness.score).toBe(39);
    expect(readiness.level).toBe('Getting Started');

    // 40 -> Building Foundations
    vi.spyOn(codingAnalyticsService, 'getUserAnalytics').mockResolvedValueOnce({
      totalAttempts: 10,
      totalSolved: 10,
      uniqueProblemsAttempted: 10,
      acceptanceRate: 55, // success: 11 pts
      difficultyBreakdown: { 'EASY': 10, 'MEDIUM': 3 }, // diff: 19 pts
      topicBreakdown: { 'T1': 1, 'T2': 1 }, // topics: 8 pts
      languageBreakdown: {},
      recentActivity: [{ date: '2020-01-01', attempts: 1, solved: 1 }], // 1 day = 2 pts
      // total = 11 + 19 + 8 + 2 = 40
    });
    
    readiness = await codingReadinessService.getReadiness(userId, timezone);
    expect(readiness.score).toBe(40);
    expect(readiness.level).toBe('Building Foundations');

    // 79 -> Building Foundations
    vi.spyOn(codingAnalyticsService, 'getUserAnalytics').mockResolvedValueOnce({
      totalAttempts: 10,
      totalSolved: 10,
      uniqueProblemsAttempted: 10,
      acceptanceRate: 100, // success: 20 pts
      difficultyBreakdown: { 'HARD': 7, 'MEDIUM': 4 }, // diff: 35 + 12 = 47 pts
      topicBreakdown: { 'T1': 1, 'T2': 1 }, // topics: 8 pts
      languageBreakdown: {},
      recentActivity: [
        { date: '1', attempts: 1, solved: 1 },
        { date: '2', attempts: 1, solved: 1 }
      ], // 2 days = 4 pts
      // total = 20 + 47 + 8 + 4 = 79
    });
    
    readiness = await codingReadinessService.getReadiness(userId, timezone);
    expect(readiness.score).toBe(79);
    expect(readiness.level).toBe('Building Foundations');

    // 80 -> Interview Ready
    vi.spyOn(codingAnalyticsService, 'getUserAnalytics').mockResolvedValueOnce({
      totalAttempts: 10,
      totalSolved: 10,
      uniqueProblemsAttempted: 10,
      acceptanceRate: 100, // success: 20 pts
      difficultyBreakdown: { 'HARD': 7, 'MEDIUM': 3 }, // diff: 35 + 9 = 44 pts
      topicBreakdown: { 'T1': 1, 'T2': 1 }, // topics: 8 pts
      languageBreakdown: {},
      recentActivity: [
        { date: '1', attempts: 1, solved: 1 },
        { date: '2', attempts: 1, solved: 1 },
        { date: '3', attempts: 1, solved: 1 },
        { date: '4', attempts: 1, solved: 1 }
      ], // 4 days = 8 pts
      // total = 20 + 44 + 8 + 8 = 80
    });

    readiness = await codingReadinessService.getReadiness(userId, timezone);
    expect(readiness.score).toBe(80);
    expect(readiness.level).toBe('Interview Ready');
  });

  it('Test 8 - Identical data produces deterministic results', async () => {
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c24-easy',
      status: 'ACCEPTED',
      submittedAt: new Date()
    });

    const r1 = await codingReadinessService.getReadiness(userId, timezone);
    const r2 = await codingReadinessService.getReadiness(userId, timezone);
    expect(r1).toEqual(r2);
  });
});
