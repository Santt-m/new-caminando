export enum StoreName {
    CARREFOUR = 'carrefour',
    COTO = 'coto',
    DIA = 'dia',
    DISCO = 'disco',
    JUMBO = 'jumbo',
    LA_ANONIMA = 'la_anonima',
    VEA = 'vea',
}

export interface StoreQueueConfig {
    maxConcurrency: number;
    priority: number;
}

// Configuración de concurrencia por tienda (Valores iniciales)
export const QUEUE_CONFIG: Record<string, StoreQueueConfig> = {
    [StoreName.COTO]: {
        maxConcurrency: 2,
        priority: 1
    },
    [StoreName.CARREFOUR]: {
        maxConcurrency: 2,
        priority: 2
    },
    [StoreName.JUMBO]: {
        maxConcurrency: 1,
        priority: 3
    },
    [StoreName.DIA]: {
        maxConcurrency: 1,
        priority: 4
    },
    [StoreName.VEA]: {
        maxConcurrency: 1,
        priority: 5
    },
    [StoreName.DISCO]: {
        maxConcurrency: 1,
        priority: 6
    },
    [StoreName.LA_ANONIMA]: {
        maxConcurrency: 1,
        priority: 7
    }
};

// Prioridades de trabajos (mayor número = mayor prioridad)
export const JOB_PRIORITIES = {
    DISCOVER: 1,         // Baja prioridad
    CRAWL_CATEGORY: 5,   // Media prioridad
    SCRAPE_PRODUCT: 10   // Alta prioridad
};
