import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { redisClient } from '../config/redis.js';
import { logAudit, logWarn } from '../utils/logger.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: 1000, // Aumentado para desarrollo (era env.rateLimitMax)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 10, // 10 intentos por hora
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: async (req, res, _next, options) => {
    const ip = req.ip ?? 'unknown';

    // Sentinel Integration: Risk & Ban
    if (redisClient.isOpen) {
      try {
        // 1. Aumentar riesgo
        const riskKey = `security:sentinel:risk:${ip}`;
        const currentRisk = await redisClient.incr(riskKey);
        await redisClient.expire(riskKey, 60 * 60 * 24); // 24h retention

        // Log Warn if repeated attempts (Risk > 3) but not yet banned
        if (currentRisk > 3 && currentRisk <= 10) {
          logWarn('Rate Limit Warning: High Activity', 'SECURITY', { ip, riskScore: currentRisk }, { ip, userAgent: req.headers['user-agent'] });
        }

        // 2. Aplicar Baneo Inmediato (Política: >10 intentos = Ban)
        // Guardamos el bloqueo en la lista negra de Sentinel
        await redisClient.setEx(`security:blocked:${ip}`, 3600 * 24, 'true'); // Bloqueo 24h

        logAudit('IP Banned by Sentinel (Rate Limit Exceeded)', 'SECURITY',
          { ip, reason: 'Excessive Auth Attempts', limit: 10 },
          { ip, userAgent: req.headers['user-agent'] }
        );

      } catch {
        // Fail silent
      }
    }

    res.status(options.statusCode).json({
      message: 'Too many attempts. Access denied by Sentinel Protection.',
      retryAfter: Math.ceil(options.windowMs / 1000)
    });
  }
});
