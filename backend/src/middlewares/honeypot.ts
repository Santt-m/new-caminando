import type { Request, Response, NextFunction } from 'express';
import { IPRule } from '../models/IPRule.js';
import { logAudit, logError } from '../utils/logger.js';
import { redisClient } from '../config/redis.js';

// Lista de rutas comunes de ataque utilizadas por bots y scanners
const HONEYPOT_PATHS = [
    '/wp-admin',
    '/wp-login.php',
    '/.env',
    '/phpmyadmin',
    '/mysql-admin',
    '/config.php',
    '/setup.php',
    '/admin/config.php',
    '/admin/.env',
    '/api/.env',
    '/.git/config',
    '/composer.json',
    '/package.json',
    '/xmlrpc.php',
    '/backup.sql',
    '/database.sql',
    '/dump.sql',
];

const getIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.ip ?? 'unknown';
};

/**
 * Middleware de Honeypot: Captura intentos de acceso a rutas sensibles de bots
 * y bloquea la IP automáticamente de forma permanente.
 */
export const honeypot = async (req: Request, res: Response, next: NextFunction) => {
    const path = req.path.toLowerCase();

    // Verificar si la ruta actual está en la lista negra
    const isHoneypotTriggered = HONEYPOT_PATHS.some(hpPath =>
        path.includes(hpPath.toLowerCase())
    );

    if (isHoneypotTriggered) {
        const ip = getIp(req);

        try {
            // 1. Bloquear IP permanentemente en la DB
            await IPRule.findOneAndUpdate(
                { ip },
                {
                    type: 'blacklist',
                    reason: `Honeypot Triggered: Attempted access to ${req.originalUrl}`,
                    createdBy: 'Sentinel (Auto)'
                },
                { upsert: true }
            );

            // 2. Inyectar en caché de Redis para bloqueo inmediato (24h)
            if (redisClient.isOpen) {
                await redisClient.setEx(`blocked:${ip}`, 3600 * 24, 'honeypot');
            }

            // 3. Registrar el evento de amenaza usando el logger modular
            logAudit(`Honeypot Triggered`, 'NETWORK',
                { reason: `Attempted access to ${req.originalUrl}` },
                { ip, userAgent: req.headers['user-agent'], path: req.originalUrl }
            );

        } catch (error) {
            logError('[Honeypot] Error while blocking IP:', error instanceof Error ? error : new Error(String(error)), 'NETWORK');
        }

        // 4. Cortar la conexión inmediatamente
        res.status(403).json({
            message: 'Access denied by Sentinel (Trap Triggered)',
            id: 'HONEYPOT_BLOCK'
        });
        return;
    }

    next();
};
