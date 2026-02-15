import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  sub: string;
  sessionId: string;
  role: 'user' | 'admin';
}

const getBearer = (req: Request) => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer') return null;
  return token;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = getBearer(req);
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    req.userId = payload.sub;
    req.headers['x-session-id'] = payload.sessionId;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = getBearer(req) || req.cookies?.adminAccess;



  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    if (payload.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    req.userId = payload.sub;
    req.headers['x-session-id'] = payload.sessionId;
    req.headers['x-session-id'] = payload.sessionId;
    next();
  } catch {

    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const authenticateAdmin = requireAdmin;
