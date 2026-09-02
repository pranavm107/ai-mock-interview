import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitAssessmentHandler } from '../../src/controllers/assessmentController';
import * as assessmentService from '../../src/services/assessmentService';
import { Request, Response } from 'express';

vi.mock('../../src/services/assessmentService', () => ({
  getAssessmentById: vi.fn(),
  getAssessmentQuestions: vi.fn(),
  updateAssessmentCompletion: vi.fn(),
  saveAssessmentResult: vi.fn()
}));

describe('submitAssessmentHandler API logic', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = {
      auth: { userId: 'user-123' },
      params: { assessmentId: 'test-123' },
      body: {
        answers: [
          { questionId: 'q1', selectedOptionId: 'opt1' }
        ]
      }
    } as any;
    res = {
      status: statusMock
    } as any;
  });

  it('should return 401 if missing auth', async () => {
    (req as any).auth = undefined;
    await submitAssessmentHandler(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
  });

  it('should return 400 for bad payload', async () => {
    req.body = { answers: [{ bad: 'field' }] };
    await submitAssessmentHandler(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid submission payload' }));
  });

  it('should evaluate and return 200 result successfully', async () => {
    const mockAssessment = {
      id: 'test-123', userId: 'user-123', status: 'READY', type: 'RESUME_MCQ',
      title: 'Test', questionCount: 1, createdAt: '', updatedAt: ''
    };
    const mockQuestions = [
      { id: 'q1', assessmentId: 'test-123', question: 'Q1', options: [], correctOptionId: 'opt1', explanation: 'E1', difficulty: 'EASY', skill: 'React' }
    ];

    vi.mocked(assessmentService.getAssessmentById).mockResolvedValue(mockAssessment as any);
    vi.mocked(assessmentService.getAssessmentQuestions).mockResolvedValue(mockQuestions as any);
    vi.mocked(assessmentService.updateAssessmentCompletion).mockResolvedValue();
    vi.mocked(assessmentService.saveAssessmentResult).mockResolvedValue();

    await submitAssessmentHandler(req as Request, res as Response);
    
    expect(assessmentService.updateAssessmentCompletion).toHaveBeenCalledWith('test-123', 1);
    expect(assessmentService.saveAssessmentResult).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock.mock.calls[0][0].success).toBe(true);
    expect(jsonMock.mock.calls[0][0].result.score).toBe(100);
  });
});
