import { Router } from 'express';
import { ScraperController } from '../../controllers/admin/scraper.controller.js';

export const adminScraperRouter = Router();

// Obtener estado general de los scrapers
adminScraperRouter.get('/status', ScraperController.getStatus);

// Acciones granulares
adminScraperRouter.post('/discover-categories', ScraperController.discoverCategories);
adminScraperRouter.post('/discover-subcategories', ScraperController.discoverSubcategories);
adminScraperRouter.post('/scrape-products', ScraperController.scrapeProducts);
adminScraperRouter.patch('/:id/settings', ScraperController.updateSettings);

export default adminScraperRouter;
