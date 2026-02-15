import mongoose, { Schema } from 'mongoose';
import { TranslatedField } from './Category.js';

export interface AttributeDefinitionDocument {
    name: string | TranslatedField;
    key: string; // ej: "color", "ram", "storage"
    type: 'select' | 'text' | 'number';
    values?: string[]; // Para tipo 'select': ["Rojo", "Azul", "Verde"]
    unit?: string; // Para tipo 'number': "GB", "kg", "cm"
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const AttributeDefinitionSchema = new Schema<AttributeDefinitionDocument>(
    {
        name: { type: Schema.Types.Mixed, required: true },
        key: { type: String, required: true, unique: true, index: true },
        type: { type: String, enum: ['select', 'text', 'number'], required: true },
        values: [{ type: String }],
        unit: { type: String },
        active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

// Índices
AttributeDefinitionSchema.index({ active: 1, type: 1 });

export const AttributeDefinition = mongoose.model<AttributeDefinitionDocument>(
    'AttributeDefinition',
    AttributeDefinitionSchema
);
