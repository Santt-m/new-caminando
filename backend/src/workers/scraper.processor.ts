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
            case 'DISCOVER_CARREFOUR':
                if (store === 'carrefour') {
                    const { CarrefourHomeScraper } = await import('../scrapers/carrefour/CarrefourHomeScraper.js');
                    scraperNode = new CarrefourHomeScraper();
                }
                break;
            case 'DISCOVER_JUMBO':
                if (store === 'jumbo') {
                    const { JumboHomeScraper } = await import('../scrapers/jumbo/JumboHomeScraper.js');
                    scraperNode = new JumboHomeScraper();
                }
                break;
            case 'DISCOVER_VEA':
                if (store === 'vea') {
                    const { VeaHomeScraper } = await import('../scrapers/vea/VeaHomeScraper.js');
                    scraperNode = new VeaHomeScraper();
                }
                break;
            case 'DISCOVER_DISCO':
                if (store === 'disco') {
                    const { DiscoHomeScraper } = await import('../scrapers/disco/DiscoHomeScraper.js');
                    scraperNode = new DiscoHomeScraper();
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
            case 'SCRAPE_PRODUCTS':
            case 'SCRAPE_PRODUCT':
                if (store === 'carrefour') {
                    const { CarrefourProductScraper } = await import('../scrapers/carrefour/CarrefourProductScraper.js');
                    scraperNode = new CarrefourProductScraper();
                } else if (store === 'jumbo') {
                    const { JumboProductScraper } = await import('../scrapers/jumbo/JumboProductScraper.js');
                    scraperNode = new JumboProductScraper();
                } else if (store === 'vea') {
                    const { VeaProductScraper } = await import('../scrapers/vea/VeaProductScraper.js');
                    scraperNode = new VeaProductScraper();
                } else if (store === 'disco') {
                    const { DiscoProductScraper } = await import('../scrapers/disco/DiscoProductScraper.js');
                    scraperNode = new DiscoProductScraper();
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
