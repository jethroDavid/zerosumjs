import { type Request, type Response, type NextFunction } from 'express';

export const errorHandler = (err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ message });
};
