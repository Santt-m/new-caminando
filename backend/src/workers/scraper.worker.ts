import { Worker, ConnectionOptions } from 'bullmq';
import { QueueFactory } from '../config/bullmq/QueueFactory.js';
import { ScraperConfig } from '../models/ScraperConfig.js';
import { StoreName, QUEUE_CONFIG } from '../config/bullmq/QueueConfig.js';
import { dispatchScraperJob } from './scraper.dispatcher.js';
import logger from '../utils/logger.js';

/**
 * Nombre de la queue BullMQ para un store específico.
 * Cada store tiene su propia queue para evitar que workers de otros
 * stores consuman (y descarten) sus jobs, marcándolos como completados.
 */
export const getQueueName = (store: string): string => `scraper-${store}`;

/**
 * Inicia un Worker de BullMQ dedicado para un supermercado específico.
 * Lee su propia queue (ej: "scraper-carrefour") para garantizar aislamiento.
 * La concurrencia se lee desde ScraperConfig en la base de datos.
 */
const startStoreWorker = async (store: StoreName): Promise<Worker> => {
    const connection = QueueFactory.getRedisConnection();
    const queueName = getQueueName(store);

    // Leer configuración desde la DB — si no existe, usar defaults de QueueConfig
    const config = await ScraperConfig.findOne({ store }).lean();
    const defaultConcurrency = QUEUE_CONFIG[store]?.maxConcurrency ?? 1;
    const concurrency = config?.maxConcurrency ?? defaultConcurrency;

    logger.info(`[Worker:${store}] Iniciando worker → queue="${queueName}", concurrencia=${concurrency}`, {
        module: 'WORKER',
        store,
        concurrency,
        enabled: config?.enabled ?? true,
    });

    const worker = new Worker(
        queueName,
        async (job) => {
            // Verificar si el scraper está habilitado (puede haber cambiado desde el inicio)
            const currentConfig = await ScraperConfig.findOne({ store }).lean();
            if (currentConfig?.enabled === false) {
                logger.warn(`[Worker:${store}] Scraper deshabilitado, saltando job ${job.id}`, {
                    module: 'WORKER',
                    store,
                });
                return;
            }

            try {
                await dispatchScraperJob(job);
            } catch (error) {
                logger.error(`[Worker:${store}] Error procesando job ${job.id}`, {
                    module: 'WORKER',
                    store,
                    error: error instanceof Error ? error.message : 'Unknown',
                });
                throw error;
            }
        },
        {
            connection: connection as ConnectionOptions,
            concurrency,
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 500 },
        }
    );

    worker.on('completed', (job) => {
        logger.info(`[Worker:${store}] ✅ Job ${job.id} COMPLETADO (${job.name})`, {
            module: 'WORKER',
            store,
            jobName: job.name,
        });
    });

    worker.on('failed', (job, err) => {
        logger.error(`[Worker:${store}] ❌ Job ${job?.id} FALLIDO`, {
            module: 'WORKER',
            store,
            jobName: job?.name,
            error: err.message,
        });
    });

    return worker;
};

/**
 * Inicia todos los workers de scraping, uno por supermercado.
 * Solo se crean workers para stores que tienen scrapers implementados.
 */
export const IMPLEMENTED_STORES: StoreName[] = [
    StoreName.CARREFOUR,
    StoreName.JUMBO,
    StoreName.VEA,
    StoreName.DISCO,
    StoreName.DIA,
    StoreName.LA_ANONIMA,
];

export const startScraperWorkers = async (): Promise<Map<string, Worker>> => {
    const workers = new Map<string, Worker>();

    for (const store of IMPLEMENTED_STORES) {
        const worker = await startStoreWorker(store);
        workers.set(store, worker);
    }

    logger.info(`[Workers] ${workers.size} workers iniciados`, {
        module: 'WORKER',
        stores: [...workers.keys()],
    });

    return workers;
};

/**
 * Reinicia el worker de un supermercado específico para aplicar nueva configuración.
 */
export const restartStoreWorker = async (
    workers: Map<string, Worker>,
    store: StoreName
): Promise<void> => {
    const existingWorker = workers.get(store);
    if (existingWorker) {
        logger.info(`[Workers] Reiniciando worker de ${store}...`, { module: 'WORKER', store });
        await existingWorker.close();
    }

    const newWorker = await startStoreWorker(store);
    workers.set(store, newWorker);

    logger.info(`[Workers] Worker de ${store} reiniciado con nueva configuración`, {
        module: 'WORKER',
        store,
    });
};
