import { apiClient } from '../api/client';
import { z } from 'zod';

// Schema para información de sesión (coincide con backend)
const SessionSchema = z.object({
    id: z.string(),
    deviceInfo: z.object({
        browser: z.string(),
        os: z.string(),
        device: z.string(),
    }),
    ipInfo: z.object({
        ip: z.string(),
        country: z.string().optional(),
        city: z.string().optional(),
        timezone: z.string().optional(),
        isp: z.string().optional(),
    }),
    lastUsedAt: z.union([z.string(), z.date()]),
    createdAt: z.union([z.string(), z.date()]),
    isCurrent: z.boolean().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

const SessionsResponseSchema = z.object({
    sessions: z.array(SessionSchema).optional().default([]),
});

export const sessionsService = {
    /**
     * Obtener lista de sesiones activas del usuario
     */
    async getSessions(): Promise<Session[]> {
        const response = await apiClient.get('/sessions');

        const rawData = response.data.data || response.data;
        const validated = SessionsResponseSchema.parse(rawData);
        return validated.sessions;
    },

    /**
     * Cerrar una sesión específica
     */
    async terminateSession(sessionId: string): Promise<void> {
        await apiClient.delete(`/sessions/${sessionId}`);
    },

    /**
     * Cerrar todas las sesiones excepto la actual
     */
    async terminateAllOtherSessions(): Promise<void> {
        await apiClient.delete('/sessions/all-except-current');
    },
};
