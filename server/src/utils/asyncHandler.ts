import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Type-safe wrapper for asynchronous Express route handlers and middleware.
 *
 * In Express 4.x, unhandled Promise rejections in async handlers are not
 * forwarded to Express error-handling middleware automatically. This wrapper
 * catches any rejected Promise and forwards the error to next(err).
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
