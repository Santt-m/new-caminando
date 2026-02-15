import { Router, Request, Response } from 'express';
import { ImageTrackingService } from '../services/imageTracking.js';
import { ImageProxyConfig } from '../models/ImageProxyConfig.js';
import { redisClient } from '../config/redis.js';
import { logError } from '../utils/logger.js';
import axios from 'axios';

const router = Router();

/**
 * GET /api/images/:publicId
 * Proxy endpoint para servir imágenes con tracking y cache
 */
router.get('/:publicId(*)', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const { publicId } = req.params;
        const config = await ImageProxyConfig.getConfig();

        // Si el proxy no está activo, redirigir a Cloudinary directo
        if (!config.isActive) {
            const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
            return res.redirect(cloudinaryUrl);
        }

        // Obtener IP del cliente
        const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown';

        // Verificar si la IP está bloqueada
        if (config.isIPBlocked(clientIP)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Verificar rate limiting
        const rateLimitCheck = await ImageTrackingService.checkRateLimit(clientIP);
        if (!rateLimitCheck.allowed) {
            return res.status(429).json({
                error: 'Too many requests',
                reason: rateLimitCheck.reason
            });
        }

        // Verificar hotlink protection
        const referer = req.headers.referer || req.headers.referrer as string | undefined;
        if (!config.isRefererAllowed(referer)) {
            return res.status(403).json({ error: 'Hotlink protection: Invalid referer' });
        }

        // Preparar datos de tracking
        const trackingData = {
            ip: clientIP,
            userAgent: req.headers['user-agent'],
            referer,
            cacheHit: false,
            responseTime: 0
        };

        // Intentar obtener de cache si está habilitado
        let imageBuffer: Buffer | null = null;
        let contentType = 'image/jpeg';

        if (config.cacheEnabled) {
            const cacheKey = `image:${publicId}`;
            const cached = await redisClient.get(cacheKey);

            if (cached) {
                // Cache hit
                imageBuffer = Buffer.from(cached, 'base64');
                trackingData.cacheHit = true;

                // Obtener content-type del cache
                const cachedType = await redisClient.get(`${cacheKey}:type`);
                if (cachedType) {
                    contentType = cachedType;
                }
            }
        }

        // Si no está en cache, descargar de Cloudinary
        if (!imageBuffer) {
            const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;

            const response = await axios.get(cloudinaryUrl, {
                responseType: 'arraybuffer',
                timeout: 10000
            });

            imageBuffer = Buffer.from(response.data);
            contentType = response.headers['content-type'] || 'image/jpeg';

            // Guardar en cache si está habilitado
            if (config.cacheEnabled && imageBuffer.length < config.cacheMaxSize) {
                const cacheKey = `image:${publicId}`;
                await redisClient.setEx(
                    cacheKey,
                    config.cacheTTL,
                    imageBuffer.toString('base64')
                );
                await redisClient.setEx(
                    `${cacheKey}:type`,
                    config.cacheTTL,
                    contentType
                );
            }
        }

        // Calcular tiempo de respuesta
        trackingData.responseTime = Date.now() - startTime;

        // Registrar acceso de forma asíncrona (no bloquear la respuesta)
        ImageTrackingService.trackImageAccess(publicId, 'proxy', trackingData)
            .catch((err: Error) => logError('Error tracking access:', err, 'SYSTEM'));

        // Establecer headers de cache para el navegador
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', `public, max-age=${config.cacheTTL}`);
        res.setHeader('X-Cache', trackingData.cacheHit ? 'HIT' : 'MISS');
        res.setHeader('X-Response-Time', `${trackingData.responseTime}ms`);

        // Enviar imagen
        res.send(imageBuffer);

    } catch (error: unknown) {
        logError('Error serving image:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');

        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status === 404) {
                return res.status(404).json({ error: 'Image not found' });
            }
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
