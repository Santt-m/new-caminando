import { Router } from 'express';
import { ScraperController } from '../../controllers/admin/scraper.controller.js';

import { requireAdmin } from '../../middlewares/auth.js';

export const adminScraperRouter = Router();

// Todas las rutas de scraper requieren privilegios de admin
adminScraperRouter.use(requireAdmin);

// Obtener estado general de los scrapers
adminScraperRouter.get('/status', ScraperController.getStatus);

// Obtener estado de la cola
adminScraperRouter.get('/queue', ScraperController.getQueue);

// Obtener logs de un scraper
adminScraperRouter.get('/:id/logs', ScraperController.getLogs);

// Acciones granulares
adminScraperRouter.post('/discover-categories', ScraperController.discoverCategories);
adminScraperRouter.post('/discover-subcategories', ScraperController.discoverSubcategories);
adminScraperRouter.post('/scrape-products', ScraperController.scrapeProducts);
adminScraperRouter.post('/scrape-all', ScraperController.scrapeAll);
adminScraperRouter.post('/purge-queue', ScraperController.purgeQueue);
adminScraperRouter.post('/:id/stop', ScraperController.stopScraper);
adminScraperRouter.delete('/jobs/:jobId', ScraperController.cancelJob);
adminScraperRouter.patch('/:id/settings', ScraperController.updateSettings);

export default adminScraperRouter;
