import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errorSanitizer';

export interface ApiErrorResponse {
  error: string;
}

/**
 * Final centralized Express error-handling middleware.
 *
 * Enforces:
 * 1. Sanitization: Prevents leaking stack traces, provider payloads, database strings, or internal secrets to clients.
 * 2. HTTP status fidelity: Preserves status codes for known client/application errors (4xx).
 * 3. Safe fallback: Returns 500 with a generic message for unexpected internal errors.
 * 4. Observability: Logs sanitized error metadata correlated with requestId and userId.
 * 5. Safe delegation: Passes through to next if headers have already been sent.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(err);
  }

  const requestId = (req as any).requestId || (req.headers['x-request-id'] as string) || undefined;
  const userId = (req as any).auth?.userId || (typeof (req as any).auth === 'function' ? (req as any).auth()?.userId : undefined);

  // Extract HTTP status code
  let statusCode = 500;
  if (typeof err?.status === 'number' && err.status >= 400 && err.status < 600) {
    statusCode = err.status;
  } else if (typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600) {
    statusCode = err.statusCode;
  }

  // Detect body-parser SyntaxError for malformed JSON bodies
  const isMalformedJson = err instanceof SyntaxError && ('body' in err || statusCode === 400);
  if (isMalformedJson) {
    statusCode = 400;
  }

  // Determine sanitized client message
  let clientMessage = 'Internal Server Error';
  if (statusCode === 400) {
    clientMessage = isMalformedJson ? 'Malformed JSON payload in request body' : (typeof err?.message === 'string' && err.message.length <= 256 ? err.message : 'Bad Request');
  } else if (statusCode === 401) {
    clientMessage = typeof err?.message === 'string' && err.message.length <= 256 ? err.message : 'Unauthorized';
  } else if (statusCode === 403) {
    clientMessage = typeof err?.message === 'string' && err.message.length <= 256 ? err.message : 'Forbidden';
  } else if (statusCode === 404) {
    clientMessage = typeof err?.message === 'string' && err.message.length <= 256 ? err.message : 'Not Found';
  } else if (statusCode >= 400 && statusCode < 500) {
    clientMessage = typeof err?.message === 'string' && err.message.length <= 256 ? err.message : 'Client Error';
  }

  // Log sanitized error with requestId and path/method metadata
  logger.error({
    event: 'express.error',
    requestId,
    userId,
    statusCode,
    path: req.path,
    method: req.method,
    errorMessage: sanitizeErrorMessage(err),
    errorName: err?.name ? String(err.name) : undefined,
  });

  res.status(statusCode).json({ error: clientMessage });
};
