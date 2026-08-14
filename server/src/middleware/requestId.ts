import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use existing header if provided by a proxy/gateway, otherwise generate one
  const existingId = req.headers['x-request-id'] as string;
  const requestId = existingId || uuidv4();
  
  // Attach to request object
  (req as any).requestId = requestId;
  
  // Also send it back in the response headers for client correlation
  res.setHeader('X-Request-Id', requestId);
  
  next();
};
