import { Router, type Request, type Response } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/response.js';
import { IPRule } from '../../models/IPRule.js';
import { redisClient } from '../../config/redis.js';
import { logAudit } from '../../utils/logger.js';

export const adminSecurityRouter = Router();
adminSecurityRouter.use(requireAdmin);

// Obtener todas las reglas
adminSecurityRouter.get(
    '/ip-rules',
    asyncHandler(async (_req: Request, res: Response) => {
        const rules = await IPRule.find().sort({ createdAt: -1 }).lean();
        res.json(ok(rules));
    })
);

// Agregar una regla
adminSecurityRouter.post(
    '/ip-rules',
    asyncHandler(async (req: Request, res: Response) => {
        const { ip, type, reason } = req.body as { ip: string; type: 'whitelist' | 'blacklist'; reason?: string };

        if (!ip || !type) {
            res.status(400).json({ message: 'IP and type are required' });
            return;
        }

        const rule = await IPRule.findOneAndUpdate(
            { ip },
            { type, reason, createdBy: req.userId },
            { upsert: true, new: true }
        );

        if (type === 'blacklist') {
            await redisClient.set(`security:blocked:${ip}`, 'true', { EX: 3600 * 24 });
        } else {
            await redisClient.del(`security:blocked:${ip}`);
        }

        logAudit(`IP Rule ${type} created for ${ip}`, 'ADMIN', { ip, type, reason }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

        res.json(ok(rule));
    })
);

// Eliminar una regla
adminSecurityRouter.delete(
    '/ip-rules/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const rule = await IPRule.findById(req.params.id);
        if (rule) {
            await redisClient.del(`security:blocked:${rule.ip}`);
            await rule.deleteOne();
            logAudit(`IP Rule deleted for ${rule.ip}`, 'ADMIN', { ip: rule.ip }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);
        }
        res.json(ok({ deleted: true }));
    })
);
