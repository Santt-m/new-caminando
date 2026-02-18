import { StoreName } from '../config/bullmq/QueueConfig.js';
import logger from './logger.js';
import { Page } from 'playwright';

/**
 * Tipos de eventos de scraping (Sincronizado con Activity.ts)
 */
export type ScrapingEventType =
    | 'CATEGORY_DISCOVERY_START'
    | 'CATEGORY_DISCOVERY_SUCCESS'
    | 'CATEGORY_DISCOVERY_ERROR'
    | 'BRAND_EXTRACTION_START'
    | 'BRAND_EXTRACTION_SUCCESS'
    | 'BRAND_EXTRACTION_ERROR'
    | 'PRODUCT_SCRAPING_START'
    | 'PRODUCT_SCRAPING_SUCCESS'
    | 'PRODUCT_SCRAPING_ERROR'
    | 'CATEGORY_MAPPING_START'
    | 'CATEGORY_MAPPING_SUCCESS'
    | 'CATEGORY_MAPPING_ERROR'
    | 'BRAND_MATCHING_START'
    | 'BRAND_MATCHING_SUCCESS'
    | 'BRAND_MATCHING_ERROR'
    | 'SCRAPING_SUCCESS'
    | 'SCRAPING_ERROR'
    | 'PRODUCT_EXTRACTION_START'
    | 'PRODUCT_EXTRACTION_SUCCESS'
    | 'BRAND_MATCH_FAILURE'
    | 'BRAND_MATCH_ERROR'
    | 'SELECTOR_FAILURE'
    | 'BOT_DETECTION'
    | 'RATE_LIMIT_HIT'
    | 'NETWORK_ERROR'
    | 'BOT_BLOCKED'
    | 'DOM_CHANGE'
    | 'VALIDATION_ERROR'
    | 'SCREENSHOT_CAPTURED'
    | 'DATA_SAVED'
    | 'DATA_VALIDATION_FAILED'
    | 'CATEGORY_SAVE_SUCCESS'
    | 'CATEGORY_SAVE_ERROR'
    | 'BRAND_SAVE_SUCCESS'
    | 'BRAND_SAVE_ERROR'
    | 'DATA_PERSISTENCE_SUCCESS'
    | 'DATA_PERSISTENCE_ERROR'
    | 'PRODUCT_SAVE_SUCCESS'
    | 'PRODUCT_SAVE_ERROR';

/**
 * Interfaz para datos de contexto de scraping
 */
export interface ScrapingContext {
    store: StoreName;
    jobId?: string;
    categoryId?: string;
    categoryName?: string;
    categoryPath?: string[];
    brandId?: string;
    brandName?: string;
    productId?: string;
    productTitle?: string;
    productEan?: string;
    url?: string;
    selector?: string;
    screenshotPath?: string;
    htmlSnapshotPath?: string;
    retryCount?: number;
    executionTime?: number;
    itemsProcessed?: number;
    itemsFound?: number;
    validationErrors?: string[];
    error?: string;
    stack?: string;
    categoriesFound?: number;
    brandsFound?: number;
    brandsExtracted?: number;
    productsExtracted?: number;
    totalProducts?: number;
    brandMatch?: any;
    mappingResult?: any;
    itemsSaved?: number;
    collection?: string;
}

/**
 * Metadata base para todos los logs de scraping
 */
const buildScraperLogMetadata = (context: ScrapingContext, eventType: ScrapingEventType) => ({
    module: 'SCRAPER',
    eventType,
    store: context.store,
    jobId: context.jobId,
    details: {
        ...context,
        timestamp: new Date().toISOString()
    }
});

/**
 * Funciones de utilidad para logging de scraping
 */
export const scraperLogger = {
    info: (message: string, context: ScrapingContext, eventType: ScrapingEventType) => {
        logger.info(message, buildScraperLogMetadata(context, eventType));
    },

    error: (message: string, context: ScrapingContext, eventType: ScrapingEventType, error?: Error | unknown) => {
        const metadata = buildScraperLogMetadata(context, eventType);
        if (error instanceof Error) {
            metadata.details = { ...metadata.details, error: error.message, stack: error.stack };
        }
        logger.error(message, metadata);
    },

    warn: (message: string, context: ScrapingContext, eventType: ScrapingEventType) => {
        logger.warn(message, buildScraperLogMetadata(context, eventType));
    },

    // Shorthands comunes
    logStart: (context: ScrapingContext, action: string = 'discovery') => {
        const type: ScrapingEventType = action === 'discovery' ? 'CATEGORY_DISCOVERY_START' : 'PRODUCT_SCRAPING_START';
        scraperLogger.info(`Iniciado ${action} para ${context.store}`, context, type);
    },

    logSuccess: (context: ScrapingContext, message: string, eventType: ScrapingEventType) => {
        scraperLogger.info(message, context, eventType);
    },

    logError: (context: ScrapingContext, message: string, eventType: ScrapingEventType, error?: Error | unknown) => {
        scraperLogger.error(message, context, eventType, error);
    },

    // Métodos de compatibilidad con ScraperLogger antiguo
    logCategoryDiscoveryStart: (context: ScrapingContext) => {
        scraperLogger.info(`Iniciado descubrimiento de categorías para ${context.store}`, context, 'CATEGORY_DISCOVERY_START');
    },

    logCategoryDiscoverySuccess: (context: ScrapingContext, categoriesFound: number, brandsFound: number) => {
        scraperLogger.info(`Descubrimiento completado: ${categoriesFound} categorías, ${brandsFound} marcas`, { ...context, categoriesFound, brandsFound }, 'CATEGORY_DISCOVERY_SUCCESS');
    },

    logCategoryDiscoveryError: (context: ScrapingContext, error: Error) => {
        scraperLogger.error(`Error en descubrimiento de categorías: ${error.message}`, context, 'CATEGORY_DISCOVERY_ERROR', error);
    },

    logProductScrapingStart: (context: ScrapingContext) => {
        scraperLogger.info(`Iniciado scraping de productos para ${context.store}`, context, 'PRODUCT_SCRAPING_START');
    },

    logScrapingSuccess: (context: ScrapingContext, details: any) => {
        scraperLogger.info(`Scraping completado exitosamente para ${context.store}`, { ...context, ...details }, 'SCRAPING_SUCCESS');
    },

    logScrapingError: (context: ScrapingContext, error: Error) => {
        scraperLogger.error(`Error en proceso de scraping: ${error.message}`, context, 'SCRAPING_ERROR', error);
    },

    logBrandExtractionStart: (context: ScrapingContext) => {
        scraperLogger.info(`Iniciada extracción de marcas para ${context.store}`, context, 'BRAND_EXTRACTION_START');
    },

    logBrandExtractionSuccess: (context: ScrapingContext, brandsExtracted: number) => {
        scraperLogger.info(`Extracción de marcas completada: ${brandsExtracted} marcas`, { ...context, brandsExtracted }, 'BRAND_EXTRACTION_SUCCESS');
    },

    logProductExtractionStart: (context: ScrapingContext) => {
        scraperLogger.info(`Iniciada extracción de productos en ${context.store}`, context, 'PRODUCT_EXTRACTION_START');
    },

    logProductExtractionSuccess: (context: ScrapingContext, productsExtracted: number, totalProducts?: number) => {
        scraperLogger.info(`Extracción exitosa: ${productsExtracted}/${totalProducts || '?'} productos`, { ...context, productsExtracted, totalProducts }, 'PRODUCT_EXTRACTION_SUCCESS');
    },

    logBrandMatchSuccess: (context: ScrapingContext, brandMatch: any) => {
        scraperLogger.info(`Marca coincidente: ${brandMatch.brandName}`, { ...context, brandMatch }, 'BRAND_MATCHING_SUCCESS');
    },

    logBrandMatchFailure: (context: ScrapingContext, details: any) => {
        scraperLogger.warn(`No se encontró coincidencia de marca para ${context.productTitle}`, { ...context, ...details }, 'BRAND_MATCH_FAILURE');
    },

    logBrandMatchError: (context: ScrapingContext, error: Error) => {
        scraperLogger.error(`Error en coincidencia de marca: ${error.message}`, context, 'BRAND_MATCH_ERROR', error);
    },

    logCategorySaveSuccess: (context: ScrapingContext) => {
        scraperLogger.info(`Categoría ${context.categoryName} guardada`, context, 'CATEGORY_SAVE_SUCCESS');
    },

    logCategorySaveError: (context: ScrapingContext) => {
        scraperLogger.error(`Error guardando categoría ${context.categoryName}`, context, 'CATEGORY_SAVE_ERROR');
    },

    logBrandSaveSuccess: (context: ScrapingContext) => {
        scraperLogger.info(`Marca ${context.brandName} guardada`, context, 'BRAND_SAVE_SUCCESS');
    },

    logBrandSaveError: (context: ScrapingContext) => {
        scraperLogger.error(`Error guardando marca ${context.brandName}`, context, 'BRAND_SAVE_ERROR');
    },

    logDataPersistenceSuccess: (context: ScrapingContext, details: any) => {
        scraperLogger.info(`Datos persistidos correctamente en ${details.collection}`, { ...context, ...details }, 'DATA_PERSISTENCE_SUCCESS');
    },

    logDataPersistenceError: (context: ScrapingContext, details: any) => {
        scraperLogger.error(`Error en persistencia de datos: ${details.error}`, { ...context, ...details }, 'DATA_PERSISTENCE_ERROR');
    },

    logProductValidationError: (context: ScrapingContext) => {
        scraperLogger.warn(`Error de validación en producto: ${context.productTitle}`, context, 'VALIDATION_ERROR');
    },

    logProductSaveSuccess: (context: ScrapingContext) => {
        scraperLogger.info(`Producto guardado: ${context.productTitle}`, context, 'PRODUCT_SAVE_SUCCESS');
    },

    logProductProcessingError: (context: ScrapingContext) => {
        scraperLogger.error(`Error procesando producto: ${context.productTitle}`, context, 'PRODUCT_SCRAPING_ERROR');
    },

    logCategoryMappingSuccess: (context: ScrapingContext, mappingResult: any) => {
        scraperLogger.info(`Categoría mapeada: ${context.categoryName}`, { ...context, mappingResult }, 'CATEGORY_MAPPING_SUCCESS');
    },

    logCategoryMappingError: (context: ScrapingContext, error: Error) => {
        scraperLogger.error(`Error en mapeo de categoría: ${error.message}`, context, 'CATEGORY_MAPPING_ERROR', error);
    },

    async captureHtmlSnapshot(context: ScrapingContext, page: Page): Promise<string | null> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `scraper-${context.store}-${timestamp}.html`;
            const path = `snapshots/${filename}`;
            const html = await page.content();
            logger.debug(`HTML Snapshot capturado (${html.length} bytes)`, { module: 'SCRAPER', store: context.store });
            return path;
        } catch (e) {
            logger.error('Error capturando HTML snapshot', { module: 'SCRAPER', store: context.store, error: e });
            return null;
        }
    },

    async captureScreenshot(context: ScrapingContext, page: Page, reason: string): Promise<string | null> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `scraper-${context.store}-${timestamp}.png`;
            const path = `screenshots/${filename}`;
            await page.screenshot({ path, fullPage: true });

            scraperLogger.info(`Screenshot capturado: ${reason}`, { ...context, screenshotPath: path }, 'SCREENSHOT_CAPTURED');
            return path;
        } catch (e) {
            logger.warn('Error capturando screenshot:', { module: 'SCRAPER', error: e });
            return null;
        }
    },

    async handleErrorWithEvidence(
        context: ScrapingContext,
        page: Page,
        error: Error,
        errorType: ScrapingEventType
    ): Promise<void> {
        try {
            const screenshotPath = await scraperLogger.captureScreenshot(context, page, `Error: ${error.message}`);

            const enhancedContext: ScrapingContext = {
                ...context,
                screenshotPath: screenshotPath || undefined
            };

            scraperLogger.error(`Error en ${context.store}: ${error.message}`, enhancedContext, errorType, error);
        } catch (e) {
            logger.error('Error crítico en handleErrorWithEvidence', { module: 'SCRAPER', error: e });
        }
    }
};
