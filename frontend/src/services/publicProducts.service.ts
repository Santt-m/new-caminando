import { apiClient } from './api/client';
import type {
    Product,
    Category,
    Brand,
    ProductListParams
} from '@/types/ecommerce';

export interface FilterData {
    categories: (Category & { subcategories: { name: any; slug: string; count: number }[]; count: number })[];
    brands: {
        items: (Brand & { count: number })[];
        total: number;
        hasMore: boolean;
        currentPage: number;
    };
    priceRange: {
        min: number;
        max: number;
    };
    availableAttributes: {
        name: any;
        key: string;
        type: string;
        values: string[];
        unit?: string;
    }[];
}

interface PublicProductListParams extends ProductListParams {
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    attributes?: string; // JSON string
    sort?: string;
}

export const PublicProductsService = {
    /**
     * Get all public products with filters
     */
    async getAll(params: PublicProductListParams = {}) {
        const response = await apiClient.get('/products', { params });
        return response.data;
    },

    /**
     * Get filter information for sidebar
     */
    async getFilters(params: {
        brandsPage?: number;
        category?: string;
        subcategory?: string;
        brand?: string;
        search?: string;
    } = {}) {
        const response = await apiClient.get('/products/filters', { params });
        return response.data;
    },

    /**
     * Get single product by slug
     */
    async getBySlug(slug: string): Promise<{ success: boolean; data: Product }> {
        const response = await apiClient.get(`/products/${slug}`);
        return response.data;
    }
};
