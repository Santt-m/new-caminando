import { Job } from 'bullmq';
import { BrowserFactory } from '../config/browser/BrowserFactory.js';
import logger from '../utils/logger.js';

/**
 * Procesador principal de trabajos de scraping
 */
export const processScraperJob = async (job: Job) => {
    const store = job.data.store || 'unknown';
    const action = job.data.action || 'unknown';

    logger.info(`Ejecutando ${job.name} para ${store}...`, {
        module: 'PROCESSOR',
        jobId: job.id,
        action
    });

    const browserFactory = BrowserFactory.getInstance();
    const context = await browserFactory.createContext();

    try {

        // En un futuro aquí importaremos dinámicamente el módulo por tienda
        // Por ahora simulamos el procesamiento según la acción

        // Factory simple para instanciar el nodo correcto
        let scraperNode;
        const jobType = job.name;

        switch (jobType) {
            case 'DISCOVER_CARREFOUR': // Or similar action name mapped
                if (store === 'carrefour') {
                    const { CarrefourHomeScraper } = await import('../scrapers/carrefour/CarrefourHomeScraper.js');
                    scraperNode = new CarrefourHomeScraper();
                }
                break;
            case 'CRAWL_CATEGORY':
                if (store === 'carrefour') {
                    const { CarrefourSubcategoryScraper } = await import('../scrapers/carrefour/CarrefourSubcategoryScraper.js');
                    scraperNode = new CarrefourSubcategoryScraper();
                }
                break;
            case 'DISCOVER_BRANDS':
                if (store === 'carrefour') {
                    const { CarrefourBrandScraper } = await import('../scrapers/carrefour/CarrefourBrandScraper.js');
                    scraperNode = new CarrefourBrandScraper();
                }
                break;
            case 'SCRAPE_PRODUCT':
                if (store === 'carrefour') {
                    const { CarrefourProductScraper } = await import('../scrapers/carrefour/CarrefourProductScraper.js');
                    scraperNode = new CarrefourProductScraper();
                }
                break;
        }

        if (scraperNode && scraperNode.canHandle(job.data)) {
            logger.info(`[PROCESSOR] Ejecutando nodo ${scraperNode.name}`, { module: 'PROCESSOR' });
            await scraperNode.execute(job.data);
        } else {
            logger.warn(`No se encontró nodo para ${job.name} en ${store}`, { module: 'PROCESSOR' });
        }
    } finally {
        // MUY IMPORTANTE: Cerrar el contexto para liberar el navegador al pool
        await context.close();
    }
};
