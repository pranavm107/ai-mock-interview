import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSuggestedInterview } from '../../src/services/interviewRecommendationService';
import * as dashboardService from '../../src/services/dashboard/dashboardService';
import * as aiService from '../../src/services/interviewRecommendationAIService';
import * as logger from '../../src/utils/logger';

// Mock dependencies
vi.mock('../../src/services/dashboard/dashboardService');
vi.mock('../../src/services/interviewRecommendationAIService');
vi.mock('../../src/utils/logger');
vi.mock('../../src/config/firebaseAdmin', () => ({
  db: {} // Mock db existence to pass `if (!db)`
}));

describe('interviewRecommendationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for AI Enrichment
    vi.mocked(aiService.enrichRecommendation).mockResolvedValue({
      focusAreas: ['Mocked Focus Area']
    });

    vi.mocked(aiService.mergeAIRecommendation).mockImplementation((baseline, enhancement) => {
      return { ...baseline, ...enhancement };
    });
  });

  it('generates recommendation for a new user (no history, valid profile)', async () => {
    vi.mocked(dashboardService.getDashboardMetadata).mockResolvedValue({
      rawProfile: {
        profile: {
          targetRole: 'Software Engineer',
          targetCompany: 'Google',
          experienceLevel: 'Junior',
        }
      },
      rawResumes: [],
      activeResume: null,
      recentInterviews: [],
      rawReports: [],
      stats: {
        completedInterviews: 0,
        averageScore: 0,
        scoreTrend: 'flat',
        currentStreak: 0
      }
    } as any);

    const result = await getSuggestedInterview('user-123', { requestId: 'req-1' });

    expect(result).toHaveProperty('targetRole', 'Software Engineer');
    expect(result).toHaveProperty('experienceLevel', 'Junior');
    expect(result).toHaveProperty('interviewType'); // from baseline logic
    expect(vi.mocked(dashboardService.getDashboardMetadata)).toHaveBeenCalledWith('user-123');
  });

  it('generates recommendation for an existing user', async () => {
    vi.mocked(dashboardService.getDashboardMetadata).mockResolvedValue({
      rawProfile: {
        profile: {
          targetRole: 'Backend Engineer',
        }
      },
      rawResumes: [{ id: 'resume-1', skills: ['Node.js'] }],
      activeResume: { id: 'resume-1', hasAnalysis: true },
      recentInterviews: [{ difficulty: 'EASY', createdAt: new Date().toISOString() }],
      rawReports: [],
      stats: {
        completedInterviews: 3,
        averageScore: 75,
        scoreTrend: 'up',
        currentStreak: 1
      }
    } as any);

    const result = await getSuggestedInterview('user-123');

    expect(result).toHaveProperty('targetRole', 'Backend Engineer');
    expect(result).toHaveProperty('resumeId', 'resume-1');
  });

  it('returns incomplete_profile when targetRole is missing', async () => {
    vi.mocked(dashboardService.getDashboardMetadata).mockResolvedValue({
      rawProfile: { profile: {} },
      rawResumes: [],
      activeResume: null,
      recentInterviews: [],
      rawReports: [],
      stats: { completedInterviews: 0, averageScore: 0, scoreTrend: 'flat', currentStreak: 0 }
    } as any);

    const result = await getSuggestedInterview('user-123');

    expect(result).toEqual(expect.objectContaining({
      status: 'incomplete_profile',
      missingFields: ['targetRole']
    }));
  });

  it('rejects an invalid resume ID that does not belong to user', async () => {
    vi.mocked(dashboardService.getDashboardMetadata).mockResolvedValue({
      rawProfile: { profile: { targetRole: 'Engineer' } },
      rawResumes: [], // User has no resumes
      activeResume: null,
      recentInterviews: [],
      rawReports: [],
      stats: { completedInterviews: 0, averageScore: 0, scoreTrend: 'flat', currentStreak: 0 }
    } as any);

    await expect(getSuggestedInterview('user-123', { resumeId: 'hacker-resume' }))
      .rejects
      .toThrow('Unauthorized: Resume does not belong to the user or not found');
  });

  it('handles multiple resumes and selects the provided one', async () => {
    vi.mocked(dashboardService.getDashboardMetadata).mockResolvedValue({
      rawProfile: { profile: { targetRole: 'Engineer' } },
      rawResumes: [{ id: 'resume-1' }, { id: 'resume-2' }],
      activeResume: { id: 'resume-1', hasAnalysis: false },
      recentInterviews: [],
      rawReports: [],
      stats: { completedInterviews: 0, averageScore: 0, scoreTrend: 'flat', currentStreak: 0 }
    } as any);

    const result = await getSuggestedInterview('user-123', { resumeId: 'resume-2' });

    expect(result).toHaveProperty('resumeId', 'resume-2');
  });

  it('selects fallback experience level for unknown values', async () => {
    vi.mocked(dashboardService.getDashboardMetadata).mockResolvedValue({
      rawProfile: { profile: { targetRole: 'Engineer', experienceLevel: 'InvalidLevel' } },
      rawResumes: [],
      activeResume: null,
      recentInterviews: [],
      rawReports: [],
      stats: { completedInterviews: 0, averageScore: 0, scoreTrend: 'flat', currentStreak: 0 }
    } as any);

    const result = await getSuggestedInterview('user-123');

    expect(result).toHaveProperty('experienceLevel', 'Mid'); // Fallback logic
  });
});
