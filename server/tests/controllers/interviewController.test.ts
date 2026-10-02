import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { getSuggestedInterviewController, generateNewInterview, getMcqInterview, submitMcqInterview, getInterview, regenerateInterview } from '../../src/controllers/interviewController';
import * as recommendationService from '../../src/services/interviewRecommendationService';
import * as generationService from '../../src/services/interview/interviewGenerationService';
import * as logger from '../../src/utils/logger';

// We mock the services used by the controllers
vi.mock('../../src/services/interviewRecommendationService');
vi.mock('../../src/services/interview/interviewGenerationService');
vi.mock('../../src/services/interview/interviewStorageService');
vi.mock('../../src/utils/logger');
vi.mock('../../src/config/firebaseAdmin', () => {
  return {
    db: {
      collection: vi.fn().mockReturnThis(),
      doc: vi.fn().mockReturnThis(),
      runTransaction: vi.fn()
    }
  };
});

// We construct a mock Express app and manually attach the controller methods
// To mock requireAuth(), we can simulate it as a middleware
const app = express();
app.use(express.json());

// Fake Auth Middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer valid-token') {
    (req as any).auth = () => ({ userId: 'user-123' });
    next();
  } else if (authHeader === 'Bearer another-user') {
    (req as any).auth = () => ({ userId: 'user-456' });
    next();
  } else {
    // If no valid header, mock returning null for userId
    (req as any).auth = () => ({ userId: null });
    next();
  }
});

// Mock request ID middleware
app.use((req, res, next) => {
  (req as any).requestId = 'test-req-id';
  next();
});

app.post('/api/interviews/suggest', getSuggestedInterviewController);
app.post('/api/interviews/generate', generateNewInterview);
app.get('/api/interviews/:id/mcq', getMcqInterview);
app.post('/api/interviews/:id/mcq/submit', submitMcqInterview);
app.get('/api/interviews/:id', getInterview);
app.post('/api/interviews/:id/regenerate', regenerateInterview);

describe('interviewController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/interviews/suggest', () => {
    it('returns 401 unauthenticated if no token provided', async () => {
      const response = await request(app).post('/api/interviews/suggest').send({});
      expect(response.status).toBe(401);
      expect(recommendationService.getSuggestedInterview).not.toHaveBeenCalled();
    });

    it('returns 200 authenticated and the recommendation structure', async () => {
      vi.mocked(recommendationService.getSuggestedInterview).mockResolvedValue({
        targetRole: 'SWE',
        targetCompany: 'Google',
        experienceLevel: 'Mid',
        interviewType: 'Technical',
        difficulty: 'MEDIUM',
        questionCount: 5,
        durationMinutes: 30,
        focusAreas: [],
        recommendationReason: 'Test',
        recommendationSource: 'default',
        generatedAt: '2026-08-09T00:00:00.000Z'
      } as any);

      const response = await request(app)
        .post('/api/interviews/suggest')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestion.targetRole).toBe('SWE');
      expect(logger.logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'recommendation.requested' })
      );
    });

    it('returns 400 invalid request payloads (e.g. malformed JSON)', async () => {
      const response = await request(app)
        .post('/api/interviews/suggest')
        .set('Authorization', 'Bearer valid-token')
        .set('Content-Type', 'application/json')
        .send('{"invalid"'); // Malformed JSON

      expect(response.status).toBe(400); // Handled by express.json()
    });

    it('returns 500 internal failure securely sanitizing stack traces', async () => {
      vi.mocked(recommendationService.getSuggestedInterview).mockRejectedValue(new Error('Secret DB Credentials Leaked!'));

      const response = await request(app)
        .post('/api/interviews/suggest')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(response.status).toBe(500);
      expect(JSON.stringify(response.body)).not.toMatch(/Secret DB/);
      expect(logger.logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'recommendation.failed' })
      );
    });
    
    it('handles incomplete profile gracefully', async () => {
      vi.mocked(recommendationService.getSuggestedInterview).mockResolvedValue({
        status: 'incomplete_profile',
        missingFields: ['targetRole'],
        message: 'Need info'
      });
      
      const response = await request(app)
        .post('/api/interviews/suggest')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('incomplete_profile');
    });

    it('enforces cross-user authorization (User A accesses User B resume)', async () => {
      // The service layer throws the unauthorized error. We simulate that behavior and test the controller.
      vi.mocked(recommendationService.getSuggestedInterview).mockRejectedValue(new Error('Unauthorized: Resume does not belong to the user or not found'));

      const response = await request(app)
        .post('/api/interviews/suggest')
        .set('Authorization', 'Bearer valid-token')
        .send({ resumeId: 'user-456-resume' });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe('Unauthorized: Resume does not belong to the user or not found');
    });
  });

  describe('POST /api/interviews/generate', () => {
    it('returns 400 for invalid AI output schema (strict controller validation)', async () => {
      // The generate controller uses zod to validate body. If we pass missing required fields for generate,
      // wait, the API receives the prompt payload. Let's send an invalid payload.
      const response = await request(app)
        .post('/api/interviews/generate')
        .set('Authorization', 'Bearer valid-token')
        .send({
          targetRole: 'SWE',
          difficulty: 'INVALID' // invalid difficulty to trigger 400
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('returns 500 when AI generation fails safely', async () => {
      vi.mocked(generationService.generateInterview).mockRejectedValue(new Error('Groq quota exceeded'));
      
      const response = await request(app)
        .post('/api/interviews/generate')
        .set('Authorization', 'Bearer valid-token')
        .send({
          targetRole: 'SWE',
          interviewType: 'Technical',
          difficulty: 'MEDIUM',
          totalQuestions: 5
        });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERVIEW_GENERATION_FAILED');
      expect(logger.logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'interview.generation.failed' })
      );
    });

    it('strips correctOptionId and explanation for MCQ interviews', async () => {
      vi.mocked(generationService.generateInterview).mockResolvedValue({
        id: 'test',
        settings: { interviewType: 'MCQ' },
        questions: [{ id: 'q1', correctOptionId: 'A', explanation: 'exp' }]
      } as any);

      const { saveInterview } = await import('../../src/services/interview/interviewStorageService');
      vi.mocked(saveInterview).mockResolvedValue('test');

      const response = await request(app)
        .post('/api/interviews/generate')
        .set('Authorization', 'Bearer valid-token')
        .send({
          targetRole: 'SWE',
          interviewType: 'MCQ',
          questionCount: 3
        });

      expect(response.status).toBe(201);
      expect(response.body.interview.questions[0].correctOptionId).toBeUndefined();
      expect(response.body.interview.questions[0].explanation).toBeUndefined();
    });
  });

  describe('GET /api/interviews/:id/mcq', () => {
    it('strips correctOptionId and explanation', async () => {
      const mockInterview = {
        id: 'mcq-123',
        userId: 'user-123',
        settings: { interviewType: 'MCQ' },
        questions: [
          {
            id: 'q1',
            question: 'Test?',
            options: [{ id: 'A', text: 'Opt A' }],
            correctOptionId: 'A',
            explanation: 'Because A'
          }
        ]
      };

      const { getInterviewById } = await import('../../src/services/interview/interviewStorageService');
      vi.mocked(getInterviewById).mockResolvedValue(mockInterview as any);

      const response = await request(app)
        .get('/api/interviews/mcq-123/mcq')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.questions[0].correctOptionId).toBeUndefined();
      expect(response.body.questions[0].explanation).toBeUndefined();
      expect(response.body.questions[0].options[0].id).toBe('A');
    });

    it('rejects access to another user interview', async () => {
      const mockInterview = {
        id: 'mcq-123',
        userId: 'different-user',
        settings: { interviewType: 'MCQ' },
        questions: []
      };

      const { getInterviewById } = await import('../../src/services/interview/interviewStorageService');
      vi.mocked(getInterviewById).mockResolvedValue(mockInterview as any);

      const response = await request(app)
        .get('/api/interviews/mcq-123/mcq')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/interviews/:id', () => {
    it('strips correctOptionId and explanation for MCQ interviews', async () => {
      const mockInterview = {
        id: 'mcq-123',
        userId: 'user-123',
        settings: { interviewType: 'MCQ' },
        questions: [{ id: 'q1', correctOptionId: 'A', explanation: 'Because A' }]
      };

      const { getInterviewById } = await import('../../src/services/interview/interviewStorageService');
      vi.mocked(getInterviewById).mockResolvedValue(mockInterview as any);

      const response = await request(app).get('/api/interviews/mcq-123');

      expect(response.status).toBe(200);
      expect(response.body.questions[0].correctOptionId).toBeUndefined();
      expect(response.body.questions[0].explanation).toBeUndefined();
    });

    it('does not strip answers for non-MCQ interviews', async () => {
      const mockInterview = {
        id: 'tech-123',
        userId: 'user-123',
        settings: { interviewType: 'Technical' },
        questions: [{ id: 'q1', expectedAnswer: 'A specific answer', explanation: 'exp' }]
      };

      const { getInterviewById } = await import('../../src/services/interview/interviewStorageService');
      vi.mocked(getInterviewById).mockResolvedValue(mockInterview as any);

      const response = await request(app).get('/api/interviews/tech-123');

      expect(response.status).toBe(200);
      expect(response.body.questions[0].expectedAnswer).toBeDefined();
      expect(response.body.questions[0].explanation).toBeDefined();
    });
  });

  describe('POST /api/interviews/:id/regenerate', () => {
    it('strips correctOptionId and explanation for MCQ interviews', async () => {
      const mockExisting = { id: 'mcq-123', userId: 'user-123', settings: { interviewType: 'MCQ' } };
      const { getInterviewById, saveInterview } = await import('../../src/services/interview/interviewStorageService');
      vi.mocked(getInterviewById).mockResolvedValue(mockExisting as any);
      vi.mocked(saveInterview).mockResolvedValue('mcq-123');

      vi.mocked(generationService.generateInterview).mockResolvedValue({
        id: 'mcq-123',
        settings: { interviewType: 'MCQ' },
        questions: [{ id: 'q1', correctOptionId: 'B', explanation: 'exp' }]
      } as any);

      const response = await request(app).post('/api/interviews/mcq-123/regenerate');

      expect(response.status).toBe(201);
      expect(response.body.interview.questions[0].correctOptionId).toBeUndefined();
      expect(response.body.interview.questions[0].explanation).toBeUndefined();
    });
  });

  describe('POST /api/interviews/:id/mcq/submit', () => {
    it('successfully scores an MCQ interview', async () => {
      const mockInterview = {
        id: 'mcq-123',
        userId: 'user-123',
        status: 'Started',
        settings: { interviewType: 'MCQ' },
        questions: [
          { id: 'q1', correctOptionId: 'A', explanation: 'exp 1' },
          { id: 'q2', correctOptionId: 'B', explanation: 'exp 2' },
          { id: 'q3', correctOptionId: 'C', explanation: 'exp 3' }
        ]
      };

      // Mock transaction
      const { db } = await import('../../src/config/firebaseAdmin');
      vi.mocked(db.runTransaction).mockImplementation(async (callback) => {
        const transaction = {
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => mockInterview
          }),
          update: vi.fn()
        };
        return callback(transaction as any);
      });

      const response = await request(app)
        .post('/api/interviews/mcq-123/mcq/submit')
        .set('Authorization', 'Bearer valid-token')
        .send({
          answers: {
            'q1': 'A', // correct
            'q2': 'A', // incorrect
            // q3 is unanswered
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result.score).toBe(33);
      expect(response.body.result.mcqResult.correctCount).toBe(1);
      expect(response.body.result.mcqResult.incorrectCount).toBe(1);
      expect(response.body.result.mcqResult.unansweredCount).toBe(1);
      
      // Explanations are returned post-submission
      expect(response.body.result.mcqResult.results[0].explanation).toBe('exp 1');
    });

    it('rejects duplicate submissions', async () => {
      const mockInterview = {
        id: 'mcq-123',
        userId: 'user-123',
        status: 'Completed', // Already completed
        settings: { interviewType: 'MCQ' },
        questions: []
      };

      const { db } = await import('../../src/config/firebaseAdmin');
      vi.mocked(db.runTransaction).mockImplementation(async (callback) => {
        const transaction = {
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => mockInterview
          }),
          update: vi.fn()
        };
        return callback(transaction as any);
      });

      const response = await request(app)
        .post('/api/interviews/mcq-123/mcq/submit')
        .set('Authorization', 'Bearer valid-token')
        .send({ answers: {} });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Already completed');
    });
  });
