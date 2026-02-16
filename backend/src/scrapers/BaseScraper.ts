
import { Page, BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';
import { BrowserFactory } from '../config/browser/BrowserFactory.js';
import logger from '../utils/logger.js';
import { IScraperNode } from './interfaces/IScraperNode.js';
import { ScraperConfig } from '../models/ScraperConfig.js';

export abstract class BaseScraper implements IScraperNode {
    abstract name: string;
    protected page: Page | null = null;
    protected context: BrowserContext | null = null;

    constructor(protected storeId: string) { }

    /**
     * Inicializa el navegador y contexto
     */
    protected async init(): Promise<void> {
        const factory = BrowserFactory.getInstance();
        this.context = await factory.createContext();
        if (!this.context) throw new Error('Failed to create browser context');
        this.page = await this.context.newPage();
    }

    /**
     * Cierra los recursos
     */
    protected async close(): Promise<void> {
        if (this.page) await this.page.close();
        if (this.context) await this.context.close();
        this.page = null;
        this.context = null;
    }

    /**
     * Toma una captura de pantalla para el panel admin
     */
    protected async takeScreenshot(name: string = 'latest'): Promise<void> {
        if (!this.page) return;
        try {
            const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots', this.storeId);
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }
            const screenshotPath = path.join(screenshotsDir, `${name}.jpg`);
            await this.page.screenshot({
                path: screenshotPath,
                type: 'jpeg',
                quality: 60
            });
            logger.debug(`[${this.name}] Captura guardada: ${screenshotPath}`, { module: 'BROWSER', store: this.storeId });
        } catch (error) {
            logger.error(`[${this.name}] Error al tomar captura`, {
                module: 'BROWSER',
                store: this.storeId,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Espera configurada para evitar bloqueos
     */
    protected async wait(ms?: number): Promise<void> {
        const config = await ScraperConfig.findOne({ store: this.storeId }).lean();
        const delay = ms || config?.delayBetweenRequests || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Wrapper seguro para ejecución
     */
    async execute(data?: any): Promise<any> {
        try {
            // Verificar si el scraper está habilitado
            const config = await ScraperConfig.findOne({ store: this.storeId }).lean();
            if (config && config.enabled === false) {
                logger.warn(`[${this.name}] Scraper deshabilitado para ${this.storeId}`, { module: 'SCRAPER_NODE', store: this.storeId });
                return { skipped: true, reason: 'disabled' };
            }

            logger.info(`[${this.name}] Iniciando ejecución...`, { module: 'SCRAPER_NODE', store: this.storeId });
            await this.init();
            if (!this.page) throw new Error('No se pudo inicializar la página');

            // Captura inicial
            await this.takeScreenshot('latest');

            const result = await this.process(data);

            // Actualizar fecha de última ejecución
            await ScraperConfig.updateOne(
                { store: this.storeId },
                { $set: { lastRun: new Date() } },
                { upsert: true }
            );

            // Captura final antes de cerrar
            await this.takeScreenshot('latest');

            logger.info(`[${this.name}] Ejecución finalizada con éxito`, { module: 'SCRAPER_NODE', store: this.storeId });
            return result;
        } catch (error) {
            logger.error(`[${this.name}] Error en ejecución`, {
                module: 'SCRAPER_NODE',
                store: this.storeId,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            throw error;
        } finally {
            await this.close();
        }
    }

    /**
     * Lógica específica de cada nodo
     */
    protected abstract process(data?: any): Promise<any>;

    abstract canHandle(data: any): boolean;
}
