import { z } from 'zod';
import { StoreName } from '../../config/bullmq/QueueConfig.js';

/**
 * Esquema de validación Zod para productos de supermercado
 * Cumple con los requisitos de scraping y comparación de precios
 */

// Esquema para campos traducidos
const TranslatedFieldSchema = z.object({
    es: z.string().optional(),
    en: z.string().optional(),
    pt: z.string().optional()
}).or(z.string());

// Esquema para información nutricional
const NutritionalInfoSchema = z.object({
    servingSize: z.string().optional(),
    calories: z.number().nonnegative().optional(),
    totalFat: z.number().nonnegative().optional(),
    saturatedFat: z.number().nonnegative().optional(),
    transFat: z.number().nonnegative().optional(),
    cholesterol: z.number().nonnegative().optional(),
    sodium: z.number().nonnegative().optional(),
    totalCarbohydrates: z.number().nonnegative().optional(),
    dietaryFiber: z.number().nonnegative().optional(),
    sugars: z.number().nonnegative().optional(),
    protein: z.number().nonnegative().optional(),
    vitamins: z.record(z.string(), z.number().nonnegative()).optional(),
    minerals: z.record(z.string(), z.number().nonnegative()).optional(),
    ingredients: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    additives: z.array(z.string()).optional()
}).strict();

// Esquema para dimensiones
const DimensionsSchema = z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
}).strict();

// Esquema para variantes de producto
const ProductVariantSchema = z.object({
    sku: z.string().optional(),
    ean: z.string()
        .regex(/^\d{8,13}$/, 'EAN debe tener entre 8 y 13 dígitos')
        .refine((ean) => {
            // Validación de dígito de control EAN
            const digits = ean.split('').map(Number);
            const checkDigit = digits.pop()!;
            const sum = digits.reduce((acc, digit, index) => {
                const multiplier = index % 2 === 0 ? 3 : 1;
                return acc + digit * multiplier;
            }, 0);
            const calculatedCheckDigit = (10 - (sum % 10)) % 10;
            return calculatedCheckDigit === checkDigit;
        }, 'Dígito de control EAN inválido'),
    name: TranslatedFieldSchema.optional(),
    attributes: z.record(z.string(), z.string()).optional(),
    price: z.number().positive('El precio debe ser positivo'),
    originalPrice: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string().url()).optional(),
    available: z.boolean().default(true),
    shippingCost: z.number().nonnegative().optional(),
    weight: z.number().positive().optional(),
    dimensions: DimensionsSchema.optional(),
    packageSize: z.string().optional(),
    packageType: z.enum(['botella', 'caja', 'bolsa', 'lata', 'frasco', 'otro']).optional()
}).strict().refine((data) => {
    // Validar que el precio original sea mayor o igual al precio actual
    if (data.originalPrice && data.price) {
        return data.originalPrice >= data.price;
    }
    return true;
}, {
    message: 'El precio original debe ser mayor o igual al precio actual',
    path: ['originalPrice']
});

// Esquema para opciones de producto
const ProductOptionSchema = z.object({
    name: z.string().min(1),
    key: z.string().min(1),
    values: z.array(z.string()).min(1)
}).strict();

// Esquema para fuentes de producto (por supermercado)
const ProductSourceSchema = z.object({
    store: z.nativeEnum(StoreName),
    storeProductId: z.string().optional(),
    categoryPath: z.array(z.string()).min(1),
    originalUrl: z.string().url().optional(),
    lastScraped: z.date().default(() => new Date()),
    availabilityStatus: z.enum(['available', 'out_of_stock', 'discontinued']).optional()
}).strict();

// Esquema para ofertas y promociones
const ProductOfferSchema = z.object({
    type: z.enum(['discount', 'bundle', 'buy_x_get_y', 'loyalty']),
    description: z.string().min(1),
    discountPercentage: z.number().min(0).max(100).optional(),
    discountAmount: z.number().positive().optional(),
    originalPrice: z.number().positive().optional(),
    offerPrice: z.number().positive().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    conditions: z.array(z.string()).optional(),
    isActive: z.boolean().default(true)
}).strict().refine((data) => {
    // Validar que al menos uno de los campos de descuento esté presente
    return data.discountPercentage || data.discountAmount || data.offerPrice;
}, {
    message: 'Debe especificar al menos un tipo de descuento (porcentaje, monto o precio de oferta)'
}).refine((data) => {
    // Validar que la fecha de fin sea posterior a la de inicio
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio'
});

// Esquema para metadata de scraping
const ScrapingMetadataSchema = z.object({
    firstSeenAt: z.date().default(() => new Date()),
    lastUpdatedAt: z.date().default(() => new Date()),
    updateCount: z.number().int().nonnegative().default(0),
    confidenceScore: z.number().min(0).max(1),
    dataQuality: z.enum(['high', 'medium', 'low']).default('medium'),
    validationErrors: z.array(z.string()).optional()
}).strict();

// Esquema base para producto (sin refinamientos)
export const ProductBaseSchema = z.object({
    // Información básica requerida
    name: TranslatedFieldSchema,
    slug: z.string().optional(), // Se genera automáticamente
    brand: z.string().optional(), // ID de marca
    category: z.string(), // ID de categoría requerido
    subcategories: z.array(z.string()).optional(),

    // Identificadores
    publicId: z.string().optional(),
    sku: z.string().optional(),
    ean: z.string().regex(/^\d{8,13}$/).optional(), // EAN principal opcional

    // Descripción
    description: TranslatedFieldSchema.optional(),
    shortDescription: TranslatedFieldSchema.optional(),
    images: z.array(z.string().url()).optional(),
    imageUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),

    // Categorización
    tags: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),

    // Precios - al menos un precio es requerido
    price: z.number().positive('El precio debe ser positivo'),
    currency: z.enum(['ARS', 'USD', 'PEN']).default('ARS'),
    available: z.boolean().default(true),
    stock: z.number().int().nonnegative().optional(),

    // Variantes - al menos una variante con EAN es requerida
    variants: z.array(ProductVariantSchema).min(1, 'Debe tener al menos una variante con EAN'),
    defaultVariantId: z.string().optional(),

    // Opciones configurables
    options: z.array(ProductOptionSchema).optional(),

    // Información física
    unit: z.string().optional(),
    weight: z.number().positive().optional(),
    dimensions: DimensionsSchema.optional(),
    shippingCost: z.number().nonnegative().default(0),

    // Información nutricional
    nutritionalInfo: NutritionalInfoSchema.optional(),

    // Ofertas y promociones
    offers: z.array(ProductOfferSchema).optional(),

    // Estado
    featured: z.boolean().default(false),
    isActive: z.boolean().default(true),

    // Origen - al menos una fuente es requerida
    sources: z.array(ProductSourceSchema).min(1, 'Debe tener al menos una fuente de supermercado'),

    // Metadata de scraping
    scrapingMetadata: ScrapingMetadataSchema.optional()
}).strict();

// Esquema principal con refinamientos
export const ProductSchema = ProductBaseSchema.refine((data) => {
    // Validar que haya consistencia entre precio base y variantes
    if (data.variants && data.variants.length > 0) {
        const variantPrices = data.variants.map(v => v.price);
        const minVariantPrice = Math.min(...variantPrices);
        const maxVariantPrice = Math.max(...variantPrices);

        // El precio base debe estar dentro del rango de precios de variantes
        return data.price >= minVariantPrice && data.price <= maxVariantPrice;
    }
    return true;
}, {
    message: 'El precio base debe estar dentro del rango de precios de las variantes',
    path: ['price']
}).refine((data) => {
    // Validar unicidad de EANs en variantes
    if (data.variants && data.variants.length > 0) {
        const eans = data.variants.map(v => v.ean);
        const uniqueEans = new Set(eans);
        return eans.length === uniqueEans.size;
    }
    return true;
}, {
    message: 'Los EANs de las variantes deben ser únicos',
    path: ['variants']
});

// Esquema para validación de entrada de scraping
export const ScrapedProductInputSchema = z.object({
    // Información del producto desde el scraping
    title: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    currency: z.enum(['ARS', 'USD', 'PEN']).default('ARS'),
    stock: z.number().int().nonnegative().optional(),
    available: z.boolean().default(true),
    images: z.array(z.string().url()).optional(),

    // Identificadores
    ean: z.string().regex(/^\d{8,13}$/).optional(),
    sku: z.string().optional(),
    storeProductId: z.string().optional(),

    // Información física
    unit: z.string().optional(),
    weight: z.number().positive().optional(),
    packageSize: z.string().optional(),
    packageType: z.enum(['botella', 'caja', 'bolsa', 'lata', 'frasco', 'otro']).optional(),

    // Categorización
    categoryPath: z.array(z.string()).min(1),
    brand: z.string().optional(),

    // Metadata del scraping
    scrapedAt: z.date().default(() => new Date()),
    url: z.string().url(),
    store: z.nativeEnum(StoreName),
    confidenceScore: z.number().min(0).max(1).default(0.8)
}).strict();

// Esquema para actualización de producto existente
export const ProductUpdateSchema = ProductBaseSchema.partial().extend({
    id: z.string()
}).strict();

// Tipos TypeScript
export type ProductInput = z.infer<typeof ProductSchema>;
export type ScrapedProductInput = z.infer<typeof ScrapedProductInputSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type ProductOfferInput = z.infer<typeof ProductOfferSchema>;
export type ProductSourceInput = z.infer<typeof ProductSourceSchema>;

// Funciones de utilidad
export function validateProduct(input: unknown) {
    return ProductSchema.safeParse(input);
}

export function validateScrapedProduct(input: unknown) {
    return ScrapedProductInputSchema.safeParse(input);
}

export function validateProductUpdate(input: unknown) {
    return ProductUpdateSchema.safeParse(input);
}

export function isValidEAN(ean: string): boolean {
    return ProductVariantSchema.shape.ean.safeParse(ean).success;
}

export function calculatePriceRange(variants: ProductVariantInput[]): { min: number; max: number } {
    if (!variants || variants.length === 0) {
        return { min: 0, max: 0 };
    }

    const prices = variants.map(v => v.price);
    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
}

export function findBestVariant(variants: ProductVariantInput[]): ProductVariantInput | null {
    if (!variants || variants.length === 0) {
        return null;
    }

    // Buscar la variante con mejor relación precio/disponibilidad
    const availableVariants = variants.filter(v => v.available !== false);
    if (availableVariants.length === 0) {
        return variants[0];
    }

    return availableVariants.reduce((best, current) => {
        return current.price < best.price ? current : best;
    });
}

export function getActiveOffers(offers: ProductOfferInput[]): ProductOfferInput[] {
    const now = new Date();
    return offers.filter(offer => {
        if (!offer.isActive) return false;
        if (offer.startDate && offer.startDate > now) return false;
        if (offer.endDate && offer.endDate < now) return false;
        return true;
    });
}

export function calculateDiscountedPrice(price: number, offer: ProductOfferInput): number {
    if (offer.offerPrice) {
        return offer.offerPrice;
    }

    if (offer.discountPercentage) {
        return price * (1 - offer.discountPercentage / 100);
    }

    if (offer.discountAmount) {
        return Math.max(0, price - offer.discountAmount);
    }

    return price;
}