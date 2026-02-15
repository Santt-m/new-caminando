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
        switch (job.name) {
            case 'CRAWL_CATEGORY':
                logger.info(`[${store}] Descubriendo subcategorías...`, { module: 'PROCESSOR' });
                // Aquí iría la lógica de category.processor
                await new Promise(resolve => setTimeout(resolve, 5000));
                break;

            case 'SCRAPE_PRODUCT':
                logger.info(`[${store}] Scrapeando producto...`, { module: 'PROCESSOR' });
                // Aquí iría la lógica de product.processor
                await new Promise(resolve => setTimeout(resolve, 3000));
                break;

            default:
                if (job.name.startsWith('DISCOVER_')) {
                    logger.info(`[${store}] Iniciando descubrimiento inicial...`, { module: 'PROCESSOR' });
                    await new Promise(resolve => setTimeout(resolve, 8000));
                } else {
                    logger.warn(`Nombre de trabajo desconocido: ${job.name}`, { module: 'PROCESSOR' });
                }
        }
    } finally {
        // MUY IMPORTANTE: Cerrar el contexto para liberar el navegador al pool
        await context.close();
    }
};
