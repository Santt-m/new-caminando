import { adminApi } from './auth.service';
import { API_BASE_URL } from '@/utils/api.config';

export interface ScraperSettings {
    enabled: boolean;
    maxConcurrency: number;
    retryCount: number;
    retryDelay: number;           // alias frontend de delayBetweenRequests (ms)
    delayBetweenRequests: number; // nombre real en DB
    productUpdateFrequency: number;
}

export interface ScraperStatus {
    id: string;
    name: string;
    status: 'idle' | 'running' | 'paused' | 'error';
    lastRun: string;
    metrics: {
        productsCount: number;
        errorCount: number;
    };
    settings?: ScraperSettings;
}

export interface ScraperJob {
    id: string;
    type: 'discover-categories' | 'discover-subcategories' | 'scrape-products';
    target: string;
    status: 'active' | 'waiting' | 'completed' | 'failed' | 'delayed';
    attempts: number;
    timestamp: string;
    duration?: string;
    progress?: number;
    failedReason?: string;
}

export interface ScraperLog {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    module?: string;
    details?: any;
}

/**
 * Construye la URL raíz del backend (sin /api/v1).
 * Usada para acceder a archivos estáticos como screenshots.
 */
const getBackendRoot = (): string => {
    const base = API_BASE_URL;
    // En dev, API_BASE_URL = "http://localhost:4000/api/v1"
    if (base.startsWith('http')) {
        return base.replace(/\/api\/v1$/, '');
    }
    // En prod con path relativo ("/api/v1") → misma origin
    return '';
};

export const AdminScraperService = {
    getStatus: async (): Promise<ScraperStatus[]> => {
        const { data } = await adminApi.get('/scraper/status');
        return data.data;
    },

    getScreenshotUrl: (scraperId: string): string => {
        const root = getBackendRoot();
        return `${root}/screenshots/${scraperId}/latest.jpg?t=${Date.now()}`;
    },

    discoverCategories: async (scraperId: string): Promise<any> => {
        const { data } = await adminApi.post('/scraper/discover-categories', { scraperId });
        return data;
    },

    discoverSubcategories: async (scraperId: string): Promise<any> => {
        const { data } = await adminApi.post('/scraper/discover-subcategories', { scraperId });
        return data;
    },

    scrapeProducts: async (scraperId: string, categoryId?: string): Promise<any> => {
        const { data } = await adminApi.post('/scraper/scrape-products', { scraperId, categoryId });
        return data;
    },

    updateProducts: async (scraperId: string): Promise<any> => {
        const { data } = await adminApi.post('/scraper/update-products', { scraperId });
        return data;
    },

    getQueueStatus: async (): Promise<ScraperJob[]> => {
        const { data } = await adminApi.get('/scraper/queue');
        return data.data?.jobs ?? [];
    },

    getLogs: async (scraperId: string): Promise<ScraperLog[]> => {
        const { data } = await adminApi.get(`/scraper/${scraperId}/logs`);
        return data.data;
    },

    updateSettings: async (scraperId: string, settings: Partial<ScraperSettings>): Promise<any> => {
        const { data } = await adminApi.patch(`/scraper/${scraperId}/settings`, settings);
        return data;
    },

    clearScreenshots: async (scraperId: string): Promise<any> => {
        const { data } = await adminApi.delete(`/scraper/${scraperId}/screenshots`);
        return data;
    },

    scrapeAll: async (): Promise<any> => {
        const { data } = await adminApi.post('/scraper/scrape-all');
        return data;
    },

    purgeQueue: async (): Promise<any> => {
        const { data } = await adminApi.post('/scraper/purge-queue');
        return data;
    },

    stopScraper: async (scraperId: string): Promise<any> => {
        const { data } = await adminApi.post(`/scraper/${scraperId}/stop`);
        return data;
    },

    cancelJob: async (jobId: string): Promise<any> => {
        const { data } = await adminApi.delete(`/scraper/jobs/${jobId}`);
        return data;
    }
};
