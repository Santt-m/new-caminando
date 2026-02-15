import { ImageMetric, IImageMetric } from '../models/ImageMetric.js';
import { ImageProxyConfig, IImageProxyConfig } from '../models/ImageProxyConfig.js';
import { redisClient } from '../config/redis.js';
import logger, { logError } from '../utils/logger.js';

interface TrackingData {
    ip: string;
    userAgent?: string;
    referer?: string;
    cacheHit?: boolean;
    responseTime?: number;
}

/**
 * Servicio para tracking y análisis de imágenes
 */
export class ImageTrackingService {

    /**
     * Registra un acceso a una imagen
     */
    static async trackImageAccess(
        publicId: string,
        type: 'view' | 'download' | 'proxy',
        data: TrackingData
    ): Promise<IImageMetric | null> {
        try {
            const config = await ImageProxyConfig.getConfig();

            // Si el tracking no está habilitado, no hacer nada
            if (!config.trackingEnabled) {
                return null;
            }

            // Buscar o crear métrica
            let metric = await ImageMetric.findOne({ publicId });

            if (!metric) {
                // Si no existe, crear una nueva
                metric = new ImageMetric({
                    publicId,
                    resourceType: 'image',
                    format: publicId.split('.').pop() || 'unknown',
                    url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`,
                    bytes: 0,
                    width: 0,
                    height: 0
                });
            }

            // Registrar el acceso
            await metric.recordAccess(type, data);

            // Verificar si la IP es sospechosa
            await this.checkSuspiciousActivity(metric, data.ip, config);

            return metric;
        } catch (error) {
            logError('Error tracking image access:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
            return null;
        }
    }

    /**
     * Verifica actividad sospechosa y bloquea IPs si es necesario
     */
    static async checkSuspiciousActivity(
        metric: IImageMetric,
        ip: string,
        config: IImageProxyConfig
    ): Promise<void> {
        if (!config.autoBlockEnabled) {
            return;
        }

        // Contar requests de esta IP en la última hora
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentRequests = metric.events.filter(
            (event: { ip: string; timestamp: Date }) => event.ip === ip && event.timestamp > oneHourAgo
        ).length;

        // Si excede el umbral, marcar como sospechosa y bloquear
        if (recentRequests >= config.autoBlockThreshold) {
            if (!metric.suspiciousIPs.includes(ip)) {
                metric.suspiciousIPs.push(ip);
                await metric.save();
            }

            // Bloquear IP globalmente
            await config.blockIP(ip, `Auto-blocked: ${recentRequests} requests in 1 hour for image ${metric.publicId}`);

            // Enviar alerta si está habilitada
            if (config.alertsEnabled) {
                await this.sendAlert({
                    type: 'IP_BLOCKED',
                    ip,
                    reason: `Auto-blocked: ${recentRequests} requests in 1 hour`,
                    imagePublicId: metric.publicId,
                    config
                });
            }
        }
    }

    /**
     * Verifica rate limiting para una IP
     */
    static async checkRateLimit(ip: string): Promise<{ allowed: boolean; reason?: string }> {
        try {
            const config = await ImageProxyConfig.getConfig();

            // Si rate limiting no está habilitado, permitir
            if (!config.rateLimitEnabled) {
                return { allowed: true };
            }

            // Fail-open if Redis is not connected
            if (!redisClient.isOpen) {
                return { allowed: true };
            }

            // Si la IP está en whitelist, permitir
            if (config.whitelistedIPs.includes(ip)) {
                return { allowed: true };
            }

            // Si la IP está bloqueada, denegar
            if (config.blacklistedIPs.includes(ip)) {
                return { allowed: false, reason: 'IP is blacklisted' };
            }

            // Verificar rate limit usando Redis
            const minuteKey = `ratelimit:${ip}:minute`;
            const hourKey = `ratelimit:${ip}:hour`;
            const dayKey = `ratelimit:${ip}:day`;

            const [minuteCount, hourCount, dayCount] = await Promise.all([
                redisClient.get(minuteKey),
                redisClient.get(hourKey),
                redisClient.get(dayKey)
            ]);

            // Verificar límites
            if (minuteCount && parseInt(minuteCount) >= config.rateLimitPerMinute) {
                return { allowed: false, reason: 'Rate limit exceeded (per minute)' };
            }

            if (hourCount && parseInt(hourCount) >= config.rateLimitPerHour) {
                return { allowed: false, reason: 'Rate limit exceeded (per hour)' };
            }

            if (dayCount && parseInt(dayCount) >= config.rateLimitPerDay) {
                return { allowed: false, reason: 'Rate limit exceeded (per day)' };
            }

            // Incrementar contadores
            await Promise.all([
                redisClient.incr(minuteKey),
                redisClient.incr(hourKey),
                redisClient.incr(dayKey)
            ]);

            // Establecer TTL si es la primera vez
            await Promise.all([
                redisClient.expire(minuteKey, 60),
                redisClient.expire(hourKey, 3600),
                redisClient.expire(dayKey, 86400)
            ]);

            return { allowed: true };
        } catch (error) {
            logError('Error checking rate limit:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
            return { allowed: true }; // En caso de error, permitir
        }
    }

    /**
     * Obtiene estadísticas de una imagen específica
     */
    static async getImageStats(publicId: string) {
        const metric = await ImageMetric.findOne({ publicId });

        if (!metric) {
            return null;
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        return {
            publicId: metric.publicId,
            totalViews: metric.views,
            totalDownloads: metric.downloads,
            totalProxyRequests: metric.proxyRequests,
            uniqueIPs: metric.uniqueIPs.length,
            suspiciousIPs: metric.suspiciousIPs,
            cacheHitRatio: metric.cacheHits + metric.cacheMisses > 0
                ? (metric.cacheHits / (metric.cacheHits + metric.cacheMisses)) * 100
                : 0,
            requestsLastHour: metric.events.filter((e: { timestamp: Date }) => e.timestamp > oneHourAgo).length,
            requestsLastDay: metric.events.filter((e: { timestamp: Date }) => e.timestamp > oneDayAgo).length,
            requestsLastWeek: metric.events.filter((e: { timestamp: Date }) => e.timestamp > oneWeekAgo).length,
            lastAccessed: metric.lastAccessedAt,
            isBlocked: metric.isBlocked,
            blockedReason: metric.blockedReason
        };
    }

    /**
     * Obtiene las imágenes más accedidas
     */
    static async getTopImages(limit: number = 10, timeframe: 'hour' | 'day' | 'week' | 'all' = 'all') {
        let filter: Record<string, unknown> = {};

        if (timeframe !== 'all') {
            const now = Date.now();
            const timeframes = {
                hour: 60 * 60 * 1000,
                day: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000
            };

            const cutoff = new Date(now - timeframes[timeframe]);
            filter = { lastAccessedAt: { $gte: cutoff } };
        }

        return ImageMetric.find(filter)
            .sort({ proxyRequests: -1 })
            .limit(limit)
            .select('publicId url views downloads proxyRequests uniqueIPs lastAccessedAt cacheHits cacheMisses')
            .lean();
    }

    /**
     * Obtiene estadísticas globales
     */
    static async getGlobalStats() {
        const [
            totalImages,
            totalRequests,
            uniqueIPsCount,
            blockedImages,
            recentActivity
        ] = await Promise.all([
            ImageMetric.countDocuments(),
            ImageMetric.aggregate([
                { $group: { _id: null, total: { $sum: '$proxyRequests' } } }
            ]),
            ImageMetric.aggregate([
                { $unwind: '$uniqueIPs' },
                { $group: { _id: '$uniqueIPs' } },
                { $count: 'count' }
            ]),
            ImageMetric.countDocuments({ isBlocked: true }),
            ImageMetric.aggregate([
                { $match: { lastAccessedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } } },
                { $count: 'count' }
            ])
        ]);

        return {
            totalImages,
            totalRequests: totalRequests[0]?.total || 0,
            uniqueIPs: uniqueIPsCount[0]?.count || 0,
            blockedImages,
            activeImagesLastHour: recentActivity[0]?.count || 0
        };
    }

    /**
     * Envía una alerta (email o webhook)
     */
    static async sendAlert(data: {
        type: string;
        ip?: string;
        reason?: string;
        imagePublicId?: string;
        config: IImageProxyConfig;
    }) {
        try {
            // TODO: Implementar envío de email/webhook
            logger.info('[ALERT]', { module: 'SYSTEM', details: data });

            // Si hay webhook configurado
            if (data.config.alertWebhook) {
                // Aquí se puede implementar el envío al webhook
                // fetch(data.config.alertWebhook, { method: 'POST', body: JSON.stringify(data) })
            }
        } catch (error) {
            logError('Error sending alert:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
        }
    }

    /**
     * Limpia eventos antiguos según la configuración de retención
     */
    static async cleanOldEvents() {
        try {
            const config = await ImageProxyConfig.getConfig();
            const cutoffDate = new Date(Date.now() - config.retentionDays * 24 * 60 * 60 * 1000);

            const metrics = await ImageMetric.find({
                'events.0.timestamp': { $lt: cutoffDate }
            });

            for (const metric of metrics) {
                metric.events = metric.events.filter((e: { timestamp: Date }) => e.timestamp >= cutoffDate);
                await metric.save();
            }

            logger.info(`Cleaned old events from ${metrics.length} images`, { module: 'SYSTEM' });
        } catch (error) {
            logError('Error cleaning old events:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
        }
    }
}
