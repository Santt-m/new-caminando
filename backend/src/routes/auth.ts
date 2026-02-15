import { Router, type Response } from 'express';
import { randomUUID, randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { redisClient } from '../config/redis.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';
import { env } from '../config/env.js';
import { getIpInfo } from '../services/ipGuide.js';
import { analyticsService } from '../services/analyticsService.js';
import { emailService } from '../services/EmailService.js';
import { logAuth, logAudit, logWarn } from '../utils/logger.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from '../validations/auth.js';

const REFRESH_COOKIE = 'refreshToken';

const createAccessToken = (userId: string, sessionId: string, role: 'user' | 'admin') =>
  jwt.sign({ sub: userId, sessionId, role }, env.jwtSecret, { expiresIn: '15m' });

const createRefreshToken = (userId: string, sessionId: string, deviceId: string, refreshTokenId: string) =>
  jwt.sign({ sub: userId, sessionId, deviceId, jti: refreshTokenId }, env.refreshSecret, { expiresIn: '7d' });

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
  });
};

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const authRouter = Router();

authRouter.post(
  '/register',
  validateRequest(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name, deviceId } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      deviceId?: string;
    };

    if (!email || !password || !name || !deviceId) {
      return error(res, 'Missing fields', 400);
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return error(res, 'Email already in use', 409);
    }

    // Check for attribution
    let acquisition;

    // 1. Try Redis Session
    if (req.sessionId) {
      const attribution = await analyticsService.getAttributionFromSession(req.sessionId);
      if (attribution) {
        acquisition = attribution;
      }
    }

    // 2. Try Cookie Fallback (Long-term attribution)
    if (!acquisition && req.cookies?.attribution_ref) {
      acquisition = {
        source: req.cookies.attribution_ref,
        medium: 'referral-cookie',
        campaignDate: new Date()
      };
    }

    // 3. Register Conversion
    if (acquisition) {
      analyticsService.registerConversion(acquisition.source);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const verificationToken = randomBytes(32).toString('hex');
    const hashedVerificationToken = hashToken(verificationToken);

    const user = await User.create({
      email,
      name,
      passwordHash,
      role: 'user',
      acquisition,
      verificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 3600000), // 24 hours
      emailVerified: false // Explicitly set to false
    });

    const refreshTokenId = randomUUID();
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.ip ?? 'unknown';
    const ipInfo = await getIpInfo(ip);

    const session = await Session.create({
      userId: user._id,
      deviceId,
      refreshTokenId,
      ip,
      userAgent: req.headers['user-agent'] ?? 'unknown',
      ipInfo: ipInfo ?? undefined,
    });

    const accessToken = createAccessToken(user._id.toString(), session._id.toString(), 'user');
    const refreshToken = createRefreshToken(user._id.toString(), session._id.toString(), deviceId, refreshTokenId);

    setRefreshCookie(res, refreshToken);

    // Send verification email asynchronously
    emailService.sendVerificationEmail(user, verificationToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    logAuth('New user registered', { email: user.email, name: user.name, deviceId }, { ip, userAgent: req.headers['user-agent'] }, user._id.toString());

    return success(res, {
      accessToken,
      user,
    });
  })
);

authRouter.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password, deviceId } = req.body as {
      email?: string;
      password?: string;
      deviceId?: string;
    };

    if (!email || !password || !deviceId) {
      return error(res, 'Missing fields', 400);
    }

    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.ip ?? 'unknown';

    const user = await User.findOne({ email, role: 'user' });
    if (!user) {
      logWarn('Login Failed: User not found', 'AUTH', { email, deviceId }, { ip, userAgent: req.headers['user-agent'] });
      return error(res, 'Invalid credentials', 401);
    }

    if (!user.emailVerified) {
      logWarn('Login Blocked: Email not verified', 'AUTH', { userId: user._id, email }, { ip, userAgent: req.headers['user-agent'] });
      return error(res, 'Email not verified', 401, undefined, 'EMAIL_NOT_VERIFIED');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logWarn('Login Failed: Invalid password', 'AUTH', { userId: user._id, email }, { ip, userAgent: req.headers['user-agent'] });
      return error(res, 'Invalid credentials', 401);
    }

    const refreshTokenId = randomUUID();
    const ipInfo = await getIpInfo(ip);

    const session = await Session.findOneAndUpdate(
      { userId: user._id, deviceId },
      {
        refreshTokenId,
        ip,
        userAgent: req.headers['user-agent'] ?? 'unknown',
        ipInfo: ipInfo ?? undefined,
        lastUsedAt: new Date(),
        revokedAt: null,
      },
      { upsert: true, new: true }
    );

    const accessToken = createAccessToken(user._id.toString(), session._id.toString(), 'user');
    const refreshToken = createRefreshToken(user._id.toString(), session._id.toString(), deviceId, refreshTokenId);

    setRefreshCookie(res, refreshToken);

    logAuth('User logged in', { email: user.email, deviceId }, { ip, userAgent: req.headers['user-agent'] }, user._id.toString());

    return success(res, {
      accessToken,
      user,
    });
  })
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

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
      session.lastUsedAt = new Date();
      await session.save();

      const accessToken = createAccessToken(payload.sub, session._id.toString(), 'user');
      const refreshToken = createRefreshToken(payload.sub, session._id.toString(), payload.deviceId, newRefreshTokenId);

      setRefreshCookie(res, refreshToken);
      return success(res, { accessToken });
    } catch {
      return error(res, 'Unauthorized', 401);
    }
  })
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, env.refreshSecret) as { sessionId: string };
        await Session.findByIdAndUpdate(payload.sessionId, { revokedAt: new Date() });
      } catch {
        // ignore
      }
    }

    res.clearCookie(REFRESH_COOKIE, { path: '/' });

    logAuth('User logged out', {}, { ip: req.ip, userAgent: req.headers['user-agent'] });

    return success(res, null, 'Logged out successfully');
  })
);

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return error(res, 'Unauthorized', 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    return success(res, user);
  })
);

authRouter.patch(
  '/profile',
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return error(res, 'Unauthorized', 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await User.findByIdAndUpdate(payload.sub, req.body, { new: true });
    if (!user) {
      return error(res, 'User not found', 404);
    }

    logAudit('User profile updated', 'AUTH',
      { userId: user._id, changes: req.body },
      { ip: req.ip, userAgent: req.headers['user-agent'] },
      user._id.toString()
    );

    return success(res, { accessToken: token, user });
  })
);

authRouter.patch(
  '/preferences',
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return error(res, 'Unauthorized', 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await User.findByIdAndUpdate(
      payload.sub,
      { preferences: req.body },
      { new: true }
    );
    if (!user) {
      return error(res, 'User not found', 404);
    }

    logAudit('User preferences updated', 'AUTH',
      { userId: user._id, preferences: req.body },
      { ip: req.ip, userAgent: req.headers['user-agent'] },
      user._id.toString()
    );

    return success(res, { accessToken: token, user });
  })
);

authRouter.patch(
  '/dashboard-config',
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return error(res, 'Unauthorized', 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    logAudit('Dashboard config updated', 'AUTH',
      { userId: user._id, config: req.body },
      { ip: req.ip, userAgent: req.headers['user-agent'] },
      user._id.toString()
    );

    // Aquí faltaba la lógica de actualización real, asumo que se debe implementar o estaba omitida
    // Si 'req.body' tiene la config, deberíamos guardarla. 
    // Como User model no tiene dashboardConfig explícito en lo que vi antes, 
    // asumiré que preferences puede alojarlo o que User schema lo soporta.
    // Revisando el código original, NO hacía update, solo log y respuesta.
    // Mantendré el comportamiento original pero usando success().

    return success(res, { accessToken: token, user });
  })
);

authRouter.post(
  '/change-password',
  validateRequest(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return error(res, 'Unauthorized', 401);
    }

    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword) {
      return error(res, 'Missing fields', 400);
    }

    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return error(res, 'Invalid credentials', 401);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    logAuth('Password changed', { userId: user._id.toString() }, { ip: req.ip, userAgent: req.headers['user-agent'] }, user._id.toString());

    return success(res, null, 'Password changed successfully');
  })
);

authRouter.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email) {
      return error(res, 'Missing fields', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return success(res, { success: true }, 'If user exists, email sent');
    }

    const resetToken = randomBytes(32).toString('hex');
    const hashedResetToken = hashToken(resetToken);
    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    emailService.sendPasswordResetEmail(user, resetToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(err => {
      console.error('Failed to send password reset email:', err);
    });

    logAudit('Password Reset Requested', 'AUTH', { email }, { ip: req.ip, userAgent: req.headers['user-agent'] });

    // Sentinel: Multi-Account Reset Protection
    if (redisClient.isOpen) {
      try {
        const ip = req.ip ?? 'unknown';
        const targetSetKey = `security:sentinel:targets:${req.ip}`;
        await redisClient.sAdd(targetSetKey, email);
        await redisClient.expire(targetSetKey, 86400); // 24 hours window

        const uniqueTargetsCount = await redisClient.sCard(targetSetKey);

        if (uniqueTargetsCount > 3) {
          // Evento de Alto Riesgo: Enumeración detectada
          const riskKey = `security:sentinel:risk:${ip}`;
          const newRisk = await redisClient.incrBy(riskKey, 5); // Penalización fuerte (+5)
          await redisClient.expire(riskKey, 60 * 60 * 24);

          logWarn('Sentinel: High Risk Multi-Account Reset Detected', 'SECURITY',
            { ip, uniqueTargets: uniqueTargetsCount, currentRisk: newRisk },
            { ip, userAgent: req.headers['user-agent'] }
          );

          if (newRisk >= 10) {
            await redisClient.setEx(`security:blocked:${ip}`, 3600 * 24, 'true'); // Ban 24h
            logAudit('IP Banned by Sentinel (Multi-Reset Attack)', 'SECURITY',
              { ip, reason: 'Account Enumeration / Multi-Reset', targets: uniqueTargetsCount },
              { ip, userAgent: req.headers['user-agent'] }
            );
          }
        }
      } catch {
        // Fail silent
      }
    }

    return success(res, { success: true }, 'If user exists, email sent');
  })
);

authRouter.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      return error(res, 'Missing fields', 400);
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      logWarn('Password Reset Failed: Invalid or expired token', 'AUTH', { token: hashedToken }, { ip: req.ip, userAgent: req.headers['user-agent'] });
      return error(res, 'Invalid or expired token', 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logAuth('Password reset', { email: user.email }, { ip: req.ip, userAgent: req.headers['user-agent'] }, user._id.toString());

    return success(res, null, 'Password reset successfully');
  })
);

authRouter.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  asyncHandler(async (req, res) => {
    const { token } = req.body as { token?: string };
    if (!token) {
      return error(res, 'Missing token', 400);
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      verificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      logWarn('Email Verification Failed: Invalid or expired token', 'AUTH', { token: hashedToken }, { ip: req.ip, userAgent: req.headers['user-agent'] });
      return error(res, 'Invalid or expired token', 400);
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logAuth('Email verified', { email: user.email }, { ip: req.ip, userAgent: req.headers['user-agent'] }, user._id.toString());

    return success(res, null, 'Email verified successfully');
  })
);

authRouter.get(
  '/google',
  asyncHandler(async (_req, res) => {
    return error(res, 'Google auth not configured', 501);
  })
);
