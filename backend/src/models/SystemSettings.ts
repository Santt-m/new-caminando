import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
    key: string;
    appName?: string;
    currency?: string;
    timezone?: string;
    maintenanceMode?: boolean;
}

const SystemSettingsSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'general' },
    appName: { type: String, default: 'Serverless Template' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
