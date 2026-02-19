import { Job } from 'bullmq';
import { BaseScraper } from '../scrapers/BaseScraper.js';
import { QueueFactory } from '../config/bullmq/QueueFactory.js';
import { JOB_PRIORITIES } from '../config/bullmq/QueueConfig.js';
import { getQueueName } from './scraper.worker.js';
import logger from '../utils/logger.js';

// --- Importar todos los scrapers ---
import { CarrefourHomeScraper } from '../scrapers/carrefour/CarrefourHomeScraper.js';
import { CarrefourProductScraper } from '../scrapers/carrefour/CarrefourProductScraper.js';
import { JumboHomeScraper } from '../scrapers/jumbo/JumboHomeScraper.js';
import { JumboProductScraper } from '../scrapers/jumbo/JumboProductScraper.js';
import { VeaHomeScraper } from '../scrapers/vea/VeaHomeScraper.js';
import { VeaProductScraper } from '../scrapers/vea/VeaProductScraper.js';
import { DiscoHomeScraper } from '../scrapers/disco/DiscoHomeScraper.js';
import { DiscoProductScraper } from '../scrapers/disco/DiscoProductScraper.js';

/**
 * Registry de scrapers: mapea (store, action) → instancia de scraper.
 * Este es el único lugar donde se registran los scrapers disponibles.
 */
const SCRAPER_REGISTRY: Record<string, Record<string, () => BaseScraper>> = {
    carrefour: {
        'discover-categories': () => new CarrefourHomeScraper(),
        'scrape-products': () => new CarrefourProductScraper(),
    },
    jumbo: {
        'discover-categories': () => new JumboHomeScraper(),
        'scrape-products': () => new JumboProductScraper(),
    },
    vea: {
        'discover-categories': () => new VeaHomeScraper(),
        'scrape-products': () => new VeaProductScraper(),
    },
    disco: {
        'discover-categories': () => new DiscoHomeScraper(),
        'scrape-products': () => new DiscoProductScraper(),
    },
};

/**
 * Despacha un job de BullMQ al scraper correcto según store y action.
 * Si action === 'full-pipeline', ejecuta el ciclo completo secuencialmente:
 *   1. discover-categories
 *   2. descubre subcategorías (reusa discover-categories que las incluye)
 *   3. scrape-products
 */
export const dispatchScraperJob = async (job: Job): Promise<void> => {
    const store: string = job.data?.store;
    const action: string = job.data?.action;

    if (!store || !action) {
        logger.warn(`[Dispatcher] Job ${job.id} sin store o action. store=${store}, action=${action}`, {
            module: 'DISPATCHER',
            jobName: job.name,
            jobData: job.data,
        });
        return;
    }

    // ── Pipeline completo ────────────────────────────────────────────────────
    if (action === 'full-pipeline') {
        logger.info(`[Dispatcher] Iniciando pipeline completo para ${store}`, {
            module: 'DISPATCHER',
            store,
        });

        await runAction(store, 'discover-categories', job);

        // Encolar scraping de productos en la queue propia del store
        // (la descarga de subcategorías la hace el HomeScraper como parte de discover-categories)
        const queue = QueueFactory.getQueue(getQueueName(store));
        await queue.add('SCRAPE_PRODUCTS', {
            store,
            action: 'scrape-products',
        }, {
            priority: JOB_PRIORITIES.SCRAPE_PRODUCT,
        });

        logger.info(`[Dispatcher] Pipeline completo de ${store}: categorías OK → scraping de productos encolado`, {
            module: 'DISPATCHER',
            store,
        });
        return;
    }

    // ── Acción individual ────────────────────────────────────────────────────
    await runAction(store, action, job);
};

/**
 * Ejecuta una acción individual para un store.
 */
const runAction = async (store: string, action: string, job: Job): Promise<void> => {
    const storeRegistry = SCRAPER_REGISTRY[store];

    if (!storeRegistry) {
        logger.warn(`[Dispatcher] Sin scraper registrado para store='${store}'`, {
            module: 'DISPATCHER',
            availableStores: Object.keys(SCRAPER_REGISTRY),
        });
        return;
    }

    const scraperFactory = storeRegistry[action];

    if (!scraperFactory) {
        logger.warn(`[Dispatcher] Sin scraper registrado para store='${store}', action='${action}'`, {
            module: 'DISPATCHER',
            availableActions: Object.keys(storeRegistry),
        });
        return;
    }

    const scraper = scraperFactory();

    logger.info(`[Dispatcher] Ejecutando ${scraper.name} para job ${job.id}`, {
        module: 'DISPATCHER',
        store,
        action,
        jobName: job.name,
    });

    await scraper.execute(job.data);
};
