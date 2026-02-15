import { adminApi } from './auth.service';

// Redis Types
export interface RedisKey {
    key: string;
    type: string;
    ttl: number;
    value: unknown;
}

export interface RedisKeysResponse {
    keys: string[];
    cursor: string;
    total: number;
}

export interface RedisSlowLogEntry {
    id: number;
    timestamp: number;
    duration: number;
    command: string[];
    clientAddress: string;
}

export interface RedisClient {
    id: string;
    addr: string;
    age: string;
    idle: string;
    cmd: string;
}

// Redis Service
export const AdminRedisService = {
    // Keys
    getKeys: async (pattern: string = '*', cursor: string = '0', count: number = 100): Promise<RedisKeysResponse> => {
        const params = new URLSearchParams({ pattern, cursor, count: count.toString() });
        const response = await adminApi.get(`/system/redis/keys?${params.toString()}`);
        return response.data.data;
    },

    getKey: async (key: string): Promise<RedisKey> => {
        const response = await adminApi.get(`/system/redis/keys/${encodeURIComponent(key)}`);
        return response.data.data;
    },

    setKey: async (key: string, value: unknown, type: string = 'string', ttl?: number): Promise<void> => {
        await adminApi.post('/system/redis/keys', { key, value, type, ttl });
    },

    deleteKey: async (key: string): Promise<void> => {
        await adminApi.delete(`/system/redis/keys/${encodeURIComponent(key)}`);
    },

    updateTTL: async (key: string, ttl: number): Promise<void> => {
        await adminApi.patch(`/system/redis/keys/${encodeURIComponent(key)}/ttl`, { ttl });
    },

    // Admin Operations
    getSlowLog: async (count: number = 10): Promise<RedisSlowLogEntry[]> => {
        const response = await adminApi.get(`/system/redis/slowlog?count=${count}`);
        return response.data.data;
    },

    getClients: async (): Promise<RedisClient[]> => {
        const response = await adminApi.get('/system/redis/clients');
        return response.data.data;
    },

    killClient: async (clientId: string): Promise<void> => {
        await adminApi.delete(`/system/redis/clients/${clientId}`);
    },

    flushDatabase: async (confirm: string, password?: string): Promise<void> => {
        await adminApi.post('/system/redis/flush', { confirm, password });
    },
    triggerSave: async (): Promise<void> => {
        await adminApi.post('/system/redis/save');
    },

    getInfo: async (): Promise<string> => {
        const response = await adminApi.get('/system/redis/info');
        return response.data.data;
    }
};
