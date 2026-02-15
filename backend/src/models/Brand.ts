import mongoose, { Schema } from 'mongoose';
import { slugify } from '../utils/slugify.js';
import { TranslatedField } from './Category.js';

export interface BrandDocument {
    name: string;
    slug: string;
    description?: string | TranslatedField;
    logoUrl?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const BrandSchema = new Schema<BrandDocument>(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true, index: true },
        description: { type: Schema.Types.Mixed },
        logoUrl: { type: String },
        active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

// Índices
BrandSchema.index({ active: 1, name: 1 });

// Middleware para generar slug automáticamente
BrandSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = slugify(this.name);
    }
    next();
});

export const Brand = mongoose.model<BrandDocument>('Brand', BrandSchema);
