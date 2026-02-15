// Types for E-commerce Admin Panel

export interface TranslatedField {
    es: string;
    en: string;
    pt: string;
}

// ========== Category Types ==========
export interface Category {
    _id: string;
    name: string | TranslatedField;
    slug: string;
    description?: string | TranslatedField;
    imageUrl?: string;
    parentCategory?: string; // ID of parent category
    order?: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDto {
    name: string | TranslatedField;
    slug?: string;
    description?: string | TranslatedField;
    imageUrl?: string;
    parentCategory?: string;
    order?: number;
    active?: boolean;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// ========== Brand Types ==========
export interface Brand {
    _id: string;
    name: string;
    slug: string;
    description?: string | TranslatedField;
    logoUrl?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBrandDto {
    name: string;
    slug?: string;
    description?: string | TranslatedField;
    logoUrl?: string;
    active?: boolean;
}

export type UpdateBrandDto = Partial<CreateBrandDto>;

// ========== Attribute Definition Types ==========
export interface AttributeDefinition {
    _id: string;
    name: string | TranslatedField;
    key: string; // e.g., "color", "ram", "storage"
    type: 'select' | 'text' | 'number';
    values?: string[]; // For type 'select'
    unit?: string; // For type 'number' (e.g., "GB", "kg")
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAttributeDefinitionDto {
    name: string | TranslatedField;
    key: string;
    type: 'select' | 'text' | 'number';
    values?: string[];
    unit?: string;
    active?: boolean;
}

export type UpdateAttributeDefinitionDto = Partial<CreateAttributeDefinitionDto>;

// ========== Product Types ==========
export interface ProductVariant {
    _id?: string;
    name?: string; // Nombre descriptivo auto-generado, e.g., "Rojo - M"
    sku?: string;
    ean?: string;
    price?: number;
    discountPrice?: number;
    stock?: number;
    images?: string[];
    attributes?: Record<string, string>; // e.g., { "color": "red", "size": "M" }
    available?: boolean; // Habilitar/deshabilitar variante
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

// ========== Product Options (NEW) ==========
export interface ProductOption {
    name: string;              // Ej: "Color", "RAM", "Almacenamiento"
    key: string;               // Ej: "color", "ram", "storage" (usado en attributes)
    values: string[];          // Ej: ["Blanco", "Negro", "Azul"]
}

export interface Product {
    _id: string;
    name: string | TranslatedField;
    slug: string;
    description?: string | TranslatedField;
    sku: string;
    ean?: string;
    imageUrl?: string;
    brand?: Brand | string;
    category?: Category | string;
    subcategories?: (Category | string)[];
    price: number;
    currency: 'ARS' | 'USD' | 'PEN';
    discountPrice?: number;
    stock: number;
    shippingCost?: number;
    images: string[];
    options?: ProductOption[];  // Opciones configurables (Color, RAM, etc.) - NEW
    variants?: ProductVariant[];
    available: boolean;
    featured?: boolean;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string | TranslatedField;
    slug?: string;
    description?: string | TranslatedField;
    sku: string;
    ean?: string;
    brand?: string;
    category?: string;
    subcategories?: string[];
    price: number;
    discountPrice?: number;
    stock: number;
    images?: string[];
    variants?: Omit<ProductVariant, '_id'>[];
    available?: boolean;
    featured?: boolean;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    shippingCost?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;

// ========== Pagination Types ==========
export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

// ========== List Params ==========
export interface ProductListParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    available?: boolean;
}

export interface CategoryListParams {
    page?: number;
    limit?: number;
    search?: string;
    parentCategory?: string | null;
}

export interface BrandListParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface AttributeListParams {
    page?: number;
    limit?: number;
    search?: string;
}
