import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserAnalytics } from '../../src/services/assessmentAnalyticsService';
import { db } from '../../src/config/firebaseAdmin';

vi.mock('../../src/config/firebaseAdmin', () => {
  const docMock = {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnValue('mock-ref')
  };

  const queryMock: any = {
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    get: vi.fn(),
    doc: vi.fn().mockReturnValue(docMock)
  };

  return {
    db: {
      collection: vi.fn().mockReturnValue(queryMock),
      getAll: vi.fn()
    }
  };
});

describe('assessmentAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty analytics for a user with no completed assessments', async () => {
    // Just grab the global mock for 'get'
    const queryObj = db.collection('assessments');
    vi.mocked(queryObj.get).mockResolvedValue({ empty: true, docs: [] } as any);

    const analytics = await getUserAnalytics('user-123');

    expect(analytics.overall.totalCompleted).toBe(0);
    expect(analytics.overall.averageScore).toBe(0);
    expect(analytics.categories.length).toBe(0);
    expect(analytics.topics.length).toBe(0);
    expect(analytics.trend.length).toBe(0);
  });

  it('aggregates overall metrics, categories, topics, and trend accurately', async () => {
    const queryObj = db.collection('assessments');
    const getMock = queryObj.get as any;

    const mockAssessments = [
      { id: 'a1', title: 'Python Basics', type: 'TECHNICAL_MCQ', topic: 'Python' },
      { id: 'a2', title: 'Resume Test', type: 'RESUME_MCQ' },
      { id: 'a3', title: 'Quant', type: 'APTITUDE', category: 'QUANTITATIVE', topic: 'Algebra' },
    ];

    const mockResults = [
      { score: 8, percentage: 80, totalQuestions: 10, correctAnswers: 8, incorrectAnswers: 2, unansweredQuestions: 0 },
      { score: 5, percentage: 50, totalQuestions: 10, correctAnswers: 5, incorrectAnswers: 5, unansweredQuestions: 0 },
      { score: 10, percentage: 100, totalQuestions: 10, correctAnswers: 10, incorrectAnswers: 0, unansweredQuestions: 0 },
    ];

    getMock.mockResolvedValue({
      empty: false,
      docs: mockAssessments.map((a, i) => ({
        id: a.id,
        data: () => ({ ...a, createdAt: `2023-01-0${i+1}T10:00:00Z` }),
        ref: { collection: () => ({ doc: () => `ref-${i}` }) }
      }))
    });

    // Since the service sorts by createdAt DESC, the requests to getAll will be in reverse order (a3, a2, a1)
    vi.mocked(db.getAll).mockResolvedValue([
      { data: () => ({ ...mockResults[2], completedAt: '2023-01-03T10:30:00Z' }) },
      { data: () => ({ ...mockResults[1], completedAt: '2023-01-02T10:30:00Z' }) },
      { data: () => ({ ...mockResults[0], completedAt: '2023-01-01T10:30:00Z' }) }
    ] as any);

    const analytics = await getUserAnalytics('user-123');

    // Overall
    expect(analytics.overall.totalCompleted).toBe(3);
    expect(analytics.overall.bestScore).toBe(100);
    expect(analytics.overall.totalQuestions).toBe(30);
    expect(analytics.overall.totalCorrect).toBe(23);
    expect(analytics.overall.totalIncorrect).toBe(7);
    
    // Average Score should now be an average percentage
    // (80 + 50 + 100) / 3 = 230 / 3 = 76.7
    expect(analytics.overall.averageScore).toBe(76.7);
    expect(analytics.overall.averageAccuracy).toBe(76.7);
    
    // Trend should be reversed to chronological (oldest first if input is desc)
    expect(analytics.trend.length).toBe(3);
    expect(analytics.trend[0].assessmentId).toBe('a1'); 

    // Category
    expect(analytics.categories.find(c => c.category === 'Technical MCQs')?.assessments).toBe(1);
    expect(analytics.categories.find(c => c.category === 'Technical MCQs')?.averageScore).toBe(80);
    expect(analytics.categories.find(c => c.category === 'Technical MCQs')?.bestScore).toBe(80);

    // Topic Strong/Weak classification
    const py = analytics.topics.find(t => t.topic === 'Python');
    expect(py?.status).toBe('Strong'); // 80%

    const alg = analytics.topics.find(t => t.topic === 'Algebra');
    expect(alg?.status).toBe('Strong'); // 100%
  });
});
