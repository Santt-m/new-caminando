import { Router, Request, Response, NextFunction } from 'express';
import { CleanupService } from '../services/CleanupService.js';
import logger, { logAudit, logError } from '../utils/logger.js';

export const cronRouter = Router();

// Middleware to verify cron secret
const verifyCronSecret = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Cron Secret' });
    }
    next();
};

cronRouter.get('/cleanup', verifyCronSecret, async (_req: Request, res: Response) => {

    try {
        logger.info('[Cron] Starting cleanup...', { module: 'SYSTEM' });
        const result = await CleanupService.executeCleanup();

        if (result.success) {
            logger.info('[Cron] Cleanup completed', { module: 'SYSTEM', details: result });
            res.json({ success: true, message: 'Cleanup completed', data: result });

            logAudit('Cron Cleanup success', 'SYSTEM', { metricsDeleted: result.metricsDeleted, activityDeleted: result.activityDeleted });
        } else {
            logError('[Cron] Cleanup partial failure', new Error(result.error || 'Partial failure'), 'SYSTEM');
            res.status(500).json({ error: 'Cleanup failed', details: result.error });
        }
    } catch (error) {
        logError('[Cron] Cleanup failed', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
        res.status(500).json({ error: 'Cleanup failed' });
    }
});
