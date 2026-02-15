import mongoose, { Document, Schema } from 'mongoose';

export interface CampaignMetricsDocument extends Document {
    campaignId: mongoose.Types.ObjectId;
    date: Date;
    visits: number;
    conversions: number;
    // hourly: Record<string, number>; // Future expansion
}

const CampaignMetricsSchema = new Schema({
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    date: { type: Date, required: true },
    visits: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Compound index for efficient querying by campaign and date
CampaignMetricsSchema.index({ campaignId: 1, date: 1 }, { unique: true });

export const CampaignMetrics = mongoose.model<CampaignMetricsDocument>('CampaignMetrics', CampaignMetricsSchema);
