import mongoose, { Schema, Document } from 'mongoose';
import { StoreName } from '../config/bullmq/QueueConfig.js';

export interface ScraperConfigDocument extends Document {
    store: string;
    enabled: boolean;
    maxConcurrency: number;
    retryCount: number;
    delayBetweenRequests: number; // en ms
    productUpdateFrequency: number; // en horas
    lastRun?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const ScraperConfigSchema = new Schema<ScraperConfigDocument>(
    {
        store: {
            type: String,
            required: true,
            unique: true,
            enum: Object.values(StoreName)
        },
        enabled: { type: Boolean, default: true },
        maxConcurrency: { type: Number, default: 2 },
        retryCount: { type: Number, default: 3 },
        delayBetweenRequests: { type: Number, default: 1000 },
        productUpdateFrequency: { type: Number, default: 24 },
        lastRun: { type: Date },
    },
    { timestamps: true }
);

export const ScraperConfig = mongoose.model<ScraperConfigDocument>('ScraperConfig', ScraperConfigSchema);
