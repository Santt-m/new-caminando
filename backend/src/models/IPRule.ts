import mongoose, { Schema, Document } from 'mongoose';

export interface IPRuleDocument extends Document {
    ip: string;
    type: 'whitelist' | 'blacklist';
    reason?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const IPRuleSchema = new Schema<IPRuleDocument>(
    {
        ip: { type: String, required: true, unique: true, index: true },
        type: { type: String, enum: ['whitelist', 'blacklist'], required: true, index: true },
        reason: { type: String },
        createdBy: { type: String },
    },
    { timestamps: true }
);

export const IPRule = mongoose.model<IPRuleDocument>('IPRule', IPRuleSchema);
