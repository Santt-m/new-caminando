
import { Page, BrowserContext } from 'playwright';
import { BrowserFactory } from '../config/browser/BrowserFactory.js';
import logger from '../utils/logger.js';
import { IScraperNode } from './interfaces/IScraperNode.js';

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
     * Wrapper seguro para ejecución
     */
    async execute(data?: any): Promise<any> {
        try {
            logger.info(`[${this.name}] Iniciando ejecución...`, { module: 'SCRAPER_NODE', store: this.storeId });
            await this.init();
            if (!this.page) throw new Error('No se pudo inicializar la página');

            const result = await this.process(data);

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
