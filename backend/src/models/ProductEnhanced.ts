import mongoose, { Schema, Document, FilterQuery } from 'mongoose';
import { slugify } from '../utils/slugify.js';
import { TranslatedField } from './Category.js';
import { StoreName } from '../config/bullmq/QueueConfig.js';
import { validateEAN, isTemporaryEAN, compareEANs, EANInfo } from '../shared/utils/EANUtils.js';

/**
 * Interfaz para variantes de producto con EAN único
 */
export interface ProductVariant {
    _id?: mongoose.Types.ObjectId;
    sku?: string;
    ean: string; // Código de barras único - REQUERIDO
    name?: string | TranslatedField;
    attributes?: Record<string, string>; // ej: { color: 'Azul', capacidad: '128GB', tamaño: '1L' }
    price: number; // REQUERIDO para comparación de precios
    originalPrice?: number; // Precio original (para ofertas)
    stock?: number;
    images?: string[];
    available: boolean; // REQUERIDO
    shippingCost?: number;
    weight?: number; // en gramos
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    packageSize?: string; // ej: '1L', '500g', '12un'
    packageType?: string; // ej: 'botella', 'caja', 'bolsa'
}

/**
 * Interfaz para opciones configurables del producto
 */
export interface ProductOption {
    name: string;
    key: string;
    values: string[];
}

/**
 * Interfaz para información de origen del producto
 */
export interface ProductSource {
    store: StoreName;
    storeProductId?: string;
    price?: number;
    categoryPath: string[];
    originalUrl?: string;
    lastScraped?: Date;
    availabilityStatus?: 'available' | 'out_of_stock' | 'discontinued';
}

/**
 * Interfaz para información nutricional
 */
export interface NutritionalInfo {
    servingSize?: string;
    calories?: number;
    totalFat?: number;
    saturatedFat?: number;
    transFat?: number;
    cholesterol?: number;
    sodium?: number;
    totalCarbohydrates?: number;
    dietaryFiber?: number;
    sugars?: number;
    protein?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
    ingredients?: string[];
    allergens?: string[];
    additives?: string[];
}

/**
 * Interfaz para ofertas y promociones
 */
export interface ProductOffer {
    type: 'discount' | 'bundle' | 'buy_x_get_y' | 'loyalty';
    description: string;
    discountPercentage?: number;
    discountAmount?: number;
    originalPrice?: number;
    offerPrice?: number;
    startDate?: Date;
    endDate?: Date;
    conditions?: string[];
    isActive: boolean;
}

/**
 * Interfaz para métodos estáticos del modelo Product
 */
export interface ProductModel extends mongoose.Model<ProductDocument> {
    findByEAN(ean: string): Promise<ProductDocument | null>;
    findByEANs(eans: string[]): Promise<ProductDocument[]>;
    findWithTemporaryEANs(): mongoose.Query<ProductDocument[], ProductDocument>;
    findWithoutEAN(): mongoose.Query<ProductDocument[], ProductDocument>;
    upsertByEAN(ean: string, productData: Partial<ProductDocument>): Promise<ProductDocument>;
    isEANUnique(ean: string, excludeProductId?: string): Promise<boolean>;
}

/**
 * Interfaz extendida para el documento de producto
 */
export interface ProductDocument extends Document {
    // Información básica
    name: string | TranslatedField;
    slug: string;
    brand?: mongoose.Types.ObjectId;
    category: mongoose.Types.ObjectId;
    subcategories?: mongoose.Types.ObjectId[];

    // Identificadores únicos
    publicId?: string;
    sku?: string;
    ean?: string; // EAN principal

    // Descripción e imágenes
    description?: string | TranslatedField;
    shortDescription?: string | TranslatedField;
    images?: string[];
    imageUrl?: string;
    thumbnailUrl?: string;

    // Categorización
    tags?: string[];
    keywords?: string[];

    // Precios y disponibilidad
    price: number; // Precio base
    currency: 'ARS' | 'USD' | 'PEN';
    available: boolean;
    stock?: number;

    // Variantes con EAN único
    variants: ProductVariant[];
    defaultVariantId?: mongoose.Types.ObjectId;

    // Opciones configurables
    options?: ProductOption[];

    // Información física
    unit?: string;
    weight?: number; // en gramos
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    shippingCost: number;

    // Información nutricional (para productos alimenticios)
    nutritionalInfo?: NutritionalInfo;

    // Ofertas y promociones
    offers?: ProductOffer[];

    // Estado y destacados
    featured: boolean;
    isActive: boolean;

    // Origen y rastreo
    sources: ProductSource[];

    // Metadata de scraping
    scrapingMetadata?: {
        firstSeenAt: Date;
        lastUpdatedAt: Date;
        updateCount: number;
        confidenceScore: number;
        dataQuality: 'high' | 'medium' | 'low';
        validationErrors?: string[];
    };

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;

    // Métodos de instancia
    addOrUpdateSource(source: ProductSource): Promise<ProductDocument>;
    addOffer(offer: ProductOffer): Promise<ProductDocument>;
    deactivateExpiredOffers(): Promise<ProductDocument>;
    findVariantByEAN(ean: string): ProductVariant | null;
    getAllEANs(): string[];
    validateAllEANs(): { valid: string[]; invalid: string[]; details: EANInfo[] };
    hasTemporaryEAN(): boolean;
    replaceTemporaryEAN(tempEan: string, realEan: string): boolean;
    updateScrapingMetadata(confidenceScore: number, dataQuality: 'high' | 'medium' | 'low', validationErrors?: string[]): Promise<ProductDocument>;
}

/**
 * Esquema para variantes de producto
 */
const VariantSchema = new Schema<ProductVariant>(
    {
        sku: { type: String },
        ean: {
            type: String,
            required: true,
            index: true,
            unique: true // Garantizar unicidad del EAN
        },
        name: { type: Schema.Types.Mixed },
        attributes: { type: Map, of: String, default: {} },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        stock: { type: Number },
        images: [{ type: String }],
        available: { type: Boolean, required: true, default: true },
        shippingCost: { type: Number },
        weight: { type: Number },
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
        },
        packageSize: { type: String },
        packageType: { type: String }
    },
    { _id: true, timestamps: false }
);

/**
 * Esquema para información nutricional
 */
const NutritionalInfoSchema = new Schema<NutritionalInfo>({
    servingSize: { type: String },
    calories: { type: Number },
    totalFat: { type: Number },
    saturatedFat: { type: Number },
    transFat: { type: Number },
    cholesterol: { type: Number },
    sodium: { type: Number },
    totalCarbohydrates: { type: Number },
    dietaryFiber: { type: Number },
    sugars: { type: Number },
    protein: { type: Number },
    vitamins: { type: Map, of: Number },
    minerals: { type: Map, of: Number },
    ingredients: [{ type: String }],
    allergens: [{ type: String }],
    additives: [{ type: String }]
}, { _id: false });

/**
 * Esquema para ofertas y promociones
 */
const ProductOfferSchema = new Schema<ProductOffer>({
    type: {
        type: String,
        required: true,
        enum: ['discount', 'bundle', 'buy_x_get_y', 'loyalty']
    },
    description: { type: String, required: true },
    discountPercentage: { type: Number },
    discountAmount: { type: Number },
    originalPrice: { type: Number },
    offerPrice: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    conditions: [{ type: String }],
    isActive: { type: Boolean, required: true, default: true }
}, { _id: true });

/**
 * Esquema para origen del producto
 */
const ProductSourceSchema = new Schema<ProductSource>({
    store: {
        type: String,
        required: true,
        enum: Object.values(StoreName)
    },
    storeProductId: { type: String },
    price: { type: Number }, // Price at this source
    categoryPath: [{ type: String }],
    originalUrl: { type: String },
    lastScraped: { type: Date, default: Date.now },
    availabilityStatus: {
        type: String,
        enum: ['available', 'out_of_stock', 'discontinued']
    }
}, { _id: true });

/**
 * Esquema principal del producto
 */
const ProductSchema = new Schema<ProductDocument>(
    {
        // Información básica
        name: { type: Schema.Types.Mixed, required: true },
        slug: { type: String, unique: true, index: true },
        brand: { type: Schema.Types.ObjectId, ref: 'Brand', index: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
        subcategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],

        // Identificadores únicos
        publicId: { type: String, index: true },
        sku: { type: String, index: true },
        ean: { type: String, index: true }, // EAN principal

        // Descripción e imágenes
        description: { type: Schema.Types.Mixed },
        shortDescription: { type: Schema.Types.Mixed },
        images: [{ type: String }],
        imageUrl: { type: String },
        thumbnailUrl: { type: String },

        // Categorización
        tags: [{ type: String }],
        keywords: [{ type: String }],

        // Precios y disponibilidad
        price: { type: Number, required: true, index: true },
        currency: { type: String, default: 'ARS', enum: ['ARS', 'USD', 'PEN'] },
        available: { type: Boolean, required: true, default: true, index: true },
        stock: { type: Number },

        // Variantes con EAN único
        variants: { type: [VariantSchema], default: [] },
        defaultVariantId: { type: Schema.Types.ObjectId },

        // Opciones configurables
        options: [
            {
                name: { type: String, required: true },
                key: { type: String, required: true },
                values: [{ type: String }],
            },
        ],

        // Información física
        unit: { type: String },
        weight: { type: Number },
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
        },
        shippingCost: { type: Number, default: 0 },

        // Información nutricional
        nutritionalInfo: { type: NutritionalInfoSchema },

        // Ofertas y promociones
        offers: { type: [ProductOfferSchema], default: [] },

        // Estado y destacados
        featured: { type: Boolean, default: false, index: true },
        isActive: { type: Boolean, default: true, index: true },

        // Origen y rastreo
        sources: { type: [ProductSourceSchema], default: [] },

        // Metadata de scraping
        scrapingMetadata: {
            firstSeenAt: { type: Date, default: Date.now },
            lastUpdatedAt: { type: Date, default: Date.now },
            updateCount: { type: Number, default: 0 },
            confidenceScore: { type: Number, min: 0, max: 1 },
            dataQuality: {
                type: String,
                enum: ['high', 'medium', 'low'],
                default: 'medium'
            },
            validationErrors: [{ type: String }]
        }
    },
    { timestamps: true }
);

// Índices compuestos para búsquedas complejas
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ available: 1, category: 1 });
ProductSchema.index({ available: 1, featured: 1 });
ProductSchema.index({ price: 1, available: 1 });
ProductSchema.index({ 'sources.store': 1 }); // Índice por supermercado
ProductSchema.index({ 'scrapingMetadata.lastUpdatedAt': -1 }); // Para limpieza de datos antiguos

// Índice de texto para búsquedas
ProductSchema.index({
    name: 'text',
    description: 'text',
    keywords: 'text',
    tags: 'text'
});

// Middleware para generar slug automáticamente
ProductSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        const nameObj = this.name as string | TranslatedField;
        const baseName = typeof nameObj === 'string' ? nameObj : nameObj.es || nameObj.en || '';
        if (baseName) {
            this.slug = slugify(baseName);
        }
    }

    // Actualizar metadata de scraping
    if (this.isModified() && !this.isNew) {
        if (!this.scrapingMetadata) {
            this.scrapingMetadata = {
                lastUpdatedAt: new Date(),
                updateCount: 1,
                firstSeenAt: new Date(),
                confidenceScore: 0.5,
                dataQuality: 'medium'
            };
        } else {
            this.scrapingMetadata.lastUpdatedAt = new Date();
            this.scrapingMetadata.updateCount = (this.scrapingMetadata.updateCount || 0) + 1;
        }
    }

    next();
});

// Virtual para calcular precio efectivo (considerando variantes y ofertas)
ProductSchema.virtual('effectivePrice').get(function () {
    // Primero verificar ofertas activas
    const activeOffers = this.offers?.filter((offer: { isActive: boolean }) => offer.isActive) || [];
    if (activeOffers.length > 0) {
        const bestOffer = activeOffers.reduce((best: ProductOffer, current: ProductOffer) => {
            const bestDiscount = best.discountPercentage || 0;
            const currentDiscount = current.discountPercentage || 0;
            return currentDiscount > bestDiscount ? current : best;
        });

        if (bestOffer.offerPrice) {
            return bestOffer.offerPrice;
        } else if (bestOffer.discountPercentage) {
            return this.price * (1 - bestOffer.discountPercentage / 100);
        }
    }

    // Luego verificar variantes
    if (this.variants && this.variants.length > 0) {
        const availableVariants = this.variants.filter((v: { available?: boolean }) => v.available !== false);
        if (availableVariants.length > 0) {
            const prices = availableVariants.map((v: ProductVariant) => v.price || this.price);
            return Math.min(...prices);
        }
    }

    return this.price;
});

// Virtual para obtener la mejor variante disponible
ProductSchema.virtual('bestVariant').get(function () {
    if (!this.variants || this.variants.length === 0) {
        return null;
    }

    const availableVariants = this.variants.filter((v: ProductVariant) => v.available !== false);
    if (availableVariants.length === 0) {
        return this.variants[0];
    }

    return availableVariants.reduce((best: ProductVariant, current: ProductVariant) => {
        const bestPrice = best.price || this.price;
        const currentPrice = current.price || this.price;
        return currentPrice < bestPrice ? current : best;
    });
});

// Virtual para verificar disponibilidad general
ProductSchema.virtual('isAvailable').get(function () {
    if (!this.isActive || !this.available) {
        return false;
    }

    if (this.variants && this.variants.length > 0) {
        return this.variants.some(v => v.available !== false);
    }

    return true;
});

// Virtual para obtener información del supermercado principal
ProductSchema.virtual('primaryStore').get(function () {
    if (!this.sources || this.sources.length === 0) {
        return null;
    }

    // Buscar el source más reciente
    return this.sources.reduce((latest: ProductSource, current: ProductSource) => {
        if (!latest.lastScraped) return current;
        if (!current.lastScraped) return latest;
        return current.lastScraped > latest.lastScraped ? current : latest;
    });
});

// Método para agregar o actualizar una fuente
ProductSchema.methods.addOrUpdateSource = function (source: ProductSource) {
    const existingIndex = this.sources.findIndex((s: ProductSource) => s.store === source.store);

    if (existingIndex >= 0) {
        this.sources[existingIndex] = {
            ...this.sources[existingIndex],
            ...source,
            lastScraped: new Date()
        };
    } else {
        this.sources.push({
            ...source,
            lastScraped: new Date()
        });
    }

    return this.save();
};

// Método para agregar una oferta
ProductSchema.methods.addOffer = function (offer: ProductOffer) {
    if (!this.offers) {
        this.offers = [];
    }

    this.offers.push({
        ...offer,
        _id: new mongoose.Types.ObjectId()
    });

    return this.save();
};

// Método para desactivar ofertas vencidas
ProductSchema.methods.deactivateExpiredOffers = function () {
    if (!this.offers) return Promise.resolve(this);

    const now = new Date();
    this.offers.forEach((offer: ProductOffer) => {
        if (offer.endDate && offer.endDate < now) {
            offer.isActive = false;
        }
    });

    return this.save();
};

// Método para encontrar variante por EAN
ProductSchema.methods.findVariantByEAN = function (ean: string): ProductVariant | null {
    if (!this.variants) return null;
    return this.variants.find((v: ProductVariant) => v.ean === ean) || null;
};

// Método para obtener todos los EANs del producto (principal + variantes)
ProductSchema.methods.getAllEANs = function (): string[] {
    const eans: string[] = [];

    if (this.ean) {
        eans.push(this.ean);
    }

    if (this.variants && this.variants.length > 0) {
        this.variants.forEach((variant: ProductVariant) => {
            if (variant.ean && !eans.includes(variant.ean)) {
                eans.push(variant.ean);
            }
        });
    }

    return eans;
};

// Método para validar todos los EANs del producto
ProductSchema.methods.validateAllEANs = function (): { valid: string[]; invalid: string[]; details: EANInfo[] } {
    const allEANs = this.getAllEANs();
    const valid: string[] = [];
    const invalid: string[] = [];
    const details: EANInfo[] = [];

    allEANs.forEach((ean: string) => {
        const validation = validateEAN(ean);
        details.push(validation);

        if (validation.isValid) {
            valid.push(ean);
        } else {
            invalid.push(ean);
        }
    });

    return { valid, invalid, details };
};

// Método para buscar variantes relacionadas por EAN
ProductSchema.methods.findRelatedVariantsByEAN = function (ean: string): ProductVariant[] {
    if (!this.variants || this.variants.length === 0) {
        return [];
    }

    const targetInfo = validateEAN(ean);
    if (!targetInfo.isValid) {
        return [];
    }

    return this.variants.filter((variant: ProductVariant) => {
        if (!variant.ean) return false;
        const comparison = compareEANs(ean, variant.ean);
        return comparison.areRelated && comparison.relationship !== 'different';
    });
};

// Método para verificar si el producto tiene EAN temporal
ProductSchema.methods.hasTemporaryEAN = function (): boolean {
    const allEANs = this.getAllEANs();
    return allEANs.some((ean: string) => isTemporaryEAN(ean));
};

// Método para reemplazar EAN temporal con EAN real
ProductSchema.methods.replaceTemporaryEAN = function (tempEan: string, realEan: string): boolean {
    let replaced = false;

    // Verificar que el EAN temporal sea válido
    if (!isTemporaryEAN(tempEan)) {
        return false;
    }

    // Verificar que el EAN real sea válido
    const realEanValidation = validateEAN(realEan);
    if (!realEanValidation.isValid) {
        return false;
    }

    // Reemplazar en el producto principal
    if (this.ean === tempEan) {
        this.ean = realEan;
        replaced = true;
    }

    // Reemplazar en variantes
    if (this.variants && this.variants.length > 0) {
        this.variants.forEach((variant: ProductVariant) => {
            if (variant.ean === tempEan) {
                variant.ean = realEan;
                replaced = true;
            }
        });
    }

    return replaced;
};

// Método para actualizar metadata de scraping
ProductSchema.methods.updateScrapingMetadata = function (confidenceScore: number, dataQuality: 'high' | 'medium' | 'low', validationErrors?: string[]) {
    if (!this.scrapingMetadata) {
        this.scrapingMetadata = {
            firstSeenAt: new Date(),
            lastUpdatedAt: new Date(),
            updateCount: 0,
            confidenceScore,
            dataQuality,
            validationErrors: validationErrors || []
        };
    } else {
        this.scrapingMetadata.lastUpdatedAt = new Date();
        this.scrapingMetadata.updateCount += 1;
        this.scrapingMetadata.confidenceScore = confidenceScore;
        this.scrapingMetadata.dataQuality = dataQuality;
        this.scrapingMetadata.validationErrors = validationErrors || [];
    }

    return this.save();
};

// Métodos estáticos para operaciones con EAN

// Buscar producto por EAN (en principal o variantes)
ProductSchema.statics.findByEAN = function (ean: string) {
    return this.findOne({
        $or: [
            { ean: ean },
            { 'variants.ean': ean }
        ]
    });
};

// Buscar productos por múltiples EANs
ProductSchema.statics.findByEANs = function (eans: string[]) {
    return this.find({
        $or: [
            { ean: { $in: eans } },
            { 'variants.ean': { $in: eans } }
        ]
    });
};

// Buscar productos con EANs temporales
ProductSchema.statics.findWithTemporaryEANs = function () {
    return this.find({
        $or: [
            { ean: /^2/ }, // EANs temporales comienzan con 2
            { 'variants.ean': /^2/ }
        ]
    });
};

// Buscar productos sin EAN
ProductSchema.statics.findWithoutEAN = function () {
    return this.find({
        $and: [
            { $or: [{ ean: { $exists: false } }, { ean: null }, { ean: '' }] },
            { $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }] }
        ]
    });
};

// Agregar o actualizar un producto con EAN
ProductSchema.statics.upsertByEAN = async function (ean: string, productData: Partial<ProductDocument>) {
    const existingProduct = await Product.findByEAN(ean);

    if (existingProduct) {
        // Actualizar producto existente
        Object.assign(existingProduct, productData);
        return existingProduct.save();
    } else {
        // Crear nuevo producto
        return new Product(productData).save();
    }
};

// Verificar unicidad de EAN
ProductSchema.statics.isEANUnique = async function (ean: string, excludeProductId?: string) {
    const query: FilterQuery<ProductDocument> = {
        $or: [
            { ean: ean },
            { 'variants.ean': ean }
        ]
    };

    if (excludeProductId) {
        query._id = { $ne: excludeProductId };
    }

    const count = await this.countDocuments(query);
    return count === 0;
};

// Asegurar que los virtuals se incluyan en JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// Asegurar que el modelo existe con todos los métodos estáticos
if (!mongoose.models.Product) {
    mongoose.model<ProductDocument, ProductModel>('Product', ProductSchema);
}
export const Product = mongoose.models.Product as ProductModel;