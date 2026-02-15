import type { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

const getIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip ?? 'unknown';
};

export const trackRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      const duration = Date.now() - start;
      const ip = getIp(req);

      // Guardar latencia en Redis (Rolling Window de 50 items)
      try {
        if (redisClient.isOpen) {
          const cpuUsage = process.cpuUsage();
          const cpuLoad = (cpuUsage.user + cpuUsage.system) / 1000;

          const evLagStart = process.hrtime();
          await new Promise(resolve => setImmediate(resolve));
          const evLagDiff = process.hrtime(evLagStart);
          const evLag = (evLagDiff[0] * 1e3) + (evLagDiff[1] / 1e6);

          await redisClient.lPush('metrics:latency', JSON.stringify({
            path: req.originalUrl,
            latency: duration,
            cpuLoad,
            memoryRSS: process.memoryUsage().rss,
            eventLoopLag: evLag,
            timestamp: new Date().toISOString()
          }));
          await redisClient.lTrim('metrics:latency', 0, 49);
        }
      } catch {
        // Silencioso si Redis falla
      }

      // Incrementar contadores en Redis para métricas rápidas
      try {
        if (redisClient.isOpen) {
          const todayKey = new Date().toISOString().split('T')[0];
          const reqKey = `security:req:${todayKey}`;
          const blockKey = `security:block:${todayKey}`;

          await redisClient.incr(reqKey);
          await redisClient.expire(reqKey, 60 * 60 * 25);

          if (res.statusCode === 403) {
            await redisClient.incr(blockKey);
            await redisClient.expire(blockKey, 60 * 60 * 25);
          }
        }
      } catch {
        // Silencioso
      }

      // Usar el nuevo logger centralizado
      logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
        module: 'NETWORK',
        eventType: req.path.includes('/auth') ? 'LOGIN' : 'REQUEST',
        userId: req.userId,
        requestId: req.headers['x-request-id'] as string,
        duration,
        context: {
          ip,
          userAgent: req.headers['user-agent'] ?? 'unknown',
          path: req.originalUrl,
          method: req.method,
        },
        details: {
          status: res.statusCode,
          visitorId: req.visitorId,
          sessionId: req.sessionId,
          visitorState: res.statusCode >= 400 ? (res.statusCode === 403 ? 'blocked' : 'suspicious') : 'ok',
        }
      });
    } catch (error) {
      logger.error('[trackRequest] error', error, 'NETWORK');
    }
  });

  next();
};
