import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { QueueFactory } from '../../config/bullmq/QueueFactory.js';
import { JOB_PRIORITIES } from '../../config/bullmq/QueueConfig.js';
import { success } from '../../utils/response.js';
import { Activity } from '../../models/Activity.js';
import { ScraperConfig } from '../../models/ScraperConfig.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import { Product } from '../../models/ProductEnhanced.js';

/**
 * Scraper Controller para el Panel de Administración
 * Gestiona el monitoreo y control de los scrapers de supermercados.
 */
export const ScraperController = {
    /**
     * Obtener el estado actual de todos los scrapers
     */
    getStatus: asyncHandler(async (_req: Request, res: Response) => {
        const queue = QueueFactory.getQueue('scraper-tasks');
        const [_, configs] = await Promise.all([
            queue.getJobCounts('active', 'waiting', 'delayed', 'failed', 'completed'),
            ScraperConfig.find().lean()
        ]);

        const stores = Object.values(StoreName);
        const scrapers = await Promise.all(stores.map(async (storeId) => {
            const config = configs.find(c => c.store === storeId);

            // Buscar última ejecución en logs
            const lastActivity = await Activity.findOne({
                module: 'SCRAPER',
                'details.scraperId': storeId
            }).sort({ createdAt: -1 }).lean();

            // Buscar cantidad de productos
            const productsCount = await Product.countDocuments({
                'sources.store': storeId
            });

            // Determinar si está "corriendo" (si hay jobs activos en la cola para este store)
            const activeJobs = await queue.getJobs(['active']);
            const isRunning = activeJobs.some(job => job.data?.store === storeId);

            return {
                id: storeId,
                name: storeId.charAt(0).toUpperCase() + storeId.slice(1),
                status: isRunning ? 'running' : 'idle',
                lastRun: lastActivity?.createdAt || config?.lastRun || null,
                metrics: {
                    productsCount,
                    errorCount: lastActivity?.level === 'error' ? 1 : 0,
                },
                settings: {
                    enabled: config?.enabled ?? true,
                    maxConcurrency: config?.maxConcurrency ?? 2,
                    retryCount: config?.retryCount ?? 3,
                    delayBetweenRequests: config?.delayBetweenRequests ?? 1000,
                    retryDelay: config?.delayBetweenRequests ?? 1000, // Frontend alias
                    productUpdateFrequency: config?.productUpdateFrequency ?? 24,
                }
            };
        }));

        return success(res, scrapers, 'Estados de scrapers obtenidos correctamente');
    }),

    /**
     * Obtener logs de un scraper específico
     */
    getLogs: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const logs = await Activity.find({
            $or: [
                { 'details.store': id },
                { 'details.scraperId': id },
                { module: 'SCRAPER', 'details.scraperId': id },
                { module: 'SCRAPER_NODE', 'details.store': id },
                { module: 'PROCESSOR', 'details.store': id },
                { module: 'BROWSER', 'details.store': id },
                { module: 'WORKER', 'details.store': id }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const formattedLogs = logs.map(log => ({
            id: log._id.toString(),
            timestamp: log.createdAt,
            level: log.level,
            message: log.message,
            module: log.module,
            details: log.details
        }));

        return success(res, formattedLogs);
    }),

    /**
     * Obtener estado de la cola de BullMQ
     */
    getQueue: asyncHandler(async (_req: Request, res: Response) => {
        const queue = QueueFactory.getQueue('scraper-tasks');
        const [counts, jobs] = await Promise.all([
            queue.getJobCounts('active', 'waiting', 'delayed', 'failed', 'completed'),
            queue.getJobs(['active', 'waiting', 'delayed', 'failed'], 0, 50, true)
        ]);

        const formattedJobs = await Promise.all(jobs.map(async job => {
            let type: any = job.name;
            if (job.name.startsWith('DISCOVER_')) type = 'discover-categories';
            else if (job.name === 'CRAWL_CATEGORY') type = 'discover-subcategories';
            else if (job.name === 'SCRAPE_PRODUCT') type = 'scrape-products';

            const status = await job.getState();

            return {
                id: job.id,
                type,
                target: `${job.data?.store || 'Global'}${job.data?.action ? ` - ${job.data.action}` : ''}`,
                status,
                attempts: job.attemptsMade,
                timestamp: new Date(job.timestamp).toISOString(),
                progress: job.progress,
                failedReason: job.failedReason
            };
        }));

        return success(res, {
            counts,
            jobs: formattedJobs
        });
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
     * Iniciar scraping para todos los supermercados
     */
    scrapeAll: asyncHandler(async (req: Request, res: Response) => {
        const queue = QueueFactory.getQueue('scraper-tasks');
        const stores = Object.values(StoreName);

        for (const storeId of stores) {
            await queue.add('SCRAPE_PRODUCT', {
                store: storeId,
                action: 'scrape-products'
            }, {
                priority: JOB_PRIORITIES.SCRAPE_PRODUCT
            });
        }

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SCRAPING',
            level: 'info',
            message: 'Iniciado scraping general para todos los supermercados',
            details: { action: 'scrape-all' },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, 'Scraping general iniciado con éxito para todos los supermercados');
    }),

    /**
     * Limpiar completamente la cola de BullMQ
     */
    purgeQueue: asyncHandler(async (req: Request, res: Response) => {
        const queue = QueueFactory.getQueue('scraper-tasks');

        // 1. Pausar la cola para evitar procesamientos mientras limpiamos
        await queue.pause();

        try {
            // 2. Obtener todos los trabajos en cualquier estado (límite alto)
            const jobs = await queue.getJobs(['active', 'waiting', 'delayed', 'paused', 'failed', 'completed'], 0, 2000);

            // 3. Remover cada uno individualmente
            await Promise.all(jobs.map(async (job) => {
                try {
                    // Si está activo, intentar descartarlo para que no se reintente
                    if (await job.isActive()) {
                        await job.discard();
                    }
                    await job.remove();
                } catch (err) {
                    // Ignorar errores de remoción individual
                }
            }));

            // 4. Limpieza masiva de metadatos de la cola
            await Promise.all([
                queue.clean(0, 0, 'wait'),
                queue.clean(0, 0, 'active'),
                queue.clean(0, 0, 'delayed'),
                queue.clean(0, 0, 'failed'),
                queue.clean(0, 0, 'completed'),
                queue.drain(true)
            ]);
        } finally {
            // 5. Reanudar la cola
            await queue.resume();
        }

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'warn',
            message: 'Cola de scrapers vaciada manualmente',
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, 'Cola de trabajos limpiada correctamente');
    }),

    /**
     * Detener todos los trabajos de un supermercado específico
     */
    stopScraper: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const queue = QueueFactory.getQueue('scraper-tasks');

        // Obtener todos los trabajos pendientes
        const jobs = await queue.getJobs(['waiting', 'delayed', 'paused']);
        const jobsToRemove = jobs.filter(job => job.data?.store === id);

        for (const job of jobsToRemove) {
            await job.remove();
        }

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'info',
            message: `Detenidos todos los trabajos pendientes para ${id}`,
            details: { scraperId: id },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Se han detenido ${jobsToRemove.length} trabajos para ${id}`);
    }),

    /**
     * Cancelar un trabajo específico
     */
    cancelJob: asyncHandler(async (req: Request, res: Response) => {
        const { jobId } = req.params;
        const queue = QueueFactory.getQueue('scraper-tasks');

        const job = await queue.getJob(jobId);
        if (!job) {
            return success(res, null, 'Trabajo no encontrado o ya procesado');
        }

        await job.remove();

        return success(res, null, `Trabajo #${jobId} cancelado con éxito`);
    }),

    /**
     * Actualizar configuración del scraper
     */
    updateSettings: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const settings = req.body;

        console.log(`[Scraper] Actualizando configuración para ${id}:`, settings);

        const config = await ScraperConfig.findOneAndUpdate(
            { store: id },
            {
                $set: {
                    enabled: settings.enabled,
                    maxConcurrency: settings.maxConcurrency,
                    retryCount: settings.retryCount,
                    delayBetweenRequests: settings.delayBetweenRequests || settings.retryDelay,
                    productUpdateFrequency: settings.productUpdateFrequency
                }
            },
            { upsert: true, new: true }
        );

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'info',
            message: `Actualizada configuración para scraper ${id}`,
            details: { scraperId: id, settings: config },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, config, `Configuración de ${id} actualizada con éxito`);
    })
};
