import { adminApi } from './auth.service';

// MongoDB Types
export interface MongoDBDocument {
    _id: string | Record<string, unknown>;
    [key: string]: unknown;
}

export interface PaginatedDocuments {
    documents: MongoDBDocument[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}

export interface MongoDBIndex {
    name: string;
    key: Record<string, 1 | -1>;
    unique?: boolean;
    sparse?: boolean;
}

// MongoDB Service
export const AdminMongoDBService = {
    // Documents
    getDocuments: async (
        collectionName: string,
        options: { filter?: Record<string, unknown>; sort?: Record<string, 1 | -1>; limit?: number; skip?: number } = {}
    ): Promise<PaginatedDocuments> => {
        const params = new URLSearchParams();
        if (options.filter) params.append('filter', JSON.stringify(options.filter));
        if (options.sort) params.append('sort', JSON.stringify(options.sort));
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.skip) params.append('skip', options.skip.toString());

        const response = await adminApi.get(
            `/system/mongodb/collections/${collectionName}/documents?${params.toString()}`
        );
        return response.data.data;
    },

    getDocument: async (collectionName: string, documentId: string): Promise<MongoDBDocument> => {
        const response = await adminApi.get(
            `/system/mongodb/collections/${collectionName}/documents/${documentId}`
        );
        return response.data.data;
    },

    createDocument: async (collectionName: string, document: Record<string, unknown>): Promise<MongoDBDocument> => {
        const response = await adminApi.post(
            `/system/mongodb/collections/${collectionName}/documents`,
            document
        );
        return response.data.data;
    },

    updateDocument: async (
        collectionName: string,
        documentId: string,
        document: Record<string, unknown>
    ): Promise<MongoDBDocument> => {
        const response = await adminApi.put(
            `/system/mongodb/collections/${collectionName}/documents/${documentId}`,
            document
        );
        return response.data.data;
    },

    deleteDocument: async (collectionName: string, documentId: string, password?: string): Promise<void> => {
        await adminApi.delete(`/system/mongodb/collections/${collectionName}/documents/${documentId}`, {
            data: { password }
        });
    },

    // Indexes
    getIndexes: async (collectionName: string): Promise<MongoDBIndex[]> => {
        const response = await adminApi.get(`/system/mongodb/collections/${collectionName}/indexes`);
        return response.data.data;
    },

    createIndex: async (
        collectionName: string,
        keys: Record<string, 1 | -1>,
        options?: { unique?: boolean; sparse?: boolean; name?: string }
    ): Promise<string> => {
        const response = await adminApi.post(`/system/mongodb/collections/${collectionName}/indexes`, {
            keys,
            options
        });
        return response.data.data.indexName;
    },

    dropIndex: async (collectionName: string, indexName: string): Promise<void> => {
        await adminApi.delete(`/system/mongodb/collections/${collectionName}/indexes/${indexName}`);
    },

    deleteCollection: async (collectionName: string, password?: string): Promise<void> => {
        await adminApi.delete(`/system/mongodb/collections/${collectionName}`, {
            data: { confirm: collectionName, password }
        });
    }
};
