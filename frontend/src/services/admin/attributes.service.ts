import { adminApi } from './auth.service';
import type {
    AttributeDefinition,
    CreateAttributeDefinitionDto,
    UpdateAttributeDefinitionDto,
    AttributeListParams,
} from '@/types/ecommerce';

export const AdminAttributesService = {
    /**
     * Get all attribute definitions with pagination and filters
     */
    async getAll(params: AttributeListParams = {}) {
        const response = await adminApi.get('/attributes', { params });
        return response.data.data;
    },

    /**
     * Get a single attribute definition by ID
     */
    async getById(id: string): Promise<AttributeDefinition> {
        const response = await adminApi.get(`/attributes/${id}`);
        return response.data.data;
    },

    /**
     * Create a new attribute definition
     */
    async create(attributeData: CreateAttributeDefinitionDto): Promise<AttributeDefinition> {
        const response = await adminApi.post('/attributes', attributeData);
        return response.data.data;
    },

    /**
     * Update an existing attribute definition
     */
    async update(id: string, attributeData: UpdateAttributeDefinitionDto): Promise<AttributeDefinition> {
        const response = await adminApi.put(`/attributes/${id}`, attributeData);
        return response.data.data;
    },

    /**
     * Delete an attribute definition
     */
    async delete(id: string): Promise<void> {
        await adminApi.delete(`/attributes/${id}`);
    },
};
