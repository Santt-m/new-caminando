import { Activity } from '../../models/Activity.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import logger from '../../utils/logger.js';
import { Page } from 'playwright';

/**
 * Tipo para detalles adicionales
 */
type AdditionalDetails = Record<string, unknown>;

/**
 * Interfaz para resultado de coincidencia de marca
 */
interface BrandMatchResult {
    brandName: string;
    confidence: number;
    method: string;
    brandId?: string;
}

/**
 * Interfaz para resultado de mapeo de categoría
 */
interface CategoryMappingResult {
    masterCategoryId: string;
    confidence: number;
    method: string;
    reason?: string;
}

/**
 * Tipos de eventos de scraping
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
    | 'DOM_CHANGE_DETECTED'
    | 'CATEGORY_SAVE_SUCCESS'
    | 'CATEGORY_SAVE_ERROR'
    | 'BRAND_SAVE_SUCCESS'
    | 'BRAND_SAVE_ERROR'
    | 'PRODUCT_SAVE_SUCCESS'
    | 'PRODUCT_SAVE_ERROR'
    | 'DATA_PERSISTENCE_SUCCESS'
    | 'DATA_PERSISTENCE_ERROR'
    | 'VALIDATION_ERROR'
    | 'DOM_CHANGE_DETECTED'
    | 'SCREENSHOT_CAPTURED'
    | 'DATA_SAVED'
    | 'DATA_VALIDATION_FAILED';

/**
 * Niveles de severidad
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

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
    errorDetails?: AdditionalDetails;
    retryCount?: number;
    executionTime?: number;
    itemsProcessed?: number;
    itemsFound?: number;
    validationErrors?: string[];
    action?: string;
}

/**
 * Interfaz para configuración del logger
 */
export interface ScraperLoggerConfig {
    enableActivityLogging: boolean;
    enableFileLogging: boolean;
    enableConsoleLogging: boolean;
    screenshotOnError: boolean;
    htmlSnapshotOnError: boolean;
    maxRetries: number;
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: ScraperLoggerConfig = {
    enableActivityLogging: true,
    enableFileLogging: true,
    enableConsoleLogging: true,
    screenshotOnError: true,
    htmlSnapshotOnError: true,
    maxRetries: 3
};

/**
 * Logger especializado para scraping con integración al sistema de actividades
 */
export class ScraperLogger {
    private config: ScraperLoggerConfig;

    constructor(config: Partial<ScraperLoggerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Log de inicio de descubrimiento de categorías
     */
    async logCategoryDiscoveryStart(context: ScrapingContext, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Iniciado descubrimiento de categorías para ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            action: 'category_discovery_start',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'CATEGORY_DISCOVERY_START',
            message,
            context,
            details
        });
    }

    /**
     * Log de éxito en descubrimiento de categorías
     */
    async logCategoryDiscoverySuccess(
        context: ScrapingContext, 
        categoriesFound: number,
        brandsFound: number,
        additionalDetails?: AdditionalDetails
    ): Promise<void> {
        const message = `Descubrimiento de categorías completado para ${context.store}: ${categoriesFound} categorías, ${brandsFound} marcas`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            categoriesFound,
            brandsFound,
            action: 'category_discovery_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'CATEGORY_DISCOVERY_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en descubrimiento de categorías
     */
    async logCategoryDiscoveryError(context: ScrapingContext, error: Error, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error en descubrimiento de categorías para ${context.store}: ${error.message}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            error: error.message,
            stack: error.stack,
            action: 'category_discovery_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'CATEGORY_DISCOVERY_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de guardado exitoso de categoría
     */
    async logCategorySaveSuccess(context: ScrapingContext & { categoryName: string; categoryId: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Categoría ${context.categoryName} guardada exitosamente en ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            categoryName: context.categoryName,
            categoryId: context.categoryId,
            action: 'category_save_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'CATEGORY_DISCOVERY_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en guardado de categoría
     */
    async logCategorySaveError(context: ScrapingContext & { categoryName: string; error: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error guardando categoría ${context.categoryName} en ${context.store}: ${context.error}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            categoryName: context.categoryName,
            error: context.error,
            action: 'category_save_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'CATEGORY_DISCOVERY_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de inicio de extracción de marcas
     */
    async logBrandExtractionStart(context: ScrapingContext, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Iniciado extracción de marcas para ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            action: 'brand_extraction_start',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'BRAND_EXTRACTION_START',
            message,
            context,
            details
        });
    }

    /**
     * Log de éxito en extracción de marcas
     */
    async logBrandExtractionSuccess(
        context: ScrapingContext, 
        brandsExtracted: number,
        additionalDetails?: AdditionalDetails
    ): Promise<void> {
        const message = `Extracción de marcas completada para ${context.store}: ${brandsExtracted} marcas encontradas`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            brandsExtracted,
            action: 'brand_extraction_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'BRAND_EXTRACTION_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en extracción de marcas
     */
    async logBrandExtractionError(context: ScrapingContext, error: Error, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error en extracción de marcas para ${context.store}: ${error.message}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            error: error.message,
            stack: error.stack,
            action: 'brand_extraction_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'BRAND_EXTRACTION_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de inicio de scraping de productos
     */
    async logProductScrapingStart(context: ScrapingContext, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Iniciado scraping de productos para ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            action: 'product_scraping_start',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'PRODUCT_SCRAPING_START',
            message,
            context,
            details
        });
    }

    /**
     * Log de éxito en scraping de productos
     */
    async logProductScrapingSuccess(
        context: ScrapingContext, 
        productsScraped: number,
        additionalDetails?: AdditionalDetails
    ): Promise<void> {
        const message = `Scraping de productos completado para ${context.store}: ${productsScraped} productos procesados`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            productsScraped,
            action: 'product_scraping_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'PRODUCT_SCRAPING_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en scraping de productos
     */
    async logProductScrapingError(context: ScrapingContext, error: Error, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error en scraping de productos para ${context.store}: ${error.message}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            error: error.message,
            stack: error.stack,
            action: 'product_scraping_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'PRODUCT_SCRAPING_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de fallo de selector
     */
    async logSelectorFailure(context: ScrapingContext, selector: string, error: Error, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Falló selector "${selector}" para ${context.store}: ${error.message}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            selector,
            error: error.message,
            stack: error.stack,
            action: 'selector_failure',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'warn',
            eventType: 'SELECTOR_FAILURE',
            message,
            context,
            details
        });
    }

    /**
     * Log de detección de bot
     */
    async logBotDetection(context: ScrapingContext, details?: Record<string, unknown>): Promise<void> {
        const message = `Detección de bot en ${context.store}`;
        const logDetails = {
            ...this.buildBaseDetails(context),
            ...details,
            action: 'bot_detection',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'warn',
            eventType: 'BOT_DETECTION',
            message,
            context,
            details: logDetails
        });
    }

    /**
     * Log de límite de tasa alcanzado
     */
    async logRateLimitHit(context: ScrapingContext, retryAfter?: number, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Límite de tasa alcanzado para ${context.store}${retryAfter ? `, reintentar después de ${retryAfter}s` : ''}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            retryAfter,
            action: 'rate_limit_hit',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'warn',
            eventType: 'RATE_LIMIT_HIT',
            message,
            context,
            details
        });
    }

    /**
     * Log de error de red
     */
    async logNetworkError(context: ScrapingContext, error: Error, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error de red para ${context.store}: ${error.message}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            error: error.message,
            stack: error.stack,
            action: 'network_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'NETWORK_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de error de validación
     */
    async logValidationError(context: ScrapingContext, validationErrors: string[], additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Errores de validación para ${context.store}: ${validationErrors.length} errores`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            validationErrors,
            action: 'validation_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'warn',
            eventType: 'VALIDATION_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de cambio detectado en el DOM
     */
    async logDomChangeDetected(context: ScrapingContext, selector: string, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Cambio en DOM detectado para ${context.store}, selector: ${selector}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            selector,
            action: 'dom_change_detected',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'warn',
            eventType: 'DOM_CHANGE_DETECTED',
            message,
            context,
            details
        });
    }

    /**
     * Log de captura de screenshot
     */
    async logScreenshotCaptured(context: ScrapingContext, screenshotPath: string, reason: string, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Screenshot capturado para ${context.store}: ${reason}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            screenshotPath,
            captureReason: reason,
            action: 'screenshot_captured',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'SCREENSHOT_CAPTURED',
            message,
            context,
            details
        });
    }

    /**
     * Log de datos guardados
     */
    async logDataSaved(context: ScrapingContext, itemsSaved: number, collection: string, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Datos guardados para ${context.store}: ${itemsSaved} items en ${collection}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            itemsSaved,
            collection,
            action: 'data_saved',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'DATA_SAVED',
            message,
            context,
            details
        });
    }

    /**
     * Log de fallo de validación de datos
     */
    async logDataValidationFailed(context: ScrapingContext, validationErrors: string[], additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Validación de datos fallida para ${context.store}: ${validationErrors.length} errores`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            validationErrors,
            action: 'data_validation_failed',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'DATA_VALIDATION_FAILED',
            message,
            context,
            details
        });
    }

    /**
     * Método genérico de logging
     */
    private async log(params: {
        level: LogLevel;
        eventType: ScrapingEventType;
        message: string;
        context: ScrapingContext;
        details: AdditionalDetails;
    }): Promise<void> {
        const { level, eventType, message, context, details } = params;

        // Logging a archivo/consola
        if (this.config.enableFileLogging || this.config.enableConsoleLogging) {
            const logData = {
                module: 'SCRAPER',
                store: context.store,
                eventType,
                jobId: context.jobId,
                details
            };
            
            switch (level) {
                case 'error':
                    logger.error(`[Scraper] ${message}`, logData);
                    break;
                case 'warn':
                    logger.warn(`[Scraper] ${message}`, logData);
                    break;
                case 'info':
                    logger.info(`[Scraper] ${message}`, logData);
                    break;
                case 'debug':
                    logger.debug(`[Scraper] ${message}`, logData);
                    break;
                default:
                    logger.info(`[Scraper] ${message}`, logData);
            }
        }

        // Logging a base de datos (Activity model)
        if (this.config.enableActivityLogging) {
            try {
                await Activity.create({
                    module: 'SCRAPER',
                    eventType,
                    level,
                    message,
                    details,
                    ip: 'system',
                    userAgent: 'scraper-worker'
                });
            } catch (error) {
                logger.error('Error guardando actividad de scraping:', {
                    module: 'SCRAPER_LOGGER',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        }
    }

    /**
     * Construye detalles base del contexto
     */
    private buildBaseDetails(context: ScrapingContext): AdditionalDetails {
        const baseDetails: AdditionalDetails = {
            store: context.store,
            timestamp: new Date().toISOString()
        };

        if (context.jobId) baseDetails.jobId = context.jobId;
        if (context.categoryId) baseDetails.categoryId = context.categoryId;
        if (context.categoryName) baseDetails.categoryName = context.categoryName;
        if (context.categoryPath) baseDetails.categoryPath = context.categoryPath;
        if (context.brandId) baseDetails.brandId = context.brandId;
        if (context.brandName) baseDetails.brandName = context.brandName;
        if (context.productId) baseDetails.productId = context.productId;
        if (context.productTitle) baseDetails.productTitle = context.productTitle;
        if (context.productEan) baseDetails.productEan = context.productEan;
        if (context.url) baseDetails.url = context.url;
        if (context.selector) baseDetails.selector = context.selector;
        if (context.screenshotPath) baseDetails.screenshotPath = context.screenshotPath;
        if (context.htmlSnapshotPath) baseDetails.htmlSnapshotPath = context.htmlSnapshotPath;
        if (context.retryCount !== undefined) baseDetails.retryCount = context.retryCount;
        if (context.executionTime !== undefined) baseDetails.executionTime = context.executionTime;
        if (context.itemsProcessed !== undefined) baseDetails.itemsProcessed = context.itemsProcessed;
        if (context.itemsFound !== undefined) baseDetails.itemsFound = context.itemsFound;
        if (context.validationErrors) baseDetails.validationErrors = context.validationErrors;

        return baseDetails;
    }

    /**
     * Captura screenshot si está habilitado
     */
    async captureScreenshot(context: ScrapingContext, page: Page, reason: string): Promise<string | null> {
        if (!this.config.screenshotOnError) return null;

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `scraper-${context.store}-${timestamp}.png`;
            const path = `screenshots/${filename}`;

            await page.screenshot({ 
                path,
                fullPage: true,
                timeout: 30000
            });

            await this.logScreenshotCaptured(context, path, reason);
            return path;

        } catch (error) {
            logger.error('Error capturando screenshot:', {
                module: 'SCRAPER_LOGGER',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return null;
        }
    }

    /**
     * Captura HTML snapshot si está habilitado
     */
    async captureHtmlSnapshot(context: ScrapingContext, page: Page): Promise<string | null> {
        if (!this.config.htmlSnapshotOnError) return null;

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `scraper-${context.store}-${timestamp}.html`;
            const path = `snapshots/${filename}`;

            const content = await page.content();
            const fs = await import('fs/promises');
            await fs.writeFile(path, content, 'utf8');

            return path;

        } catch (error) {
            logger.error('Error capturando HTML snapshot:', {
                module: 'SCRAPER_LOGGER',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return null;
        }
    }

    /**
     * Maneja errores con captura de evidencia
     */
    async handleErrorWithEvidence(
        context: ScrapingContext, 
        page: Page, 
        error: Error, 
        errorType: ScrapingEventType
    ): Promise<void> {
        let screenshotPath: string | null = null;
        let htmlSnapshotPath: string | null = null;

        try {
            // Capturar evidencia
            screenshotPath = await this.captureScreenshot(context, page, `Error: ${error.message}`);
            htmlSnapshotPath = await this.captureHtmlSnapshot(context, page);

            // Actualizar contexto con rutas de evidencia
            const enhancedContext: ScrapingContext = {
                ...context,
                screenshotPath: screenshotPath || undefined,
                htmlSnapshotPath: htmlSnapshotPath || undefined,
                errorDetails: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                }
            };

            // Log del error con evidencia
            switch (errorType) {
                case 'SELECTOR_FAILURE':
                    await this.logSelectorFailure(enhancedContext, context.selector || 'unknown', error);
                    break;
                case 'BOT_DETECTION':
                    await this.logBotDetection(enhancedContext);
                    break;
                case 'NETWORK_ERROR':
                    await this.logNetworkError(enhancedContext, error);
                    break;
                case 'VALIDATION_ERROR':
                    await this.logValidationError(enhancedContext, context.validationErrors || []);
                    break;
                default:
                    await this.logProductScrapingError(enhancedContext, error);
                    break;
            }

        } catch (captureError) {
            logger.error('Error manejando error con evidencia:', {
                module: 'SCRAPER_LOGGER',
                originalError: error.message,
                captureError: captureError instanceof Error ? captureError.message : 'Error desconocido'
            });
        }
    }

    /**
     * Log de validación de producto
     */
    async logProductValidationError(context: ScrapingContext & { productTitle: string; errors: string[] }): Promise<void> {
        const message = `Error de validación para producto ${context.productTitle} en ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            productTitle: context.productTitle,
            validationErrors: context.errors,
            action: 'product_validation_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'VALIDATION_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de guardado exitoso de producto
     */
    async logProductSaveSuccess(context: ScrapingContext & { productTitle: string; productId: string; isNew: boolean }): Promise<void> {
        const action = context.isNew ? 'creación' : 'actualización';
        const message = `Producto ${context.productTitle} ${action} exitosa en ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            productTitle: context.productTitle,
            productId: context.productId,
            isNew: context.isNew,
            action: 'product_save_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'DATA_SAVED',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en procesamiento de producto
     */
    async logProductProcessingError(context: ScrapingContext & { productTitle: string; error: string }): Promise<void> {
        const message = `Error procesando producto ${context.productTitle} en ${context.store}: ${context.error}`;
        const details = {
            ...this.buildBaseDetails(context),
            productTitle: context.productTitle,
            error: context.error,
            action: 'product_processing_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'PRODUCT_SCRAPING_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de coincidencia exitosa de marca
     */
    async logBrandMatchSuccess(context: ScrapingContext & { productTitle: string; brandMatch: BrandMatchResult }): Promise<void> {
        const message = `Marca detectada para producto ${context.productTitle} en ${context.store}: ${context.brandMatch.brandName}`;
        const details = {
            ...this.buildBaseDetails(context),
            productTitle: context.productTitle,
            brandMatch: context.brandMatch,
            action: 'brand_match_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'BRAND_MATCHING_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de guardado exitoso de marca
     */
    async logBrandSaveSuccess(context: ScrapingContext & { brandName: string; brandId: string }): Promise<void> {
        const message = `Marca ${context.brandName} guardada exitosamente en ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            brandName: context.brandName,
            brandId: context.brandId,
            action: 'brand_save_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'BRAND_EXTRACTION_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en guardado de marca
     */
    async logBrandSaveError(context: ScrapingContext & { brandName: string; error: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error guardando marca ${context.brandName} en ${context.store}: ${context.error}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            brandName: context.brandName,
            error: context.error,
            action: 'brand_save_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'BRAND_EXTRACTION_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de guardado exitoso de datos de persistencia
     */
    async logDataPersistenceSuccess(context: ScrapingContext & { itemsSaved: number; collection: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Datos de persistencia guardados exitosamente en ${context.store}: ${context.itemsSaved} items en ${context.collection}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            itemsSaved: context.itemsSaved,
            collection: context.collection,
            action: 'data_persistence_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'DATA_SAVED',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en guardado de datos de persistencia
     */
    async logDataPersistenceError(context: ScrapingContext & { collection: string; error: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error guardando datos de persistencia en ${context.store} para ${context.collection}: ${context.error}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            collection: context.collection,
            error: context.error,
            action: 'data_persistence_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'DATA_SAVED',
            message,
            context,
            details
        });
    }

    /**
     * Log de éxito en scraping general
     */
    async logScrapingSuccess(context: ScrapingContext & { jobName: string; categoriesFound: number; brandsFound: number; errors: number }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Scraping completado exitosamente para ${context.store}: ${context.jobName}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            jobName: context.jobName,
            categoriesFound: context.categoriesFound,
            brandsFound: context.brandsFound,
            errors: context.errors,
            action: 'scraping_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'SCRAPING_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en scraping general
     */
    async logScrapingError(context: ScrapingContext & { jobName: string; error: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error en scraping para ${context.store}: ${context.jobName} - ${context.error}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            jobName: context.jobName,
            error: context.error,
            action: 'scraping_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'SCRAPING_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de inicio de extracción de productos
     */
    async logProductExtractionStart(context: ScrapingContext, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Iniciando extracción de productos para ${context.store}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            action: 'product_extraction_start',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'PRODUCT_EXTRACTION_START',
            message,
            context,
            details
        });
    }

    /**
     * Log de éxito en extracción de productos
     */
    async logProductExtractionSuccess(context: ScrapingContext & { productsExtracted: number; totalProducts: number }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Extracción de productos completada para ${context.store}: ${context.productsExtracted}/${context.totalProducts}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            productsExtracted: context.productsExtracted,
            totalProducts: context.totalProducts,
            action: 'product_extraction_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'PRODUCT_EXTRACTION_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de fallo en match de marca
     */
    async logBrandMatchFailure(context: ScrapingContext & { productTitle: string; attemptedBrands: string[] }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `No se encontró marca para producto en ${context.store}: ${context.productTitle}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            productTitle: context.productTitle,
            attemptedBrands: context.attemptedBrands,
            action: 'brand_match_failure',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'warn',
            eventType: 'BRAND_MATCH_FAILURE',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en match de marca
     */
    async logBrandMatchError(context: ScrapingContext & { productTitle: string; error: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error al intentar matchear marca para producto en ${context.store}: ${context.productTitle} - ${context.error}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            productTitle: context.productTitle,
            error: context.error,
            action: 'brand_match_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'BRAND_MATCH_ERROR',
            message,
            context,
            details
        });
    }

    /**
     * Log de éxito en mapeo de categorías
     */
    async logCategoryMappingSuccess(context: ScrapingContext & { categoryName: string; mappingResult: CategoryMappingResult }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Mapeo de categoría exitoso en ${context.store}: ${context.categoryName}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            categoryName: context.categoryName,
            mappingResult: context.mappingResult,
            action: 'category_mapping_success',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'info',
            eventType: 'CATEGORY_MAPPING_SUCCESS',
            message,
            context,
            details
        });
    }

    /**
     * Log de error en mapeo de categorías
     */
    async logCategoryMappingError(context: ScrapingContext & { categoryName: string; error: string }, additionalDetails?: AdditionalDetails): Promise<void> {
        const message = `Error en mapeo de categoría en ${context.store}: ${context.categoryName} - ${context.error}`;
        const details = {
            ...this.buildBaseDetails(context),
            ...additionalDetails,
            categoryName: context.categoryName,
            error: context.error,
            action: 'category_mapping_error',
            timestamp: new Date().toISOString()
        };

        await this.log({
            level: 'error',
            eventType: 'CATEGORY_MAPPING_ERROR',
            message,
            context,
            details
        });
    }
}
