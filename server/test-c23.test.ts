import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from './src/config/firebaseAdmin';
import { codingDashboardService } from './src/services/coding/codingDashboardService';
import { codingAnalyticsService } from './src/services/coding/codingAnalyticsService';

describe('C23 Smart Daily Assignment Tests', () => {
  const userId = 'test-user-c23';
  const timezone = 'UTC';

  beforeEach(async () => {
    // Clear submissions and assignments for the test user
    const existingSubmissions = await db.collection('codingSubmissions').where('userId', '==', userId).get();
    const existingAssignments = await db.collection('codingDailyAssignments').where('userId', '==', userId).get();
    
    const batch = db.batch();
    existingSubmissions.docs.forEach(doc => batch.delete(doc.ref));
    existingAssignments.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Setup active problems
    await db.collection('codingProblems').doc('c23-easy-1').set({
      id: 'c23-easy-1',
      difficulty: 'EASY',
      topics: ['Arrays', 'Strings'],
      isActive: true
    });
    await db.collection('codingProblems').doc('c23-easy-2').set({
      id: 'c23-easy-2',
      difficulty: 'EASY',
      topics: ['Math'],
      isActive: true
    });
    await db.collection('codingProblems').doc('c23-med-1').set({
      id: 'c23-med-1',
      difficulty: 'MEDIUM',
      topics: ['Dynamic Programming'],
      isActive: true
    });
    await db.collection('codingProblems').doc('c23-hard-1').set({
      id: 'c23-hard-1',
      difficulty: 'HARD',
      topics: ['Graphs'],
      isActive: true
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('Test 1 - User with no history receives an appropriate fallback assignment (EASY)', async () => {
    const data = await codingDashboardService.getDashboardData(userId, timezone);
    expect(data.dailyAssignment).toBeDefined();
    expect(data.dailyAssignment?.difficulty).toBe('EASY');
    expect(data.dailyAssignment?.reason).toContain('beginner-friendly');
  });

  it('Test 2, 3 - Successfully solved problems are excluded, failed attempts do not count', async () => {
    // Attempted but failed an easy problem
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c23-easy-1',
      status: 'WRONG_ANSWER',
      language: 'python',
      submittedAt: new Date()
    });

    // Actually solved another problem
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'c23-med-1',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });

    const data = await codingDashboardService.getDashboardData(userId, timezone);
    
    // It should NOT assign c23-med-1 because it is solved
    expect(data.dailyAssignment?.problemId).not.toBe('c23-med-1');
  });

  it('Test 4 - Difficulty selection responds appropriately to user history', async () => {
    // Simulate user who solved 5 easy problems
    for (let i = 0; i < 5; i++) {
      // Mock 5 easy problem completions
      await db.collection('codingSubmissions').add({
        userId,
        problemId: `dummy-easy-${i}`,
        status: 'ACCEPTED',
        language: 'python',
        submittedAt: new Date()
      });
      // We also need to add these problems to the DB so analytics counts them properly
      await db.collection('codingProblems').doc(`dummy-easy-${i}`).set({
        id: `dummy-easy-${i}`,
        difficulty: 'EASY',
        topics: ['Math']
      });
    }

    const data = await codingDashboardService.getDashboardData(userId, timezone);
    // User solved >= 5 EASY, so target difficulty should jump to MEDIUM
    expect(data.dailyAssignment?.difficulty).toBe('MEDIUM');
    // c23-med-1 is the only medium active
    expect(data.dailyAssignment?.problemId).toBe('c23-med-1');
  });

  it('Test 5 - Topic coverage avoids unnecessary repetition when alternatives exist', async () => {
    // User must not be a "new user" (needs >= 1 solved) to enter topic rotation logic
    await db.collection('codingSubmissions').add({
      userId,
      problemId: 'dummy-starter',
      status: 'ACCEPTED',
      language: 'python',
      submittedAt: new Date()
    });

    // User already assigned c23-easy-1 ('Arrays', 'Strings')
    await db.collection('codingDailyAssignments').add({
      userId,
      problemId: 'c23-easy-1',
      dateKey: '2020-01-01',
      topic: 'Arrays',
      assignedAt: new Date()
    });

    // The logic should prefer c23-easy-2 ('Math') because it hasn't been practiced
    const data = await codingDashboardService.getDashboardData(userId, timezone);
    expect(data.dailyAssignment?.problemId).toBe('c23-easy-2');
  });

  it('Test 10 - Missing or incomplete problem metadata does not crash selection', async () => {
    await db.collection('codingProblems').doc('c23-missing-meta').set({
      id: 'c23-missing-meta',
      difficulty: 'EASY', // missing topics
      isActive: true
    });

    // Set all other c23 problems to inactive to force the selection of the missing metadata one
    const existing = await db.collection('codingProblems').get();
    const batch = db.batch();
    existing.docs.forEach(doc => {
      if (doc.id.startsWith('c23-') && doc.id !== 'c23-missing-meta') {
        batch.update(doc.ref, { isActive: false });
      }
    });
    await batch.commit();

    const data = await codingDashboardService.getDashboardData(userId, timezone);
    expect(data.dailyAssignment?.problemId).toBe('c23-missing-meta');
    expect(data.dailyAssignment?.topic).toBe('General'); // Fallback topic
  });

  it('Test 6 - Assignment identity remains stable for repeated requests on the same day', async () => {
    const data1 = await codingDashboardService.getDashboardData(userId, timezone);
    const data2 = await codingDashboardService.getDashboardData(userId, timezone);

    expect(data1.dailyAssignment?.problemId).toBe(data2.dailyAssignment?.problemId);
    expect(data1.dailyAssignment?.id).toBe(data2.dailyAssignment?.id);
  });

  it('Test 7 - Different users receive independently computed assignments', async () => {
    const user2 = 'test-user-c23-alt';
    const data1 = await codingDashboardService.getDashboardData(userId, timezone);
    const data2 = await codingDashboardService.getDashboardData(user2, timezone);

    // Clean up user 2
    const existingAssignments = await db.collection('codingDailyAssignments').where('userId', '==', user2).get();
    const batch = db.batch();
    existingAssignments.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Can be same or different depending on deterministic hash, but logic is independent
    expect(data1.dailyAssignment?.userId).toBe(userId);
    expect(data2.dailyAssignment?.userId).toBe(user2);
  });

  it('Test 8 - Exhausted problem pool is handled safely', async () => {
    // Solved ALL available active problems
    await db.collection('codingSubmissions').add({ userId, problemId: 'c23-easy-1', status: 'ACCEPTED', submittedAt: new Date() });
    await db.collection('codingSubmissions').add({ userId, problemId: 'c23-easy-2', status: 'ACCEPTED', submittedAt: new Date() });
    await db.collection('codingSubmissions').add({ userId, problemId: 'c23-med-1', status: 'ACCEPTED', submittedAt: new Date() });
    await db.collection('codingSubmissions').add({ userId, problemId: 'c23-hard-1', status: 'ACCEPTED', submittedAt: new Date() });

    const data = await codingDashboardService.getDashboardData(userId, timezone);
    // Should fallback to any active problem safely rather than crashing
    expect(data.dailyAssignment).toBeDefined();
    expect(data.dailyAssignment?.problemId).toBeDefined();
  });
  
  it('Test 9 - Concurrent assignment requests do not create conflicting assignments', async () => {
    const req1 = codingDashboardService.getDashboardData(userId, timezone);
    const req2 = codingDashboardService.getDashboardData(userId, timezone);
    const req3 = codingDashboardService.getDashboardData(userId, timezone);

    const [res1, res2, res3] = await Promise.all([req1, req2, req3]);
    
    expect(res1.dailyAssignment?.id).toBe(res2.dailyAssignment?.id);
    expect(res2.dailyAssignment?.id).toBe(res3.dailyAssignment?.id);
  });

});
