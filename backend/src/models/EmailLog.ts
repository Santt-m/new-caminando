import mongoose, { Schema } from 'mongoose';

export interface EmailLogDocument {
    recipient: string;
    templateName: string;
    status: 'success' | 'failed';
    error?: string;
    metadata?: unknown;
    createdAt: Date;
}

const EmailLogSchema = new Schema<EmailLogDocument>(
    {
        recipient: { type: String, required: true },
        templateName: { type: String, required: true },
        status: { type: String, enum: ['success', 'failed'], required: true },
        error: { type: String },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

EmailLogSchema.index({ recipient: 1 });
EmailLogSchema.index({ templateName: 1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ createdAt: -1 });

export const EmailLog = mongoose.model<EmailLogDocument>('EmailLog', EmailLogSchema);
