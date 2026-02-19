import { Worker } from 'bullmq';

/**
 * Registro global de workers por store.
 * Permite al controller acceder y reiniciar workers individuales.
 */
let scraperWorkers: Map<string, Worker> = new Map();

export const setScraperWorkers = (workers: Map<string, Worker>) => {
    scraperWorkers = workers;
};

export const getScraperWorkers = (): Map<string, Worker> => {
    return scraperWorkers;
};
