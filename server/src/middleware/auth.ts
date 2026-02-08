import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';

type AuthPayload = JwtPayload & { sub?: string };

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    if (!payload.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
