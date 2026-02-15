import { apiClient } from '../api/client';
import { z } from 'zod';

// Schema para las métricas del dashboard
const DashboardMetricsSchema = z.object({
    totalSavings: z.number().default(0),
    savingsTrend: z.object({
        value: z.number().default(0),
        direction: z.string().optional(), // Backend devuelve simple string
    }).optional().default({ value: 0, direction: 'flat' }),
    timeSaved: z.number().default(0),
    purchaseCount: z.number().default(0),
    activeCarts: z.number().default(0),
    trackedProducts: z.number().default(0),
}).passthrough();

export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;

export const dashboardService = {
    /**
     * Obtener métricas del dashboard
     */
    async getMetrics(): Promise<DashboardMetrics> {
        const response = await apiClient.get('/dashboard/metrics');
        // El backend devuelve { success: true, data: { ...metrics } }
        // Si data contiene las metricas directamente, usamos data.data.
        // Si metrics estan dentro de data.metrics, ajustar segun respuesta real.
        // Asumiendo misma estructura: data.data
        const rawData = response.data.data || response.data;
        return DashboardMetricsSchema.parse(rawData);
    },
};
