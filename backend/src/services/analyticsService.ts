import { Campaign } from '../models/Campaign.js';
import { CampaignMetrics } from '../models/CampaignMetrics.js';
import { redisClient } from '../config/redis.js';
import { logError, logAudit } from '../utils/logger.js';

const getToday = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// Simple bot detection regex (expandable)
const BOT_REGEX = /bot|crawl|slurp|spider|facebookexternalhit|whatsapp/i;

export interface AttributionResult {
    success: boolean;
    cookieValue?: string;
    reason?: 'bot' | 'invalid_campaign' | 'redis_error';
}

export const analyticsService = {
    async captureAttribution(code: string, sessionId: string, userAgent: string = ''): Promise<AttributionResult> {
        // 1. Bot Filtering
        if (BOT_REGEX.test(userAgent)) {
            return { success: false, reason: 'bot' };
        }

        // 2. Validate Campaign
        const campaign = await Campaign.findOne({ code, isActive: true }).select('_id');
        if (!campaign) {
            return { success: false, reason: 'invalid_campaign' };
        }

        // 3. Update Redis Session (Short-term)
        try {
            await redisClient.hSet(`session:${sessionId}`, {
                attributionSource: code,
                attributionMedium: 'referral',
                attributionDate: new Date().toISOString()
            });
        } catch (error) {
            logError('Redis Error in captureAttribution:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
        }
        // Continue even if Redis fails, relying on Cookie fallback


        // 4. Metric Update (Fire & Forget)
        const today = getToday();
        (async () => {
            // Increment total visits in Main Campaign Document (Fast read)
            await Campaign.updateOne(
                { _id: campaign._id },
                { $inc: { 'metrics.visits': 1 } }
            ).catch((err: Error) => logError('Error incrementing visits (Campaign):', err, 'DATABASE'));

            // Upsert Daily Metrics in CampaignMetrics Collection (Scalable storage)
            await CampaignMetrics.updateOne(
                { campaignId: campaign._id, date: today },
                { $inc: { visits: 1 }, $setOnInsert: { conversions: 0 } },
                { upsert: true }
            ).catch((err: Error) => logError('Error incrementing visits (CampaignMetrics):', err, 'DATABASE'));

            // Log Audit
            logAudit(`Campaign attribution: ${code}`, 'MARKETING',
                { campaignCode: code, sessionId },
                { userAgent }
            );
        })();

        // Return success with formatted cookie value
        return {
            success: true,
            cookieValue: code
        };
    },

    async getAttributionFromSession(sessionId: string) {
        try {
            const data = await redisClient.hGetAll(`session:${sessionId}`);
            if (data && data.attributionSource) {
                return {
                    source: data.attributionSource,
                    medium: data.attributionMedium || 'unknown',
                    campaignDate: data.attributionDate ? new Date(data.attributionDate) : new Date()
                };
            }
            return null;
        } catch (error) {
            logError('Redis Error in getAttribution:', error instanceof Error ? error : new Error(String(error)), 'DATABASE');
            return null;
        }
    },

    async registerConversion(code: string) {
        const today = getToday();
        const campaign = await Campaign.findOne({ code }).select('_id');

        if (!campaign) return;

        // Fire & forget conversion count
        (async () => {
            // Total conversions
            await Campaign.updateOne(
                { _id: campaign._id },
                { $inc: { 'metrics.conversions': 1 } }
            ).catch((err: Error) => logError('Error incrementing conversions (Campaign):', err, 'DATABASE'));

            // Daily conversions
            await CampaignMetrics.updateOne(
                { campaignId: campaign._id, date: today },
                { $inc: { conversions: 1 }, $setOnInsert: { visits: 0 } },
                { upsert: true }
            ).catch((err: Error) => logError('Error incrementing conversions (CampaignMetrics):', err, 'DATABASE'));

            // Log Audit
            logAudit(`Conversion registered: ${code}`, 'MARKETING',
                { campaignCode: code }
            );
        })();
    }
};
