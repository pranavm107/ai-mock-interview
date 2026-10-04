import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { getAnalyticsHandler } from '../../src/controllers/assessmentAnalyticsController';
import * as assessmentAnalyticsService from '../../src/services/assessmentAnalyticsService';

vi.mock('../../src/services/assessmentAnalyticsService');

describe('assessmentAnalyticsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      auth: () => ({ userId: 'user-123' })
    } as any;
    
    mockResponse = {
      status: statusMock,
      json: jsonMock
    } as Partial<Response>;

    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    mockRequest.auth = () => null;
    await getAnalyticsHandler(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  it('fetches analytics for the authenticated user', async () => {
    const mockAnalytics = {
      overall: { totalCompleted: 5 },
      categories: [],
      topics: [],
      trend: []
    };
    vi.mocked(assessmentAnalyticsService.getUserAnalytics).mockResolvedValue(mockAnalytics as any);

    await getAnalyticsHandler(mockRequest as Request, mockResponse as Response);

    expect(assessmentAnalyticsService.getUserAnalytics).toHaveBeenCalledWith('user-123');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockAnalytics });
  });

  it('handles empty analytics gracefully', async () => {
    const emptyAnalytics = {
      overall: { totalCompleted: 0 },
      categories: [],
      topics: [],
      trend: []
    };
    vi.mocked(assessmentAnalyticsService.getUserAnalytics).mockResolvedValue(emptyAnalytics as any);

    await getAnalyticsHandler(mockRequest as Request, mockResponse as Response);

    expect(assessmentAnalyticsService.getUserAnalytics).toHaveBeenCalledWith('user-123');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: emptyAnalytics });
  });
});
