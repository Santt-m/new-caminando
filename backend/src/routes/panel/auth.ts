import { Router, type Response } from 'express';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { Session } from '../../models/Session.js';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { success, error } from '../../utils/response.js';
import { requireAdmin } from '../../middlewares/auth.js';

const ADMIN_REFRESH_COOKIE = 'adminRefresh';
const ADMIN_ACCESS_COOKIE = 'adminAccess';

const createAccessToken = (userId: string, sessionId: string) =>
  jwt.sign({ sub: userId, sessionId, role: 'admin' }, env.jwtSecret, { expiresIn: '30m' });

const createRefreshToken = (userId: string, sessionId: string, deviceId: string, refreshTokenId: string) =>
  jwt.sign({ sub: userId, sessionId, deviceId, jti: refreshTokenId }, env.refreshSecret, { expiresIn: '7d' });

const clearAdminCookies = (res: Response) => {
  // Limpiar cookies en todos los paths posibles para evitar conflictos
  res.clearCookie(ADMIN_ACCESS_COOKIE, { path: '/' });
  res.clearCookie(ADMIN_REFRESH_COOKIE, { path: '/' });
  res.clearCookie(ADMIN_ACCESS_COOKIE, { path: '/panel' });
  res.clearCookie(ADMIN_REFRESH_COOKIE, { path: '/panel' });
};

const setAdminCookies = (res: Response, access: string, refresh: string) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: (env.nodeEnv === 'production' ? 'none' : 'lax') as 'none' | 'lax', // Must be 'none' for cross-site (Vercel -> Railway)
    secure: env.nodeEnv === 'production', // Must be true if sameSite is 'none'
    path: '/'
  };
  res.cookie(ADMIN_ACCESS_COOKIE, access, cookieOptions);
  res.cookie(ADMIN_REFRESH_COOKIE, refresh, cookieOptions);

};

const ensureAdminUser = async () => {
  const existing = await User.findOne({ email: env.adminEmail, role: 'admin' });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  return User.create({ email: env.adminEmail, name: 'Admin', passwordHash, role: 'admin' });
};

export const adminAuthRouter = Router();

adminAuthRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, deviceId } = req.body as { email?: string; password?: string; deviceId?: string };
    if (!email || !password || !deviceId) {
      return error(res, 'Missing fields', 400);
    }

    // Strategy 1: Strickland ENV admin credentials (SUPER ADMIN)
    const isEnvAdmin = email === env.adminEmail && password === env.adminPassword;

    let admin;

    if (isEnvAdmin) {
      // Login with ENV credentials - ensure user exists in DB for ID consistency
      // BUT do not check DB password. ENV is the source of truth.
      admin = await ensureAdminUser();

      // If the admin needs unrelated updates (e.g. accidentally set to inactive), force active
      if (!admin.isActive) {
        admin.isActive = true;
        await admin.save();
      }
    } else {
      // Strategy 2: Normal Admin (stored in DB)
      admin = await User.findOne({ email, role: 'admin', isActive: true });

      if (!admin) {
        return error(res, 'Invalid credentials or insufficient permissions', 401);
      }

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        return error(res, 'Invalid credentials', 401);
      }
    }

    const refreshTokenId = randomUUID();
    const session = await Session.findOneAndUpdate(
      { userId: admin._id, deviceId },
      { refreshTokenId, userAgent: req.headers['user-agent'] ?? 'unknown', ip: req.ip, revokedAt: null },
      { upsert: true, new: true }
    );

    const accessToken = createAccessToken(admin._id.toString(), session._id.toString());
    const refreshToken = createRefreshToken(admin._id.toString(), session._id.toString(), deviceId, refreshTokenId);
    setAdminCookies(res, accessToken, refreshToken);


    return success(res, { admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role, permissions: ['*'] } });
  })
);

adminAuthRouter.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const admin = await User.findById(req.userId);
    if (!admin) {
      return error(res, 'Admin not found', 404);
    }

    return success(res, { id: admin._id, email: admin.email, name: admin.name, role: admin.role, permissions: ['*'] });
  })
);

adminAuthRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[ADMIN_REFRESH_COOKIE];
    if (!token) {
      return error(res, 'Unauthorized', 401);
    }

    try {
      const payload = jwt.verify(token, env.refreshSecret) as {
        sub: string;
        sessionId: string;
        deviceId: string;
        jti: string;
      };

      const session = await Session.findById(payload.sessionId);
      if (!session || session.revokedAt) {
        return error(res, 'Unauthorized', 401);
      }

      if (session.deviceId !== payload.deviceId || session.refreshTokenId !== payload.jti) {
        return error(res, 'Unauthorized', 401);
      }

      const newRefreshTokenId = randomUUID();
      session.refreshTokenId = newRefreshTokenId;
      await session.save();

      const access = createAccessToken(payload.sub, session._id.toString());
      const refresh = createRefreshToken(payload.sub, session._id.toString(), payload.deviceId, newRefreshTokenId);

      setAdminCookies(res, access, refresh);
      return success(res, { accessToken: access });
    } catch {
      return error(res, 'Unauthorized', 401);
    }
  })
);

adminAuthRouter.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    clearAdminCookies(res);
    return success(res, null, 'Logged out successfully');
  })
);
