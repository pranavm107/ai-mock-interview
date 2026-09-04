import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssessmentHandler, submitAssessmentHandler, getAssessmentResultHandler, getAssessmentHistoryHandler } from '../../src/controllers/assessmentController';
import * as assessmentService from '../../src/services/assessmentService';
import { Request, Response } from 'express';

vi.mock('../../src/services/assessmentService', () => ({
  getAssessmentById: vi.fn(),
  getAssessmentQuestions: vi.fn(),
  toUserSafeQuestion: vi.fn((q) => {
    const { correctOptionId, explanation, ...rest } = q;
    return rest;
  }),
  updateAssessmentCompletion: vi.fn(),
  saveAssessmentResultAtomically: vi.fn().mockResolvedValue(true),
  getAssessmentResult: vi.fn(),
  getUserAssessments: vi.fn()
}));

describe('Assessment Security Verification', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = {
      auth: { userId: 'valid-user-123' },
      params: { assessmentId: 'test-123' },
      body: {}
    } as any;
    res = {
      status: statusMock
    } as any;
  });

  describe('Cross-User Access Protection', () => {
    it('should reject GET /api/assessments/:id if user is not the owner', async () => {
      vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
        id: 'test-123',
        userId: 'different-user-456',
        status: 'READY'
      } as any);

      await getAssessmentHandler(req as Request, res as Response);
      
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Forbidden: Assessment does not belong to the user' });
    });

    it('should reject POST /api/assessments/:id/submit if user is not the owner', async () => {
      vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
        id: 'test-123',
        userId: 'different-user-456',
        status: 'READY'
      } as any);
      req.body = { answers: [] };

      await submitAssessmentHandler(req as Request, res as Response);
      
      expect(statusMock).toHaveBeenCalledWith(403);
    });
  });

  describe('Correct Answer Protection', () => {
    it('should never leak correctOptionId or explanation in GET /api/assessments/:id before completion', async () => {
      vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
        id: 'test-123',
        userId: 'valid-user-123',
        status: 'READY'
      } as any);

      vi.mocked(assessmentService.getAssessmentQuestions).mockResolvedValue([
        {
          id: 'q1',
          question: 'What is 2+2?',
          options: [],
          correctOptionId: 'opt4',
          explanation: 'Math logic',
          difficulty: 'EASY',
          assessmentId: 'test-123'
        }
      ] as any);

      await getAssessmentHandler(req as Request, res as Response);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      const returnedQuestions = jsonMock.mock.calls[0][0].questions;
      expect(returnedQuestions).toHaveLength(1);
      
      // Security assertions
      expect(returnedQuestions[0]).not.toHaveProperty('correctOptionId');
      expect(returnedQuestions[0]).not.toHaveProperty('explanation');
      expect(returnedQuestions[0].id).toBe('q1');
    });
  });

  describe('Duplicate Submission Prevention', () => {
    it('should reject submission if assessment is already COMPLETED', async () => {
      vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
        id: 'test-123',
        userId: 'valid-user-123',
        status: 'COMPLETED'
      } as any);
      req.body = { answers: [] };

      await submitAssessmentHandler(req as Request, res as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Cannot submit assessment in status: COMPLETED' });
    });
  });

  describe('Result Retrieval Security', () => {
    it('should reject GET /api/assessments/:id/result if user is not the owner', async () => {
      vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
        id: 'test-123',
        userId: 'different-user-456',
        status: 'COMPLETED'
      } as any);

      await getAssessmentResultHandler(req as Request, res as Response);
      
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('should reject GET /api/assessments/:id/result if assessment is not COMPLETED', async () => {
      vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
        id: 'test-123',
        userId: 'valid-user-123',
        status: 'READY'
      } as any);

      await getAssessmentResultHandler(req as Request, res as Response);
      
      expect(statusMock).toHaveBeenCalledWith(409);
    });

    it('should return result if user is owner and assessment is COMPLETED', async () => {
      vi.mocked(assessmentService.getAssessmentById).mockResolvedValue({
        id: 'test-123',
        userId: 'valid-user-123',
        status: 'COMPLETED'
      } as any);
      vi.mocked(assessmentService.getAssessmentResult).mockResolvedValue({
        score: 100
      } as any);

      await getAssessmentResultHandler(req as Request, res as Response);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        assessmentId: 'test-123',
        result: { score: 100 }
      });
    });
  });

  describe('History Retrieval Security', () => {
    it('should fetch history for the authenticated user only', async () => {
      req.query = { limit: '5' };
      vi.mocked(assessmentService.getUserAssessments).mockResolvedValue({
        assessments: [],
        nextCursor: null
      });

      await getAssessmentHistoryHandler(req as Request, res as Response);

      expect(assessmentService.getUserAssessments).toHaveBeenCalledWith('valid-user-123', expect.objectContaining({ limit: 5 }));
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });
});
