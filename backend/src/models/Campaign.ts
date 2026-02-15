import mongoose, { Schema, Document } from 'mongoose';

export interface CampaignDocument extends Document {
    code: string;
    destinationUrl?: string; // Para redirecciones opcionales
    isActive: boolean;
    metrics: {
        visits: number;
        conversions: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CampaignSchema = new Schema<CampaignDocument>(
    {
        code: { type: String, required: true, unique: true, index: true },
        destinationUrl: { type: String },
        isActive: { type: Boolean, default: true },
        metrics: {
            visits: { type: Number, default: 0 },
            conversions: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

export const Campaign = mongoose.model<CampaignDocument>('Campaign', CampaignSchema);
