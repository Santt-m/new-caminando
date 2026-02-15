import { adminApi } from './auth.service';
import type {
    Product,
} from '@/types/ecommerce';

export interface ListProductsQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const AdminProductsService = {
    getAll: async (query: ListProductsQuery = {}): Promise<ProductListResponse> => {
        const response = await adminApi.get('/products', { params: query });
        return response.data.data;
    },

    getById: async (id: string): Promise<Product> => {
        const response = await adminApi.get(`/products/${id}`);
        return response.data.data;
    },

    create: async (data: Partial<Product>): Promise<Product> => {
        const response = await adminApi.post('/products', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<Product>): Promise<Product> => {
        const response = await adminApi.put(`/products/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        const response = await adminApi.delete(`/products/${id}`);
        return response.data;
    },

};
