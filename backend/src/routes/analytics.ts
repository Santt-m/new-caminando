import { Router } from 'express';
import { analyticsService } from '../services/analyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analyticsRouter = Router();

analyticsRouter.post(
    '/attribution',
    asyncHandler(async (req, res) => {
        // 1. Validar input
        const { code } = req.body as { code?: string };

        if (!code || typeof code !== 'string' || code.length === 0) {
            res.status(400).json({ message: 'Invalid code' });
            return;
        }

        // 2. Obtener Session ID del middleware (trackeado por cookie)
        const sessionId = req.sessionId;

        if (!sessionId) {
            // Si por alguna razón no hay sesión (cookies deshabilitadas, etc), fallamos silenciosamente 200
            // o retornamos error. La instrucción dice "no bloquear al cliente".
            // Un 200 OK es seguro.
            res.status(200).json({ ok: true });
            return;
        }

        // 3. Capturar atribución
        const result = await analyticsService.captureAttribution(code, sessionId, req.headers['user-agent']);

        if (result.success && result.cookieValue) {
            // Setear cookie de atribución (30 días)
            res.cookie('attribution_ref', result.cookieValue, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
                sameSite: 'lax'
            });
        }

        // 4. Respuesta rápida
        res.json({ ok: true });
    })
);
