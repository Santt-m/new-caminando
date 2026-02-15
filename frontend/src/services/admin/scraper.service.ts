import { adminApi } from './auth.service';

export interface ScraperSettings {
    maxConcurrency: number;
    retryCount: number;
    retryDelay: number;
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
}

export const AdminScraperService = {
    getStatus: async (): Promise<ScraperStatus[]> => {
        const { data } = await adminApi.get('/scraper/status');
        return data.data;
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
        // Mock de datos de cola
        return [
            {
                id: '12345',
                type: 'scrape-products',
                target: 'COTO - Almacén',
                status: 'active',
                attempts: 0,
                timestamp: new Date().toISOString(),
            },
            {
                id: '12346',
                type: 'discover-subcategories',
                target: 'CARREFOUR - Hogar',
                status: 'waiting',
                attempts: 0,
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            }
        ];
    },

    getLogs: async (scraperId: string): Promise<ScraperLog[]> => {
        // Mock de logs
        return [
            { timestamp: new Date().toISOString(), level: 'info', message: `Iniciando sesión en ${scraperId}...` },
            { timestamp: new Date().toISOString(), level: 'info', message: 'Navegando a la categoría Almacén' },
            { timestamp: new Date().toISOString(), level: 'debug', message: 'Elemento de producto encontrado: Arroz Gallo 1kg' },
            { timestamp: new Date().toISOString(), level: 'warn', message: 'Timeout lento en selector de precio, reintentando...' },
        ];
    },

    updateSettings: async (scraperId: string, settings: ScraperSettings): Promise<any> => {
        const { data } = await adminApi.patch(`/scraper/${scraperId}/settings`, settings);
        return data;
    }
};
