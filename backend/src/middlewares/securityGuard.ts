import type { Request, Response, NextFunction } from 'express';
import { IPRule } from '../models/IPRule.js';
import { logAudit, logError } from '../utils/logger.js';
import { redisClient } from '../config/redis.js';

const getIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.ip ?? 'unknown';
};

export const securityGuard = async (req: Request, res: Response, next: NextFunction) => {
    const ip = getIp(req);
    const cacheKey = `security:blocked:${ip}`;

    // 1. Verificar en caché rápido (Solo si Redis está conectado)
    if (redisClient.isOpen) {
        try {
            const isCachedBlocked = await redisClient.get(cacheKey);
            if (isCachedBlocked === 'true') {
                res.status(403).json({ message: 'Access denied by Sentinel (Cached)' });
                return;
            }
        } catch (error) {
            logError('[Sentinel] Cache check failed:', error instanceof Error ? error : new Error(String(error)), 'NETWORK');
            // Fallback to DB check
        }
    }

    // 2. Si no está en caché, buscar en DB
    const rule = await IPRule.findOne({ ip }).lean();

    if (rule && rule.type === 'blacklist') {
        // Guardar en caché por 1 hora (Solo si Redis está conectado)
        if (redisClient.isOpen) {
            try {
                await redisClient.set(cacheKey, 'true', { EX: 3600 });
            } catch (error) {
                logError('[Sentinel] Cache set failed:', error instanceof Error ? error : new Error(String(error)), 'NETWORK');
            }
        }

        // Registrar el intento de acceso bloqueado
        try {
            if (redisClient.isOpen) {
                await redisClient.setEx(`blocked:${ip}`, 3600 * 24, 'suspicious');
            }

            logAudit('IP auto-blocked (too many unauthorized attempts)', 'NETWORK',
                { ip, path: req.originalUrl },
                { ip, userAgent: req.headers['user-agent'], path: req.originalUrl }
            );
        } catch (error) {
            logError('[Sentinel] Tracking failed:', error instanceof Error ? error : new Error(String(error)), 'NETWORK');
        }

        res.status(403).json({
            message: 'Access denied by Sentinel',
            reason: rule.reason || 'IP Blacklisted'
        });
        return;
    }

    next();
};
