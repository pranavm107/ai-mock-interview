import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPreparationRecommendations } from '../../src/services/preparationRecommendationService';
import * as analyticsService from '../../src/services/assessmentAnalyticsService';
import * as groqService from '../../src/services/groqService';
import { db } from '../../src/config/firebaseAdmin';

vi.mock('../../src/services/assessmentAnalyticsService');
vi.mock('../../src/services/groqService');
vi.mock('../../src/config/firebaseAdmin', () => {
  const collectionMock = vi.fn().mockReturnThis();
  const docMock = vi.fn().mockReturnThis();
  const getMock = vi.fn();
  const setMock = vi.fn();
  return {
    db: {
      collection: collectionMock,
      doc: docMock,
      get: getMock,
      set: setMock
    }
  };
});

describe('preparationRecommendationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false for hasEnoughData when user has 0 assessments', async () => {
    vi.mocked(analyticsService.getUserAnalytics).mockResolvedValue({
      overall: { totalCompleted: 0 }
    } as any);

    const result = await getPreparationRecommendations('user-1');
    expect(result.hasEnoughData).toBe(false);
    expect(result.recommendation).toBeNull();
    expect(groqService.callGroq).not.toHaveBeenCalled();
  });

  it('uses cached data if assessments count has not changed', async () => {
    vi.mocked(analyticsService.getUserAnalytics).mockResolvedValue({
      overall: { totalCompleted: 5 }
    } as any);

    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        assessmentsCompletedAtGeneration: 5,
        recommendation: { summary: "Cached!" }
      })
    });
    vi.mocked(db.collection('users').doc('user-1').collection('prep').doc('latest').get).mockImplementation(mockGet as any);

    const result = await getPreparationRecommendations('user-1');
    expect(result.hasEnoughData).toBe(true);
    expect(result.recommendation?.summary).toBe("Cached!");
    expect(groqService.callGroq).not.toHaveBeenCalled();
  });

  it('generates new recommendation via Groq and parses JSON', async () => {
    vi.mocked(analyticsService.getUserAnalytics).mockResolvedValue({
      overall: { totalCompleted: 5 },
      categories: [],
      topics: [],
      trend: []
    } as any);

    const mockGet = vi.fn().mockResolvedValue({ exists: false });
    const mockSet = vi.fn().mockResolvedValue(true);
    
    const docRefMock = {
      get: mockGet,
      set: mockSet,
      collection: vi.fn().mockReturnThis(),
      doc: vi.fn().mockReturnThis()
    };
    
    vi.mocked(db.collection('users').doc('user-1').collection('prep').doc('latest').get).mockImplementation(mockGet as any);
    vi.mocked(db.collection('users').doc('user-1').collection('prep').doc('latest').set).mockImplementation(mockSet as any);

    const mockAIResponse = {
      summary: "AI generated summary.",
      strengths: [],
      focusAreas: [],
      recommendedTopics: [],
      studyPlan: [],
      nextAssessment: {
        category: "Aptitude",
        topic: "General",
        difficulty: "EASY",
        questionCount: 10,
        reason: "To start"
      }
    };

    vi.mocked(groqService.callGroq).mockResolvedValue(JSON.stringify(mockAIResponse));

    const result = await getPreparationRecommendations('user-1');
    expect(result.hasEnoughData).toBe(true);
    expect(result.recommendation?.summary).toBe("AI generated summary.");
    expect(groqService.callGroq).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledTimes(1);
  });
  
  it('throws an error if AI returns malformed JSON', async () => {
    vi.mocked(analyticsService.getUserAnalytics).mockResolvedValue({
      overall: { totalCompleted: 5 },
      categories: [],
      topics: [],
      trend: []
    } as any);

    const mockGet = vi.fn().mockResolvedValue({ exists: false });
    vi.mocked(db.collection('users').doc('user-1').collection('prep').doc('latest').get).mockImplementation(mockGet as any);

    // Bad structure - missing 'nextAssessment'
    const mockAIResponse = {
      summary: "AI generated summary."
    };

    vi.mocked(groqService.callGroq).mockResolvedValue(JSON.stringify(mockAIResponse));

    await expect(getPreparationRecommendations('user-1')).rejects.toThrow('Failed to generate valid recommendation from AI provider');
    expect(groqService.callGroq).toHaveBeenCalledTimes(2); // Retries once
  });
});
