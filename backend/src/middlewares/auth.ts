import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
  const bearerToken = getBearer(req);
  const cookieToken = req.cookies?.adminAccess;

  const verifyToken = (token: string, source: string): AccessTokenPayload | null => {
    try {
      const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
      if (payload.role !== 'admin') {
        console.warn(`[Auth] ${source} token invalid: Not an admin role`);
        return null;
      }
      return payload;
    } catch (err: any) {
      console.warn(`[Auth] ${source} token verification failed: ${err.message}`);
      return null;
    }
  };

  // Intentar con Bearer primero
  let payload = bearerToken ? verifyToken(bearerToken, 'Bearer') : null;

  // Si falla Bearer, intentar con Cookie siempre
  if (!payload && cookieToken) {
    payload = verifyToken(cookieToken, 'Cookie');
  }

  if (!payload) {
    console.warn('[Auth] Access denied: No valid admin token found in Bearer or Cookie');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.userId = payload.sub;
  req.headers['x-session-id'] = payload.sessionId;
  next();
};

export const authenticateAdmin = requireAdmin;
