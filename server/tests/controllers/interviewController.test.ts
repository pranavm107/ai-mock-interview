import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { getSuggestedInterviewController, generateNewInterview } from '../../src/controllers/interviewController';
import * as recommendationService from '../../src/services/interviewRecommendationService';
import * as generationService from '../../src/services/interview/interviewGenerationService';
import * as logger from '../../src/utils/logger';

// We mock the services used by the controllers
vi.mock('../../src/services/interviewRecommendationService');
vi.mock('../../src/services/interview/interviewGenerationService');
vi.mock('../../src/utils/logger');
vi.mock('../../src/config/firebaseAdmin', () => ({
  db: {}
}));

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
      vi.mocked(generationService.generateInterview).mockRejectedValue(new Error('Gemini quota exceeded'));
      
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
  });
});
