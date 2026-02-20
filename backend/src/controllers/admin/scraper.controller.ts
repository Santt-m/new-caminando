import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { QueueFactory } from '../../config/bullmq/QueueFactory.js';
import { JOB_PRIORITIES, StoreName } from '../../config/bullmq/QueueConfig.js';
import { success } from '../../utils/response.js';
import { Activity } from '../../models/Activity.js';
import { ScraperConfig } from '../../models/ScraperConfig.js';
import { Product } from '../../models/Product.js';
import { getScraperWorkers } from '../../workers/scraper.registry.js';
import { restartStoreWorker, getQueueName, IMPLEMENTED_STORES } from '../../workers/scraper.worker.js';
import path from 'path';
import fs from 'fs';

/**
 * Scraper Controller para el Panel de Administración
 * Gestiona el monitoreo y control de los scrapers de supermercados.
 */
export const ScraperController = {
    /**
     * Obtener el estado actual de todos los scrapers
     */
    getStatus: asyncHandler(async (_req: Request, res: Response) => {
        const configs = await ScraperConfig.find().lean();

        const scrapers = await Promise.all(IMPLEMENTED_STORES.map(async (storeId) => {
            const config = configs.find(c => c.store === storeId);
            const queue = QueueFactory.getQueue(getQueueName(storeId));

            const lastActivity = await Activity.findOne({
                module: 'SCRAPER',
                'details.scraperId': storeId
            }).sort({ createdAt: -1 }).lean();

            const productsCount = await Product.countDocuments({
                'sources.store': storeId
            });

            const activeJobs = await queue.getJobs(['active']);
            const isRunning = activeJobs.length > 0;

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
                    retryDelay: config?.delayBetweenRequests ?? 1000,
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
        // Agregar jobs de todas las queues por store
        const allJobs: any[] = [];
        const allCounts = { active: 0, waiting: 0, delayed: 0, failed: 0, completed: 0 };

        for (const storeId of IMPLEMENTED_STORES) {
            const queue = QueueFactory.getQueue(getQueueName(storeId));
            const counts = await queue.getJobCounts('active', 'waiting', 'delayed', 'failed', 'completed');
            allCounts.active += counts.active;
            allCounts.waiting += counts.waiting;
            allCounts.delayed += counts.delayed;
            allCounts.failed += counts.failed;
            allCounts.completed += counts.completed;

            const jobs = await queue.getJobs(['active', 'waiting', 'delayed', 'failed'], 0, 50);
            allJobs.push(...jobs);
        }

        const formattedJobs = allJobs.map(job => {
            const status = job.finishedOn ? 'completed'
                : job.failedReason ? 'failed'
                    : job.processedOn ? 'active'
                        : job.delay ? 'delayed' : 'waiting';
            const type = job.data?.action || job.name?.toLowerCase();
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
        });

        return success(res, {
            counts: allCounts,
            jobs: formattedJobs
        });
    }),

    /**
     * Iniciar descubrimiento de categorías
     */
    discoverCategories: asyncHandler(async (req: Request, res: Response) => {
        const { scraperId } = req.body;
        console.log(`[Scraper] Iniciando descubrimiento de categorías para: ${scraperId}`);

        const queue = QueueFactory.getQueue(getQueueName(scraperId));
        await queue.add('DISCOVER_CATEGORIES', {
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

        const queue = QueueFactory.getQueue(getQueueName(scraperId));
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
        console.log(`[Scraper] Iniciando pipeline completo para: ${scraperId}${categoryId ? ` (Categoría: ${categoryId})` : ''}`);

        const queue = QueueFactory.getQueue(getQueueName(scraperId));
        await queue.add('FULL_PIPELINE', {
            store: scraperId,
            categoryId,
            action: 'full-pipeline'
        }, {
            priority: JOB_PRIORITIES.SCRAPE_PRODUCT
        });

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SCRAPING',
            level: 'info',
            message: `Iniciado pipeline completo para ${scraperId}`,
            details: { scraperId, categoryId, action: 'full-pipeline' },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Pipeline completo para ${scraperId} iniciado con éxito`);
    }),

    /**
     * Actualizar solo productos existentes (incremental)
     */
    updateProducts: asyncHandler(async (req: Request, res: Response) => {
        const { scraperId } = req.body;
        console.log(`[Scraper] Iniciando actualización de productos para: ${scraperId}`);

        const queue = QueueFactory.getQueue(getQueueName(scraperId));
        await queue.add('SCRAPE_PRODUCTS', {
            store: scraperId,
            action: 'scrape-products'
        }, {
            priority: JOB_PRIORITIES.SCRAPE_PRODUCT
        });

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SCRAPING',
            level: 'info',
            message: `Actualización de productos para ${scraperId} iniciada`,
            details: { scraperId, action: 'scrape-products' },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Actualización para ${scraperId} encolada`);
    }),

    /**
     * Iniciar scraping para todos los supermercados
     */
    scrapeAll: asyncHandler(async (req: Request, res: Response) => {
        // Solo lanzar jobs para stores con scraper implementado
        for (const storeId of IMPLEMENTED_STORES) {
            const queue = QueueFactory.getQueue(getQueueName(storeId));
            await queue.add('FULL_PIPELINE', {
                store: storeId,
                action: 'full-pipeline'
            }, {
                priority: JOB_PRIORITIES.SCRAPE_PRODUCT
            });
        }

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SCRAPING',
            level: 'info',
            message: 'Iniciado pipeline completo para todos los supermercados',
            details: { action: 'full-pipeline', stores: IMPLEMENTED_STORES },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Pipeline completo iniciado para: ${IMPLEMENTED_STORES.join(', ')}`);
    }),

    /**
     * Limpiar completamente todas las colas de BullMQ
     */
    purgeQueue: asyncHandler(async (req: Request, res: Response) => {
        const results: Record<string, string> = {};

        for (const storeId of IMPLEMENTED_STORES) {
            try {
                const queue = QueueFactory.getQueue(getQueueName(storeId));

                // 1. Pausar la cola
                await queue.pause();

                // 2. Obtener y remover trabajos
                const jobs = await queue.getJobs(['active', 'waiting', 'delayed', 'paused', 'failed', 'completed'], 0, 2000);

                await Promise.all(jobs.map(async (job) => {
                    try {
                        if (await job.isActive()) {
                            await job.discard();
                        }
                        await job.remove();
                    } catch (err) {
                        // Ignorar errores individuales
                    }
                }));

                // 3. Limpieza masiva
                await Promise.all([
                    queue.clean(0, 0, 'wait'),
                    queue.clean(0, 0, 'active'),
                    queue.clean(0, 0, 'delayed'),
                    queue.clean(0, 0, 'failed'),
                    queue.clean(0, 0, 'completed'),
                    queue.drain(true)
                ]);

                // 4. Reanudar
                await queue.resume();
                results[storeId] = 'OK';
            } catch (err) {
                console.error(`[Scraper] Error purgando cola ${storeId}:`, err);
                results[storeId] = 'Error';
            }
        }

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'warn',
            message: 'Todas las colas de scrapers vaciadas manualmente',
            details: { results },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, results, 'Todas las colas de trabajos han sido limpiadas');
    }),

    /**
     * Detener todos los trabajos de un supermercado específico
     */
    stopScraper: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const queue = QueueFactory.getQueue(getQueueName(id));

        const jobsToRemove = await queue.getJobs(['waiting', 'delayed', 'active']);
        await Promise.all(jobsToRemove.map(async (job) => {
            try { await job.remove(); } catch { /* ignorado */ }
        }));

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'warn',
            message: `Detenidos todos los trabajos pendientes para ${id}`,
            details: { scraperId: id },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Se han detenido ${jobsToRemove.length} trabajos para ${id}`);
    }),

    /**
     * Cancelar un trabajo específico buscando en todas las colas
     */
    cancelJob: asyncHandler(async (req: Request, res: Response) => {
        const { jobId } = req.params;
        let jobFound = false;

        for (const storeId of IMPLEMENTED_STORES) {
            const queue = QueueFactory.getQueue(getQueueName(storeId));
            const job = await queue.getJob(jobId);

            if (job) {
                await job.remove();
                jobFound = true;
                break;
            }
        }

        if (!jobFound) {
            return success(res, null, 'Trabajo no encontrado en ninguna cola activa');
        }

        return success(res, null, `Trabajo #${jobId} cancelado con éxito`);
    }),

    /**
     * Pausar la cola de un supermercado
     */
    pauseScraper: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const queue = QueueFactory.getQueue(getQueueName(id));

        await queue.pause();

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'info',
            message: `Cola pausada para ${id}`,
            details: { scraperId: id },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Cola de ${id} pausada`);
    }),

    /**
     * Reanudar la cola de un supermercado
     */
    resumeScraper: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const queue = QueueFactory.getQueue(getQueueName(id));

        await queue.resume();

        await Activity.create({
            module: 'SCRAPER',
            eventType: 'SYSTEM',
            level: 'info',
            message: `Cola reanudada para ${id}`,
            details: { scraperId: id },
            ip: req.ip,
            userAgent: req.get('User-Agent') || 'Unknown'
        });

        return success(res, null, `Cola de ${id} reanudada`);
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

        // Reiniciar el worker de este store para aplicar la nueva concurrencia
        try {
            const workers = getScraperWorkers();
            await restartStoreWorker(workers, id as StoreName);
        } catch (workerErr) {
            // No bloquear la respuesta si el reinicio falla
            console.warn(`[Scraper] No se pudo reiniciar el worker de ${id}:`, workerErr);
        }

        return success(res, config, `Configuración de ${id} actualizada con éxito`);
    }),

    /**
     * Limpiar capturas de pantalla de un scraper
     */
    clearScreenshots: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots', id);

        if (fs.existsSync(screenshotsDir)) {
            fs.readdirSync(screenshotsDir).forEach(file => {
                fs.unlinkSync(path.join(screenshotsDir, file));
            });
        }

        return success(res, null, `Capturas de ${id} eliminadas correctamente`);
    })
};
