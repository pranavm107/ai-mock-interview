import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { generatePreparationAssessmentHandler, submitAssessmentHandler, getResultHandler } from '../../src/controllers/assessmentController';
import * as preparationAssessmentGenerationService from '../../src/services/preparationAssessmentGenerationService';
import * as assessmentSubmissionService from '../../src/services/assessmentSubmissionService';
import * as assessmentService from '../../src/services/assessmentService';

vi.mock('../../src/services/preparationAssessmentGenerationService');
vi.mock('../../src/services/assessmentSubmissionService');
vi.mock('../../src/services/assessmentService');

describe('assessmentController - generatePreparationAssessmentHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      body: {},
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
    await generatePreparationAssessmentHandler(mockRequest as Request, mockResponse as Response);
    
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized: Missing user identity' });
  });

  it('rejects invalid schema requests (e.g., missing topic)', async () => {
    mockRequest.body = {
      categorySlug: 'technical-mcqs',
      difficulty: 'HARD',
      questionCount: 10,
      mode: 'TIMED'
    };

    await generatePreparationAssessmentHandler(mockRequest as Request, mockResponse as Response);
    
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid request' }));
  });

  it('rejects unsupported category slug', async () => {
    mockRequest.body = {
      categorySlug: 'unsupported-slug',
      topic: 'React',
      difficulty: 'HARD',
      questionCount: 10,
      mode: 'TIMED'
    };

    await generatePreparationAssessmentHandler(mockRequest as Request, mockResponse as Response);
    
    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('calls generation service with valid payload and returns 201', async () => {
    const mockAssessmentResponse = {
      id: 'assess-123',
      status: 'READY',
      questions: []
    };

    vi.mocked(preparationAssessmentGenerationService.generatePreparationAssessment).mockResolvedValue(mockAssessmentResponse as any);

    mockRequest.body = {
      categorySlug: 'technical-mcqs',
      topic: 'React Hooks',
      difficulty: 'MEDIUM',
      questionCount: 15,
      mode: 'PRACTICE'
    };

    await generatePreparationAssessmentHandler(mockRequest as Request, mockResponse as Response);
    
    expect(preparationAssessmentGenerationService.generatePreparationAssessment).toHaveBeenCalledWith(
      'user-123',
      'technical-mcqs',
      'React Hooks',
      'MEDIUM',
      15,
      'PRACTICE'
    );
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockAssessmentResponse });
  });
});

describe('assessmentController - submitAssessmentHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      params: { assessmentId: 'assess-123' },
      body: { answers: [{ questionId: 'q1', selectedOptionId: 'A' }] },
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
    await submitAssessmentHandler(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  it('rejects malformed submission payloads', async () => {
    mockRequest.body = { answers: "invalid" };
    await submitAssessmentHandler(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('calls submitAssessment and returns 200 on success', async () => {
    const mockResult = {
      score: 1,
      percentage: 100
    };
    vi.mocked(assessmentSubmissionService.submitAssessment).mockResolvedValue(mockResult as any);

    await submitAssessmentHandler(mockRequest as Request, mockResponse as Response);
    
    expect(assessmentSubmissionService.submitAssessment).toHaveBeenCalledWith(
      'user-123',
      'assess-123',
      { answers: [{ questionId: 'q1', selectedOptionId: 'A' }] }
    );
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockResult });
  });

  it('handles Forbidden error by returning 403', async () => {
    vi.mocked(assessmentSubmissionService.submitAssessment).mockRejectedValue(new Error('Forbidden: Not owner'));
    await submitAssessmentHandler(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(403);
  });
});

describe('assessmentController - getResultHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      params: { assessmentId: 'assess-123' },
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
    await getResultHandler(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  it('rejects incomplete assessments', async () => {
    vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
      id: 'assess-123',
      userId: 'user-123',
      status: 'IN_PROGRESS'
    } as any);

    await getResultHandler(mockRequest as Request, mockResponse as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Assessment is not completed yet.' });
  });

  it('fetches result when completed by using submitAssessment empty answers', async () => {
    vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
      id: 'assess-123',
      userId: 'user-123',
      status: 'COMPLETED'
    } as any);

    const mockResult = { score: 5 };
    vi.mocked(assessmentSubmissionService.submitAssessment).mockResolvedValue(mockResult as any);

    await getResultHandler(mockRequest as Request, mockResponse as Response);
    
    expect(assessmentSubmissionService.submitAssessment).toHaveBeenCalledWith('user-123', 'assess-123', { answers: [] });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockResult });
  });
});

