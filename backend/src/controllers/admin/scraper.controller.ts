import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { QueueFactory } from '../../config/bullmq/QueueFactory.js';
import { JOB_PRIORITIES } from '../../config/bullmq/QueueConfig.js';
import { success } from '../../utils/response.js';
import { Activity } from '../../models/Activity.js';

/**
 * Scraper Controller para el Panel de Administración
 * Gestiona el monitoreo y control de los scrapers de supermercados.
 */
export const ScraperController = {
    /**
     * Obtener el estado actual de todos los scrapers
     */
    getStatus: asyncHandler(async (_req: Request, res: Response) => {
        // En un futuro esto vendrá de Redis o de una tabla de estados
        const scrapers = [
            {
                id: 'coto',
                name: 'Coto',
                status: 'idle',
                lastRun: new Date(),
                metrics: {
                    productsCount: 15420,
                    errorCount: 5,
                }
            },
            {
                id: 'carrefour',
                name: 'Carrefour',
                status: 'idle',
                lastRun: new Date(),
                metrics: {
                    productsCount: 12100,
                    errorCount: 2,
                }
            }
        ];

        return success(res, scrapers, 'Estados de scrapers obtenidos correctamente');
    }),

    /**
     * Iniciar descubrimiento de categorías
     */
    discoverCategories: asyncHandler(async (req: Request, res: Response) => {
        const { scraperId } = req.body;
        console.log(`[Scraper] Iniciando descubrimiento de categorías para: ${scraperId}`);

        const queue = QueueFactory.getQueue('scraper-tasks');
        await queue.add(`DISCOVER_${scraperId.toUpperCase()}`, {
            store: scraperId,
            action: 'discover-categories'
        }, {
            priority: JOB_PRIORITIES.DISCOVER
        });

        // Registrar actividad
        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SCRAPING',
            level: 'info',
            message: `Iniciado descubrimiento de categorías para ${scraperId}`,
            details: { scraperId, action: 'discover-categories' },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Tarea de descubrimiento de categorías para ${scraperId} encolada correctamente`);
    }),

    /**
     * Iniciar descubrimiento de subcategorías
     */
    discoverSubcategories: asyncHandler(async (req: Request, res: Response) => {
        const { scraperId } = req.body;
        console.log(`[Scraper] Iniciando descubrimiento de subcategorías para: ${scraperId}`);

        const queue = QueueFactory.getQueue('scraper-tasks');
        await queue.add('CRAWL_CATEGORY', {
            store: scraperId,
            action: 'discover-subcategories'
        }, {
            priority: JOB_PRIORITIES.CRAWL_CATEGORY
        });

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SCRAPING',
            level: 'info',
            message: `Iniciado descubrimiento de subcategorías para ${scraperId}`,
            details: { scraperId, action: 'discover-subcategories' },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Tarea de descubrimiento de subcategorías para ${scraperId} encolada correctamente`);
    }),

    /**
     * Iniciar scraping de productos
     */
    scrapeProducts: asyncHandler(async (req: Request, res: Response) => {
        const { scraperId, categoryId } = req.body;
        console.log(`[Scraper] Iniciando scraping de productos para: ${scraperId}${categoryId ? ` (Categoría: ${categoryId})` : ''}`);

        const queue = QueueFactory.getQueue('scraper-tasks');
        await queue.add('SCRAPE_PRODUCT', {
            store: scraperId,
            categoryId,
            action: 'scrape-products'
        }, {
            priority: JOB_PRIORITIES.SCRAPE_PRODUCT
        });

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SCRAPING',
            level: 'info',
            message: `Iniciado scraping de productos para ${scraperId}`,
            details: { scraperId, categoryId, action: 'scrape-products' },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Tarea de scraping de productos para ${scraperId} iniciada con éxito`);
    }),

    /**
     * Actualizar configuración del scraper
     */
    updateSettings: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const settings = req.body;

        console.log(`[Scraper] Actualizando configuración para ${id}:`, settings);

        // TODO: Persistir en base de datos. 

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'info',
            message: `Actualizada configuración para scraper ${id}`,
            details: { scraperId: id, settings },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Configuración de ${id} actualizada con éxito`);
    })
};
