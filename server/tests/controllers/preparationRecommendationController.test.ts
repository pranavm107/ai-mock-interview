import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { getRecommendationsHandler } from '../../src/controllers/preparationRecommendationController';
import * as recommendationService from '../../src/services/preparationRecommendationService';

vi.mock('../../src/services/preparationRecommendationService');

describe('preparationRecommendationController', () => {
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
    await getRecommendationsHandler(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  it('fetches recommendations for the authenticated user', async () => {
    const mockResult = {
      hasEnoughData: true,
      recommendation: { summary: "Good job." } as any
    };
    vi.mocked(recommendationService.getPreparationRecommendations).mockResolvedValue(mockResult);

    await getRecommendationsHandler(mockRequest as Request, mockResponse as Response);

    expect(recommendationService.getPreparationRecommendations).toHaveBeenCalledWith('user-123');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockResult });
  });

  it('handles empty data properly without failing', async () => {
    const mockResult = {
      hasEnoughData: false,
      recommendation: null
    };
    vi.mocked(recommendationService.getPreparationRecommendations).mockResolvedValue(mockResult);

    await getRecommendationsHandler(mockRequest as Request, mockResponse as Response);

    expect(recommendationService.getPreparationRecommendations).toHaveBeenCalledWith('user-123');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockResult });
  });

  it('handles errors gracefully', async () => {
    vi.mocked(recommendationService.getPreparationRecommendations).mockRejectedValue(new Error('AI failed'));

    await getRecommendationsHandler(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to retrieve recommendations' });
  });
});
