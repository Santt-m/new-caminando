import { adminApi } from './auth.service';

export interface ScraperSettings {
    enabled: boolean;
    maxConcurrency: number;
    retryCount: number;
    retryDelay: number;
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
}

export interface ScraperLog {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    details?: any;
}

export const AdminScraperService = {
    getStatus: async (): Promise<ScraperStatus[]> => {
        const { data } = await adminApi.get('/scraper/status');
        return data.data;
    },

    getScreenshotUrl: (scraperId: string): string => {
        const baseUrl = adminApi.defaults.baseURL || '';
        // El backend sirve screenshots en /screenshots/ID/latest.jpg
        const rootUrl = baseUrl.replace('/api/v1/panel', '') || 'http://localhost:3002';
        return `${rootUrl}/screenshots/${scraperId}/latest.jpg?t=${Date.now()}`;
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

    getQueueStatus: async (): Promise<ScraperJob[]> => {
        const { data } = await adminApi.get('/scraper/queue');
        return data.data.jobs;
    },

    getLogs: async (scraperId: string): Promise<ScraperLog[]> => {
        const { data } = await adminApi.get(`/scraper/${scraperId}/logs`);
        return data.data;
    },

    updateSettings: async (scraperId: string, settings: ScraperSettings): Promise<any> => {
        const { data } = await adminApi.patch(`/scraper/${scraperId}/settings`, settings);
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
