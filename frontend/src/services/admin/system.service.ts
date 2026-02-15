import { adminApi } from './auth.service';

export interface SystemMetrics {
    memory: {
        total: number;
        free: number;
        used: number;
        usagePercentage: number;
    };
    os: {
        uptime: number; // seconds
        platform: string;
        release: string;
        loadAvg: number[];
    };
    cpu: {
        count: number;
        model: string;
    };
    process: {
        uptime: number;
        memoryUsage: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
            arrayBuffers: number;
        };
    };
    database?: {
        mongodb: {
            status: string;
            collections: number;
            objects: number;
            dataSize: number;
            storageSize: number;
            indexes: number;
            indexSize: number;
        };
        redis: {
            status: string;
            version: string;
            usedMemory: string;
            connectedClients: number;
            uptimeDays: number;
            totalKeys: number;
        };
        cloudinary: {
            status: string;
        };
    };
    eventLoop?: {
        lag: number;
    };
}

export interface SystemMetric {
    cpuLoad: number;
    memoryUsage: number;
    memoryTotal: number;
    timestamp: string;
    _id: string;
    redis?: {
        usedMemory: string;
        connectedClients: number;
    };
    mongodb?: {
        objects: number;
        dataSize: number;
    };
    eventLoop?: {
        lag: number;
    };
}

export interface MongoDBCollection {
    name: string;
    count: number;
    avgSize: number;
    totalSize: number;
    indexes: number;
    indexSize: number;
}

export interface MongoDBCollectionsResponse {
    collections: MongoDBCollection[];
    totalCollections: number;
    totalDocuments: number;
    totalDataSize: number;
}

export interface RedisPattern {
    pattern: string;
    count: number;
    memoryUsage: number;
    avgTTL: number;
    sampleKeys: string[];
}

export interface RedisAnalysis {
    keysByPattern: RedisPattern[];
    hitRate: number;
    evictedKeys: number;
    expiredKeys: number;
    totalMemory: number;
    peakMemory: number;
}

export const AdminSystemService = {
    getMetrics: async (): Promise<SystemMetrics> => {
        const response = await adminApi.get('/system/metrics');
        return response.data.data;
    },

    clearCache: async (password: string): Promise<{ success: boolean; message: string }> => {
        const response = await adminApi.post('/system/cache/clear', { password });
        return response.data;
    },

    getHistory: async (): Promise<SystemMetric[]> => {
        const response = await adminApi.get('/system/history');
        return response.data.data;
    },

    getMongoDBCollections: async (): Promise<MongoDBCollectionsResponse> => {
        const response = await adminApi.get('/system/mongodb/collections');
        return response.data.data;
    },

    getRedisAnalysis: async (): Promise<RedisAnalysis> => {
        const response = await adminApi.get('/system/redis/analysis');
        return response.data.data;
    },

    estimateCleanup: async () => {
        const response = await adminApi.get<{
            data: {
                metrics: { count: number; estimatedSize: number };
                activity: { count: number; estimatedSize: number };
                totalSize: number;
                retentionDays: number;
            }
        }>('/system/cleanup/estimate');
        return response.data.data;
    },

    executeCleanup: async (password: string) => {
        const response = await adminApi.post<{
            data: {
                metricsDeleted: number;
                activityDeleted: number;
                success: boolean;
                error?: string;
            }
        }>('/system/cleanup/execute', { password });
        return response.data.data;
    }
};
