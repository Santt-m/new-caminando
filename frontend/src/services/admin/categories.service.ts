import { adminApi } from './auth.service';
import type {
    Category,
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryListParams,
} from '@/types/ecommerce';

export const AdminCategoriesService = {
    /**
     * Get all categories with pagination and filters
     */
    async getAll(params: CategoryListParams = {}) {
        const response = await adminApi.get('/categories', { params });
        return response.data.data;
    },

    /**
     * Get a single category by ID
     */
    async getById(id: string): Promise<Category> {
        const response = await adminApi.get(`/categories/${id}`);
        return response.data.data;
    },

    /**
     * Create a new category
     */
    async create(categoryData: CreateCategoryDto): Promise<Category> {
        const response = await adminApi.post('/categories', categoryData);
        return response.data.data;
    },

    /**
     * Update an existing category
     */
    async update(id: string, categoryData: UpdateCategoryDto): Promise<Category> {
        const response = await adminApi.put(`/categories/${id}`, categoryData);
        return response.data.data;
    },

    /**
     * Delete a category
     */
    async delete(id: string): Promise<void> {
        await adminApi.delete(`/categories/${id}`);
    },

    /**
     * Add category mapping for a store
     */
    async addMapping(categoryId: string, mappingData: {
        storeName: string;
        storeCategoryId: string;
        storeCategoryName: string;
        storeCategoryPath?: string[];
        confidence?: number;
    }) {
        const response = await adminApi.post(`/categories/${categoryId}/mappings`, mappingData);
        return response.data;
    },

    /**
     * Remove category mapping
     */
    async removeMapping(categoryId: string, storeName: string, storeCategoryId: string) {
        const response = await adminApi.delete(`/categories/${categoryId}/mappings/${storeName}/${storeCategoryId}`);
        return response.data;
    },

    /**
     * Auto-map categories using the CategoryMapper
     */
    async autoMapCategories(storeName: string, categories: Array<{
        id: string;
        name: string;
        path?: string[];
        context?: string;
    }>) {
        const response = await adminApi.post('/categories/auto-map', {
            storeName,
            categories
        });
        return response.data;
    },
};
