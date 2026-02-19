import mongoose, { Schema, Document } from 'mongoose';
import { slugify } from '../utils/slugify.js';

export interface TranslatedField {
  es: string;
  en?: string;
  pt?: string;
}

export interface CategoryDocument extends Document {
  name: string | TranslatedField;
  slug: string;
  url?: string;
  description?: string | TranslatedField;
  imageUrl?: string;
  parentCategory?: mongoose.Types.ObjectId; // null = categoría principal, si tiene valor = subcategoría
  order?: number;
  active: boolean;
  level?: number;
  keywords?: string[];
  synonyms?: string[];
  storeMappings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { type: Schema.Types.Mixed, required: true },
    slug: { type: String, unique: true, index: true },
    url: { type: String },
    description: { type: Schema.Types.Mixed },
    imageUrl: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', index: true, default: null },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
    level: { type: Number, default: 0 },
    keywords: { type: [String], default: [] },
    synonyms: { type: [String], default: [] },
    storeMappings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Índices compuestos
CategorySchema.index({ active: 1, order: 1 });
CategorySchema.index({ parentCategory: 1, active: 1 });

// Middleware para generar slug automáticamente
CategorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    const nameObj = this.name as string | TranslatedField;
    const baseName = typeof nameObj === 'string' ? nameObj : nameObj.es || nameObj.en || '';
    if (baseName) {
      this.slug = slugify(baseName);
    }
  }
  next();
});

export const Category = mongoose.model<CategoryDocument>('Category', CategorySchema);
