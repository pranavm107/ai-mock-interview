import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { errorHandler } from '../../src/middleware/errorHandler';
import { sanitizeErrorMessage } from '../../src/utils/errorSanitizer';
import { logger } from '../../src/utils/logger';

describe('Error Sanitizer (server/src/utils/errorSanitizer.ts)', () => {
  it('redacts gsk_ and sk_ API key patterns', () => {
    const input = 'Groq connection failed for key gsk_abc1234567890def and OpenAI key sk_live_9876543210zyxw';
    const sanitized = sanitizeErrorMessage(input);

    expect(sanitized).not.toContain('gsk_abc1234567890def');
    expect(sanitized).not.toContain('sk_live_9876543210zyxw');
    expect(sanitized).toContain('Groq connection failed for key [REDACTED_API_KEY] and OpenAI key [REDACTED_API_KEY]');
  });

  it('redacts sk-... standard OpenAI key patterns', () => {
    const input = 'OpenAI API call failed with secret sk-1234567890abcdef12345678';
    const sanitized = sanitizeErrorMessage(input);

    expect(sanitized).not.toContain('sk-1234567890abcdef12345678');
    expect(sanitized).toContain('OpenAI API call failed with secret [REDACTED_API_KEY]');
  });

  it('redacts Bearer tokens in error messages', () => {
    const input = 'Auth verification failed with header Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid';
    const sanitized = sanitizeErrorMessage(input);

    expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid');
    expect(sanitized).toContain('Bearer [REDACTED_TOKEN]');
  });

  it('redacts passwords in URI connection strings', () => {
    const input = 'Failed to connect to postgres://app_user:SuperSecretPassword123@db.prod.internal:5432/interview_db';
    const sanitized = sanitizeErrorMessage(input);

    expect(sanitized).not.toContain('SuperSecretPassword123');
    expect(sanitized).toContain('postgres://app_user:[REDACTED_PASSWORD]@db.prod.internal:5432/interview_db');
  });

  it('redacts common sensitive key-value parameters (password, token, secret, api_key)', () => {
    const input = 'Request error with api_key=secret-key-123&password=myPassword99&token=auth-token-xyz&client_secret=secret-abc';
    const sanitized = sanitizeErrorMessage(input);

    expect(sanitized).not.toContain('secret-key-123');
    expect(sanitized).not.toContain('myPassword99');
    expect(sanitized).not.toContain('auth-token-xyz');
    expect(sanitized).not.toContain('secret-abc');
    expect(sanitized).toContain('api_key=[REDACTED]');
    expect(sanitized).toContain('password=[REDACTED]');
    expect(sanitized).toContain('token=[REDACTED]');
    expect(sanitized).toContain('client_secret=[REDACTED]');
  });

  it('preserves ordinary non-sensitive error messages for debugging', () => {
    const input = 'Query failed: table "interviews" column "durationMinutes" does not exist';
    const sanitized = sanitizeErrorMessage(new Error(input));

    expect(sanitized).toBe(input);
  });

  it('bounds message length safely', () => {
    const longMessage = 'A'.repeat(800);
    const sanitized = sanitizeErrorMessage(longMessage, 200);

    expect(sanitized.length).toBeLessThan(250);
    expect(sanitized).toContain('... [truncated]');
  });

  it('handles null, undefined, non-Error objects, and numbers without throwing', () => {
    expect(sanitizeErrorMessage(null)).toBe('Unknown error');
    expect(sanitizeErrorMessage(undefined)).toBe('Unknown error');
    expect(sanitizeErrorMessage('')).toBe('Empty error message');
    expect(sanitizeErrorMessage(404)).toBe('404');
    expect(sanitizeErrorMessage({ code: 'ERR_TIMEOUT' })).toBe('{"code":"ERR_TIMEOUT"}');
  });
});

describe('Express Centralized Error Handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const createApp = (routeHandler: (req: Request, res: Response, next: NextFunction) => void) => {
    const app = express();
    app.use((req, res, next) => {
      (req as any).requestId = 'test-request-id-999';
      next();
    });
    app.use(express.json());
    app.all('/test-route', routeHandler);
    app.use(errorHandler);
    return app;
  };

  it('handles known 400 client application errors and preserves error message', async () => {
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    const app = createApp((req, res, next) => {
      const err: any = new Error('Invalid question count provided');
      err.statusCode = 400;
      next(err);
    });

    const res = await request(app).get('/test-route');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid question count provided' });
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'express.error',
        statusCode: 400,
        requestId: 'test-request-id-999',
        errorMessage: 'Invalid question count provided',
      })
    );
  });

  it('handles known 401 Unauthorized errors', async () => {
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    const app = createApp((req, res, next) => {
      const err: any = new Error('Unauthorized');
      err.status = 401;
      next(err);
    });

    const res = await request(app).get('/test-route');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('handles known 404 Not Found errors', async () => {
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    const app = createApp((req, res, next) => {
      const err: any = new Error('Interview session not found');
      err.status = 404;
      next(err);
    });

    const res = await request(app).get('/test-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Interview session not found' });
  });

  it('handles malformed JSON payload bodies from express.json() safely with 400 Bad Request', async () => {
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    const app = express();
    app.use(express.json());
    app.post('/test-json', (req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    const res = await request(app)
      .post('/test-json')
      .set('Content-Type', 'application/json')
      .send('{"malformed": "json, missing closing brace');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Malformed JSON payload in request body' });
  });

  it('shields unexpected internal errors (500) and redacts secrets in server logs', async () => {
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    const sensitiveError = new Error(
      'Database query failed! postgres://user:super_secret_db_pass@db.internal:5432/db with key gsk_secret1234567890'
    );
    (sensitiveError as any).stack = 'Error: Database query failed!\n    at /internal/db.ts:12:34';

    const app = createApp((req, res, next) => {
      next(sensitiveError);
    });

    const res = await request(app).get('/test-route');

    // Client receives only generic HTTP 500
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });

    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain('super_secret_db_pass');
    expect(bodyStr).not.toContain('gsk_secret1234567890');
    expect(bodyStr).not.toContain('stack');

    // Server-side logging has REDACTED secrets
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'express.error',
        statusCode: 500,
        requestId: 'test-request-id-999',
        errorMessage: expect.not.stringContaining('super_secret_db_pass'),
      })
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: expect.not.stringContaining('gsk_secret1234567890'),
      })
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: expect.stringContaining('[REDACTED_PASSWORD]'),
      })
    );
  });

  it('delegates to next error handler when response headers have already been sent', async () => {
    const nextMock = vi.fn();

    const mockReq = {
      path: '/test',
      method: 'GET',
      headers: {},
    } as Request;

    const mockRes = {
      headersSent: true,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const testError = new Error('Late error after headers sent');

    errorHandler(testError, mockReq, mockRes, nextMock);

    expect(nextMock).toHaveBeenCalledWith(testError);
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('forwards rejected promises from async handlers wrapped in asyncHandler to centralized errorHandler', async () => {
    const { asyncHandler } = await import('../../src/utils/asyncHandler');
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    const app = express();
    app.get(
      '/async-error',
      asyncHandler(async () => {
        // Simulates async failure e.g. third party network drop or DB error
        throw new Error('Async database failure with key gsk_secretAsyncKey999');
      })
    );
    app.use(errorHandler);

    const res = await request(app).get('/async-error');

    // Centralized errorHandler catches the async failure and returns 500
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
  });
});
