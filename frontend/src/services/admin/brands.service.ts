import { adminApi } from './auth.service';
import type {
    Brand,
    CreateBrandDto,
    UpdateBrandDto,
    BrandListParams,
} from '@/types/ecommerce';

export const AdminBrandsService = {
    /**
     * Get all brands with pagination and filters
     */
    async getAll(params: BrandListParams = {}) {
        const response = await adminApi.get('/brands', { params });
        return response.data.data;
    },

    /**
     * Get a single brand by ID
     */
    async getById(id: string): Promise<Brand> {
        const response = await adminApi.get(`/brands/${id}`);
        return response.data.data;
    },

    /**
     * Create a new brand
     */
    async create(brandData: CreateBrandDto): Promise<Brand> {
        const response = await adminApi.post('/brands', brandData);
        return response.data.data;
    },

    /**
     * Update an existing brand
     */
    async update(id: string, brandData: UpdateBrandDto): Promise<Brand> {
        const response = await adminApi.put(`/brands/${id}`, brandData);
        return response.data.data;
    },

    /**
     * Delete a brand
     */
    async delete(id: string): Promise<void> {
        await adminApi.delete(`/brands/${id}`);
    },

    /**
     * Extract brands from product titles
     */
    async extractFromProducts(storeName: string, sampleSize: number = 1000) {
        const response = await adminApi.post('/brands/extract-from-products', {
            storeName,
            sampleSize
        });
        return response.data;
    },

    /**
     * Assign brand to products
     */
    async assignToProducts(brandId: string, productIds: string[]) {
        const response = await adminApi.post(`/brands/${brandId}/assign-to-products`, {
            productIds
        });
        return response.data;
    },
};
