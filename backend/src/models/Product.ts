import mongoose, { Schema } from 'mongoose';
import { slugify } from '../utils/slugify.js';
import { TranslatedField } from './Category.js';

export interface ProductVariant {
    _id?: mongoose.Types.ObjectId;
    sku?: string;
    ean?: string;
    name?: string | TranslatedField;
    attributes?: Record<string, string>; // ej: { color: 'Azul', capacidad: '128GB' }
    price?: number;
    stock?: number;
    images?: string[];
    available?: boolean;
    shippingCost?: number;
    weight?: number; // en gramos
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

export interface ProductOption {
    name: string;
    key: string;
    values: string[];
}

export interface ProductDocument {
    name: string | TranslatedField;
    slug: string;
    brand?: mongoose.Types.ObjectId;
    category: mongoose.Types.ObjectId;
    publicId?: string;
    sku?: string;
    stock?: number;
    ean?: string;
    imageUrl?: string;
    images?: string[];
    unit?: string;
    description?: string | TranslatedField;
    subcategories?: mongoose.Types.ObjectId[];
    tags?: string[];
    price: number;
    currency: 'ARS' | 'USD' | 'PEN';
    available: boolean;
    featured?: boolean; // Para productos destacados
    shippingCost: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    options?: ProductOption[]; // NEW: Opciones configurables
    variants?: ProductVariant[];
    defaultVariantId?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const VariantSchema = new Schema<ProductVariant>(
    {
        sku: { type: String },
        ean: { type: String },
        name: { type: Schema.Types.Mixed },
        attributes: { type: Map, of: String, default: {} },
        price: { type: Number },
        stock: { type: Number },
        images: [{ type: String }],
        available: { type: Boolean, default: true },
        shippingCost: { type: Number },
        weight: { type: Number },
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
        },
    },
    { _id: true, timestamps: false }
);

const ProductSchema = new Schema<ProductDocument>(
    {
        name: { type: Schema.Types.Mixed, required: true },
        slug: { type: String, unique: true, index: true },
        brand: { type: Schema.Types.ObjectId, ref: 'Brand', index: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
        publicId: { type: String },
        sku: { type: String, index: true },
        stock: { type: Number },
        ean: { type: String },
        imageUrl: { type: String },
        images: [{ type: String }],
        unit: { type: String },
        description: { type: Schema.Types.Mixed },
        subcategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        tags: [{ type: String }],
        price: { type: Number, required: true, index: true },
        currency: { type: String, default: 'ARS' },
        available: { type: Boolean, default: true, index: true },
        featured: { type: Boolean, default: false, index: true },
        shippingCost: { type: Number, default: 0 },
        weight: { type: Number },
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
        },
        options: [
            {
                name: { type: String, required: true },
                key: { type: String, required: true },
                values: [{ type: String }],
            },
        ],
        variants: { type: [VariantSchema], default: [] },
        defaultVariantId: { type: Schema.Types.ObjectId },
    },
    { timestamps: true }
);

// Índices compuestos para búsquedas complejas
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ available: 1, category: 1 });
ProductSchema.index({ available: 1, featured: 1 });
ProductSchema.index({ price: 1, available: 1 });
ProductSchema.index({ name: 'text', tags: 'text' });

// Middleware para generar slug automáticamente
ProductSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        const nameObj = this.name as string | TranslatedField;
        const baseName = typeof nameObj === 'string' ? nameObj : nameObj.es || nameObj.en || '';
        if (baseName) {
            this.slug = slugify(baseName);
        }
    }
    next();
});

// Virtual para calcular precio efectivo (considerando variantes)
ProductSchema.virtual('effectivePrice').get(function () {
    if (this.variants && this.variants.length > 0) {
        const prices = this.variants
            .filter((v) => v.available !== false)
            .map((v) => v.price || this.price);
        return prices.length > 0 ? Math.min(...prices) : this.price;
    }
    return this.price;
});

// Asegurar que los virtuals se incluyan en JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export const Product = mongoose.model<ProductDocument>('Product', ProductSchema);
