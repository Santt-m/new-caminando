import { ImageMetric } from '../models/ImageMetric.js';
import { Activity } from '../models/Activity.js';
import { ImageProxyConfig } from '../models/ImageProxyConfig.js';
import mongoose from 'mongoose';
import { logAudit, logError } from '../utils/logger.js';

interface CleanupEstimate {
    metrics: { count: number; estimatedSize: number };
    activity: { count: number; estimatedSize: number };
    totalSize: number;
}



interface CleanupResult {
    metricsDeleted: number;
    activityDeleted: number;
    success: boolean;
    error?: string;
}

export class CleanupService {

    /**
     * Calcula la fecha de corte basada en la configuración o un default
     */
    private static async getCutoffDate(): Promise<Date> {
        let retentionDays = 90;
        try {
            const config = await ImageProxyConfig.getConfig();
            retentionDays = config.retentionDays || 90;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            // Fallback to 90 days if config fails
            // Error ignorado intencionalmente - usamos el valor por defecto de 90 días
        }
        return new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    }

    /**
     * Estima la cantidad de datos que se eliminarían
     */
    static async estimateCleanup(): Promise<CleanupEstimate> {
        const cutoffDate = await this.getCutoffDate();

        const metricsWithOldEvents = await ImageMetric.aggregate([
            { $unwind: "$events" },
            { $match: { "events.timestamp": { $lt: cutoffDate } } },
            { $count: "count" }
        ]);

        const metricsCount = metricsWithOldEvents[0]?.count || 0;
        const metricsSize = metricsCount * 100;

        const activityCount = await Activity.countDocuments({
            createdAt: { $lt: cutoffDate }
        });
        const activitySize = activityCount * 500;

        return {
            metrics: {
                count: metricsCount,
                estimatedSize: metricsSize
            },
            activity: {
                count: activityCount,
                estimatedSize: activitySize
            },
            totalSize: metricsSize + activitySize
        };
    }

    /**
     * Ejecuta la limpieza
     */
    static async executeCleanup(): Promise<CleanupResult> {
        const Session = mongoose.startSession();
        (await Session).startTransaction();

        try {
            const cutoffDate = await this.getCutoffDate();
            let metricsDeleted = 0;
            let activityDeleted = 0;

            const updateResult = await ImageMetric.updateMany(
                { "events.timestamp": { $lt: cutoffDate } },
                { $pull: { events: { timestamp: { $lt: cutoffDate } } } }
            );

            metricsDeleted = updateResult.modifiedCount;

            const deleteResult = await Activity.deleteMany({
                createdAt: { $lt: cutoffDate }
            });
            activityDeleted = deleteResult.deletedCount;

            await (await Session).commitTransaction();
            (await Session).endSession();

            logAudit('System cleanup executed', 'DATABASE', { metricsDeleted, activityDeleted });

            return {
                metricsDeleted,
                activityDeleted,
                success: true
            };

        } catch (error: unknown) {
            await (await Session).abortTransaction();
            (await Session).endSession();
            logError('Error executing cleanup', error instanceof Error ? error : new Error(String(error)), 'DATABASE');

            return {
                metricsDeleted: 0,
                activityDeleted: 0,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
