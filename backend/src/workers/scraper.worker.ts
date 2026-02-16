import { Worker, ConnectionOptions } from 'bullmq';
import { QueueFactory } from '../config/bullmq/QueueFactory.js';
import { processScraperJob } from './scraper.processor.js';
import logger from '../utils/logger.js';

export const startScraperWorker = () => {
    const connection = QueueFactory.getRedisConnection();

    logger.info('Iniciando Worker de Scraper...', { module: 'WORKER' });

    const worker = new Worker('scraper-tasks', async (job) => {
        try {
            await processScraperJob(job);
        } catch (error) {
            logger.error(`Error procesando trabajo ${job.id}:`, error, { module: 'WORKER' });
            throw error;
        }
    }, {
        connection: connection as ConnectionOptions,
        concurrency: 3, // Reducido para evitar timeouts de recursos
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 }
    });

    worker.on('completed', (job) => {
        logger.info(`Trabajo ${job.id} COMPLETADO`, { module: 'WORKER', jobName: job.name });
    });

    worker.on('failed', (job, err) => {
        logger.error(`Trabajo ${job?.id} FALLIDO`, err, { module: 'WORKER', jobName: job?.name });
    });

    return worker;
};
