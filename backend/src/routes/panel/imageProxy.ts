import { Router, Request, Response } from 'express';
import { ImageProxyConfig } from '../../models/ImageProxyConfig.js';
import { ImageTrackingService } from '../../services/imageTracking.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

/**
 * GET /panel/cloudinary/proxy/config
 * Obtener configuración del proxy
 */
router.get('/config', asyncHandler(async (_req: Request, res: Response) => {
    const config = await ImageProxyConfig.getConfig();
    
    res.json({
        success: true,
        data: config
    });
}));

/**
 * PUT /panel/cloudinary/proxy/config
 * Actualizar configuración del proxy
 */
router.put('/config', asyncHandler(async (req: Request, res: Response) => {
    const config = await ImageProxyConfig.getConfig();
    
    // Actualizar campos permitidos
    const allowedFields = [
        'trackingEnabled',
        'cacheEnabled',
        'rateLimitEnabled',
        'hotlinkProtectionEnabled',
        'cacheTTL',
        'cacheMaxSize',
        'rateLimitPerMinute',
        'rateLimitPerHour',
        'rateLimitPerDay',
        'allowedDomains',
        'allowEmptyReferer',
        'blacklistedIPs',
        'whitelistedIPs',
        'autoBlockThreshold',
        'autoBlockEnabled',
        'alertsEnabled',
        'alertEmail',
        'alertWebhook',
        'alertThresholdRequests',
        'alertThresholdUniqueIPs',
        'retentionDays',
        'isActive'
    ];
    
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            (config as unknown as Record<string, unknown>)[field] = req.body[field];
        }
    });
    
    await config.save();
    
    res.json({
        success: true,
        message: 'Configuración actualizada',
        data: config
    });
}));

/**
 * POST /panel/cloudinary/proxy/config/block-ip
 * Bloquear una IP
 */
router.post('/config/block-ip', asyncHandler(async (req: Request, res: Response) => {
    const { ip, reason } = req.body;
    
    if (!ip) {
        return res.status(400).json({
            success: false,
            error: 'IP requerida'
        });
    }
    
    const config = await ImageProxyConfig.getConfig();
    await config.blockIP(ip, reason);
    
    res.json({
        success: true,
        message: `IP ${ip} bloqueada`,
        data: config
    });
}));

/**
 * POST /panel/cloudinary/proxy/config/unblock-ip
 * Desbloquear una IP
 */
router.post('/config/unblock-ip', asyncHandler(async (req: Request, res: Response) => {
    const { ip } = req.body;
    
    if (!ip) {
        return res.status(400).json({
            success: false,
            error: 'IP requerida'
        });
    }
    
    const config = await ImageProxyConfig.getConfig();
    await config.unblockIP(ip);
    
    res.json({
        success: true,
        message: `IP ${ip} desbloqueada`,
        data: config
    });
}));

/**
 * GET /panel/cloudinary/proxy/stats
 * Obtener estadísticas globales del proxy
 */
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
    const globalStats = await ImageTrackingService.getGlobalStats();
    
    res.json({
        success: true,
        data: globalStats
    });
}));

/**
 * GET /panel/cloudinary/proxy/top-images
 * Obtener imágenes más accedidas
 */
router.get('/top-images', asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const timeframe = (req.query.timeframe as 'hour' | 'day' | 'week' | 'all') || 'all';
    
    const topImages = await ImageTrackingService.getTopImages(limit, timeframe);
    
    res.json({
        success: true,
        data: topImages
    });
}));

/**
 * GET /panel/cloudinary/proxy/image-stats/:publicId
 * Obtener estadísticas de una imagen específica
 */
router.get('/image-stats/:publicId(*)', asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.params;
    
    const stats = await ImageTrackingService.getImageStats(publicId);
    
    if (!stats) {
        return res.status(404).json({
            success: false,
            error: 'No hay estadísticas para esta imagen'
        });
    }
    
    res.json({
        success: true,
        data: stats
    });
}));

/**
 * POST /panel/cloudinary/proxy/clean-old-events
 * Limpiar eventos antiguos
 */
router.post('/clean-old-events', asyncHandler(async (_req: Request, res: Response) => {
    await ImageTrackingService.cleanOldEvents();
    
    res.json({
        success: true,
        message: 'Eventos antiguos eliminados'
    });
}));

export default router;
