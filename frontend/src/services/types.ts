// Tipos base del sistema

export type Supermercado = string;

export type Currency = 'ARS' | 'USD' | 'PEN';

export type Language = 'es' | 'en' | 'pt';


// ============================================
// Usuario
// ============================================

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    bio?: string;
    provider: 'email' | 'google';
    createdAt: string;
    preferences: UserPreferences;
    profile?: {
        firstName?: string;
        lastName?: string;
        dni?: string;
        gender?: 'M' | 'F' | 'X';
        phone?: { areaCode: string; number: string };
        dateOfBirth?: { day: string; month: string; year: string };
        address?: { street: string; number: string; city?: string; zipCode?: string; floor?: string; apartment?: string };
    };
}

export interface UserPreferences {
    currency: Currency;
    language: Language;
    notifications: {
        recurringReminders: boolean;
        newsletter: boolean;
        syncCompleted: boolean;
    };
}

// ============================================
// Autenticación
// ============================================

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

// ============================================
// Productos
// ============================================

export interface TranslatedField {
    es: string;
    en?: string;
    pt?: string;
}

export interface Product {
    id: string;
    slug: string;
    name: string | TranslatedField;
    brand?: string;
    category: string;
    sku?: string;
    stock?: number;
    ean?: string;
    imageUrl?: string;
    images?: string[];
    unit?: string;
    description?: string | TranslatedField;
    subcategories?: string[];
    tags?: string[];
    price: number;
    currency: Currency;
    available: boolean;
    shippingCost: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

export interface ProductVariant {
    id?: string;
    sku?: string;
    ean?: string;
    name?: string | TranslatedField;
    attributes?: Record<string, string>;
    price?: number;
    stock?: number;
    images?: string[];
    available?: boolean;
    shippingCost?: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

export interface ProductWithPrices extends Product {
    variants?: ProductVariant[];
    defaultVariantId?: string;
}

export interface PriceHistory {
    productId: string;
    data: Array<{
        date: string;
        price: number;
    }>;
}

// ============================================
// Listas de Compras (Carritos)
// ============================================

export interface ShoppingList {
    id: string;
    userId: string;
    name: string;
    icon: string;
    items: ShoppingListItem[];
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}

export interface ShoppingListItem {
    productId: string;
    quantity: number;
}

export interface ShoppingListWithDetails extends ShoppingList {
    itemsWithProducts: Array<{
        product: Product;
        quantity: number;
        price: number;
    }>;
    total: number;
    savings: number;
    bestOption: {
        supermercados: Array<{
            supermercado: Supermercado;
            itemCount: number;
            total: number;
        }>;
    };
}

// ============================================
// Credenciales de Supermercados (Vault)
// ============================================

export interface SupermarketCredential {
    id: string;
    userId: string;
    supermercado: Supermercado;
    username: string;
    status: 'active' | 'error' | 'not_configured';
    lastSync?: string;
    errorMessage?: string;
}

// ============================================
// Compras
// ============================================

export interface Purchase {
    id: string;
    userId: string;
    listId?: string;
    supermercados: Supermercado[];
    total: number;
    savings: number;
    status: 'completed' | 'partial' | 'failed';
    items: PurchaseItem[];
    createdAt: string;
}

export interface PurchaseItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    supermercado: Supermercado;
}

// ============================================
// Notificaciones
// ============================================

export interface Notification {
    id: string;
    userId: string;
    type: 'sync_completed' | 'system' | 'reminder';
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    actionUrl?: string;
}

// ============================================
// Métricas del Dashboard
// ============================================

export interface DashboardMetrics {
    totalSavings: number;
    timeSaved: number;
    purchaseCount: number;
    savingsTrend: {
        value: number;
        direction: 'up' | 'down';
    };
}

export interface InflationData {
    personalInflation: number;
    nationalInflation: number;
    history: Array<{
        date: string;
        personal: number;
        national: number;
    }>;
}

export interface SavingsBySupermercado {
    supermercado: Supermercado;
    amount: number;
    percentage: number;
}

// ============================================
// Filtros y Búsqueda
// ============================================

export interface ProductFilters {
    query?: string;
    category?: string;
    priceRange?: {
        min: number;
        max: number;
    };
    onlyAvailable?: boolean;
    onlyDelivery?: boolean;
    brand?: string;
    tags?: string[];
    subcategories?: string[];
}

export interface AvailableFilters {
    brands: string[];
    tags: string[];
    subcategories: Array<{
        label: string;
        count: number;
        slug: string;
    }>;
}

export interface ProductSearchResult {
    products: ProductWithPrices[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================
// API Responses
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
    };
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CategoryStats {
    _id: string; // slug
    label: {
        es: string;
        en: string;
        pt: string;
    };
    count: number;
    subcategories: Array<{
        slug: string;
        label: {
            es: string;
            en: string;
            pt: string;
        };
        count: number;
    }>;
}

export interface SearchSuggestion {
    term: string;
    score: number;
    type: 'product' | 'category';
    popularStore?: string;
}
