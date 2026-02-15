import mongoose, { Schema } from 'mongoose';

export interface EmailTemplateDocument {
    name: string;
    subject: string;
    body: string;
    variables: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema = new Schema<EmailTemplateDocument>(
    {
        name: { type: String, required: true, unique: true },
        subject: { type: String, required: true },
        body: { type: String, required: true },
        variables: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const EmailTemplate = mongoose.model<EmailTemplateDocument>('EmailTemplate', EmailTemplateSchema);
