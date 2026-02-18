import { Job } from 'bullmq';
import { Page } from 'playwright';
import { BrowserFactory } from '../config/browser/BrowserFactory.js';
import logger from '../utils/logger.js';

import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { Product } from '../models/Product.js';
import { StoreName } from '../config/bullmq/QueueConfig.js';
import { slugify } from '../utils/slugify.js';
import { BrandExtractor } from '../shared/utils/BrandExtractor.js';
import { BrandMatcher } from '../shared/utils/BrandMatcher.js';
import { CategoryMapper } from '../shared/utils/CategoryMapper.js';
import { scraperLogger, ScrapingContext, ScrapingEventType } from '../utils/scraperLogger.js';
import { validateScrapedProduct, ScrapedProductInput } from '../shared/validation/ProductValidation.js';

/**
 * Interfaz para datos de categoría descubierta
 */
interface DiscoveredCategory {
    name: string;
    url: string;
    level: number;
    parentPath?: string[];
    brands?: string[];
    productCount?: number;
}

/**
 * Interfaz para datos de marca descubierta
 */
interface DiscoveredBrand {
    name: string;
    url?: string;
    productCount?: number;
    logo?: string;
}

/**
 * Interfaz para producto raspado
 */
interface ScrapedProduct {
    title: string;
    url: string;
    price?: number;
    image?: string;
    description?: string;
    brand?: string;
    category?: string;
}

/**
 * Interfaz para resultados de scraping
 */
interface ScrapingResult {
    categories: DiscoveredCategory[];
    brands: DiscoveredBrand[];
    totalProducts?: number;
    products?: string[];
    updatedProducts?: string[];
    errors: string[];
}

/**
 * Procesador mejorado de trabajos de scraping con extracción de marcas
 */
export const processScraperJob = async (job: Job) => {
    const store = job.data.store as StoreName || StoreName.COTO;
    const action = job.data.action || 'unknown';
    const categoryUrl = job.data.categoryUrl;
    const parentPath = job.data.parentPath || [];

    // Inicializar mapeador de categorías
    const categoryMapper = new CategoryMapper();

    // Inicializar matcher de marcas con soporte para supermercado específico
    const brandMatcher = new BrandMatcher({}, store);
    await brandMatcher.loadBrands();

    // Registrar inicio de actividad con logger especializado
    await scraperLogger.logCategoryDiscoveryStart({
        store,
        jobId: job.id,
        url: categoryUrl,
        categoryPath: parentPath,
        action
    });

    const browserFactory = BrowserFactory.getInstance();
    const context = await browserFactory.createContext();
    let result: ScrapingResult = { categories: [], brands: [], errors: [] };

    try {
        const page = await context.newPage();

        // Configurar stealth y timeouts
        await page.setDefaultTimeout(30000);
        await page.setDefaultNavigationTimeout(30000);

        // Inicializar extractores específicos para esta sesión
        const brandExtractor = new BrandExtractor(page, store);

        switch (job.name) {
            case 'DISCOVER_CATEGORIES':
                result = await discoverCategories(page, store);
                break;

            case 'CRAWL_CATEGORY':
                result = await crawlCategory(page, store, categoryUrl, parentPath, scraperLogger, categoryMapper, brandExtractor);
                break;

            case 'SCRAPE_PRODUCTS':
                result = await scrapeProducts(page, store, categoryUrl, parentPath, scraperLogger, brandMatcher);
                break;

            case 'EXTRACT_BRANDS':
                result = await extractBrandsFromCategory(page, store, categoryUrl, brandExtractor, scraperLogger);
                break;

            default:
                logger.warn(`Nombre de trabajo desconocido: ${job.name}`, {
                    module: 'SCRAPER_ENHANCED'
                });
                result.errors.push(`Trabajo desconocido: ${job.name}`);
        }

        // Guardar resultados en base de datos
        await saveDiscoveryResults(store, result, parentPath, scraperLogger);

        // Registrar finalización exitosa con logger especializado
        await scraperLogger.logScrapingSuccess({
            store,
            jobName: job.name,
            categoriesFound: result.categories.length,
            brandsFound: result.brands.length,
            errors: result.errors.length
        });

        logger.info(`Completado ${job.name} para ${store}`, {
            module: 'SCRAPER_ENHANCED',
            categoriesFound: result.categories.length,
            brandsFound: result.brands.length,
            errors: result.errors.length
        });

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error(`Error en ${job.name} para ${store}:`, {
            module: 'SCRAPER_ENHANCED',
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        });

        // Registrar error con logger especializado
        await scraperLogger.logScrapingError({
            store,
            jobName: job.name,
            error: error instanceof Error ? error.message : errorMessage,
            jobId: job.id
        });

        throw error;
    } finally {
        // MUY IMPORTANTE: Cerrar el contexto para liberar el navegador al pool
        await context.close();
    }
};

/**
 * Descubre categorías principales desde la home del supermercado
 */
async function discoverCategories(page: Page, store: StoreName): Promise<ScrapingResult> {
    logger.info(`Descubriendo categorías principales para ${store}`, {
        module: 'SCRAPER_ENHANCED'
    });

    const result: ScrapingResult = { categories: [], brands: [], errors: [] };

    try {
        // Navegar a la home del supermercado
        const storeUrls = {
            [StoreName.COTO]: 'https://www.coto.com.ar',
            [StoreName.CARREFOUR]: 'https://www.carrefour.com.ar',
            [StoreName.JUMBO]: 'https://www.jumbo.com.ar',
            [StoreName.VEA]: 'https://www.vea.com.ar',
            [StoreName.DISCO]: 'https://www.disco.com.ar',
            [StoreName.DIA]: 'https://www.dia.com.ar',
            [StoreName.LA_ANONIMA]: 'https://www.laanonima.com.ar'
        };

        const storeUrl = storeUrls[store];
        if (!storeUrl) {
            throw new Error(`URL no configurada para el supermercado: ${store}`);
        }

        await page.goto(storeUrl, { waitUntil: 'networkidle' });

        // Esperar a que se cargue el menú de categorías
        await page.waitForTimeout(2000);

        // Extraer categorías según el supermercado
        switch (store) {
            case StoreName.COTO:
                result.categories = await extractCotoCategories(page);
                break;
            case StoreName.CARREFOUR:
                result.categories = await extractCarrefourCategories(page);
                break;
            case StoreName.JUMBO:
                result.categories = await extractJumboCategories(page);
                break;
            case StoreName.VEA:
                result.categories = await extractVeaCategories(page);
                break;
            case StoreName.DISCO:
                result.categories = await extractDiscoCategories(page);
                break;
            case StoreName.DIA:
                result.categories = await extractDiaCategories(page);
                break;
            default:
                result.errors.push(`Extractor no implementado para ${store}`);
        }

        logger.info(`Categorías descubiertas para ${store}: ${result.categories.length}`, {
            module: 'SCRAPER_ENHANCED'
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        result.errors.push(`Error descubriendo categorías: ${errorMessage}`);
        logger.error(`Error descubriendo categorías para ${store}:`, {
            module: 'SCRAPER_ENHANCED',
            error: errorMessage
        });
    }

    return result;
}

/**
 * Extrae categorías de Coto
 */
async function extractCotoCategories(page: Page): Promise<DiscoveredCategory[]> {
    return await page.evaluate(() => {
        const categories: DiscoveredCategory[] = [];

        // Coto usa un menú lateral con categorías
        const categoryElements = document.querySelectorAll('.menu-departamento a, .categoria-item a');

        categoryElements.forEach((element) => {
            const name = element.textContent?.trim();
            const url = (element as HTMLAnchorElement).href;

            if (name && url && !name.toLowerCase().includes('todo')) {
                categories.push({
                    name,
                    url,
                    level: 1,
                    parentPath: []
                });
            }
        });

        return categories;
    });
}

/**
 * Extrae categorías de Carrefour (VTEX)
 */
async function extractCarrefourCategories(page: Page): Promise<DiscoveredCategory[]> {
    return await page.evaluate(() => {
        const categories: DiscoveredCategory[] = [];

        // Carrefour VTEX usa un menú con clases específicas
        const categoryElements = document.querySelectorAll('.vtex-menu-item a, .departament-menu a');

        categoryElements.forEach((element) => {
            const name = element.textContent?.trim();
            const url = (element as HTMLAnchorElement).href;

            if (name && url && name.length > 2 && !name.toLowerCase().includes('inicio')) {
                categories.push({
                    name,
                    url,
                    level: 1,
                    parentPath: []
                });
            }
        });

        return categories;
    });
}

/**
 * Extrae categorías de Jumbo
 */
async function extractJumboCategories(page: Page): Promise<DiscoveredCategory[]> {
    return await page.evaluate(() => {
        const categories: DiscoveredCategory[] = [];

        // Jumbo usa un menú desplegable
        const categoryElements = document.querySelectorAll('.nav-item a, .category-link a');

        categoryElements.forEach((element) => {
            const name = element.textContent?.trim();
            const url = (element as HTMLAnchorElement).href;

            if (name && url && name.length > 2) {
                categories.push({
                    name,
                    url,
                    level: 1,
                    parentPath: []
                });
            }
        });

        return categories;
    });
}

/**
 * Extrae categorías de Vea
 */
async function extractVeaCategories(page: Page): Promise<DiscoveredCategory[]> {
    return await page.evaluate(() => {
        const categories: DiscoveredCategory[] = [];

        // Vea tiene un menú similar a Jumbo
        const categoryElements = document.querySelectorAll('.menu-item a, .departamento a');

        categoryElements.forEach((element) => {
            const name = element.textContent?.trim();
            const url = (element as HTMLAnchorElement).href;

            if (name && url && name.length > 2) {
                categories.push({
                    name,
                    url,
                    level: 1,
                    parentPath: []
                });
            }
        });

        return categories;
    });
}

/**
 * Extrae categorías de Disco
 */
async function extractDiscoCategories(page: Page): Promise<DiscoveredCategory[]> {
    return await page.evaluate(() => {
        const categories: DiscoveredCategory[] = [];

        // Disco usa VTEX también
        const categoryElements = document.querySelectorAll('.vtex-menu-item a, .menu-departamento a');

        categoryElements.forEach((element) => {
            const name = element.textContent?.trim();
            const url = (element as HTMLAnchorElement).href;

            if (name && url && name.length > 2) {
                categories.push({
                    name,
                    url,
                    level: 1,
                    parentPath: []
                });
            }
        });

        return categories;
    });
}

/**
 * Extrae categorías de Día
 */
async function extractDiaCategories(page: Page): Promise<DiscoveredCategory[]> {
    return await page.evaluate(() => {
        const categories: DiscoveredCategory[] = [];

        // Día tiene un menú más simple
        const categoryElements = document.querySelectorAll('.category-item a, .nav-link a');

        categoryElements.forEach((element) => {
            const name = element.textContent?.trim();
            const url = (element as HTMLAnchorElement).href;

            if (name && url && name.length > 2) {
                categories.push({
                    name,
                    url,
                    level: 1,
                    parentPath: []
                });
            }
        });

        return categories;
    });
}

/**
 * Rastrea una categoría específica y extrae subcategorías y marcas
 */
async function crawlCategory(
    page: Page,
    store: StoreName,
    categoryUrl: string,
    parentPath: string[],
    scraperLogger: typeof scraperLogger,
    categoryMapper: CategoryMapper,
    brandExtractor: BrandExtractor
): Promise<ScrapingResult> {

    await scraperLogger.logCategoryDiscoveryStart({
        store,
        url: categoryUrl,
        categoryPath: parentPath,
        action: 'CRAWL_CATEGORY'
    });

    const result: ScrapingResult = { categories: [], brands: [], errors: [] };

    try {
        await page.goto(categoryUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Extraer subcategorías
        const rawSubcategories = await extractSubcategories(page, store);

        // Mapear categorías con el sistema de normalización
        for (const subcategory of rawSubcategories) {
            try {
                const mappingResult = await categoryMapper.mapCategory(
                    store,
                    parentPath,
                    subcategory.name,
                    categoryUrl
                );

                result.categories.push({
                    ...subcategory,
                    parentPath,
                    level: parentPath.length + 1
                });

                await scraperLogger.logCategoryMappingSuccess({
                    store,
                    categoryName: subcategory.name,
                    mappingResult
                });
            } catch (mappingError) {
                result.errors.push(`Error mapeando categoría ${subcategory.name}: ${mappingError}`);
                await scraperLogger.logCategoryMappingError({
                    store,
                    categoryName: subcategory.name,
                    error: mappingError instanceof Error ? mappingError.message : 'Error desconocido'
                });
            }
        }

        // Extraer marcas usando el BrandExtractor especializado
        const extractedBrands = await brandExtractor.extractBrands();
        result.brands = extractedBrands.map(brand => ({
            name: brand.name,
            url: brand.url,
            productCount: brand.productCount,
            logo: brand.logo
        }));

        await scraperLogger.logBrandExtractionSuccess({
            store,
            url: categoryUrl
        }, result.brands.length);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        result.errors.push(`Error rastreando categoría: ${errorMessage}`);

        await scraperLogger.handleErrorWithEvidence(
            { store, url: categoryUrl },
            page,
            error instanceof Error ? error : new Error(errorMessage),
            'BOT_BLOCKED'
        );
    }

    return result;
}

/**
 * Extrae subcategorías de una página de categoría
 */
async function extractSubcategories(page: Page, store: StoreName): Promise<DiscoveredCategory[]> {
    return await page.evaluate(() => {
        const subcategories: DiscoveredCategory[] = [];

        // Selectores comunes para subcategorías
        const selectors = [
            '.subcategory-item a',
            '.filtro-categoria a',
            '.category-filter a',
            '.departament-filter a',
            '.facet-item a',
            '.filter-item a'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach((element) => {
                    const name = element.textContent?.trim();
                    const url = (element as HTMLAnchorElement).href;

                    if (name && url &&
                        !name.toLowerCase().includes('todo') &&
                        !name.match(/^\d+$/)) { // No números solos
                        subcategories.push({
                            name,
                            url,
                            level: 2,
                            parentPath: []
                        });
                    }
                });
                break; // Usar el primer selector que funcione
            }
        }

        return subcategories;
    }, store);
}

/**
 * Extrae productos de una página de categoría
 */
async function extractProductsFromPage(page: Page): Promise<Array<{ title: string, url: string, price?: number }>> {
    return await page.evaluate(() => {
        const products: Array<{ title: string, url: string, price?: number }> = [];

        // Selectores comunes para productos
        const productSelectors = [
            '.product-item',
            '.product-card',
            '.product-box',
            '.item-product',
            '.product',
            '[data-product]'
        ];

        for (const selector of productSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach((element) => {
                    const titleElement = element.querySelector('.product-title, .product-name, .title, h3, h4');
                    const linkElement = element.querySelector('a');
                    const priceElement = element.querySelector('.price, .product-price, .precio');

                    const title = titleElement?.textContent?.trim();
                    const url = linkElement ? (linkElement as HTMLAnchorElement).href : '';
                    const priceText = priceElement?.textContent?.trim();
                    const price = priceText ? parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined;

                    if (title && url) {
                        products.push({ title, url, price });
                    }
                });
                break; // Usar el primer selector que funcione
            }
        }

        return products;
    });
}

/**
 * Extrae marcas de una página de categoría específica (versión mejorada)
 */
async function extractBrandsFromCategory(
    page: Page,
    store: StoreName,
    categoryUrl: string,
    brandExtractor: BrandExtractor,
    scraperLogger: typeof scraperLogger
): Promise<ScrapingResult> {

    await scraperLogger.logBrandExtractionStart({
        store,
        url: categoryUrl
    });

    const result: ScrapingResult = { categories: [], brands: [], errors: [] };

    try {
        await page.goto(categoryUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Usar el BrandExtractor especializado para extraer marcas
        const extractedBrands = await brandExtractor.extractBrands();

        result.brands = extractedBrands.map(brand => ({
            name: brand.name,
            url: brand.url,
            productCount: brand.productCount,
            logo: brand.logo
        }));

        await scraperLogger.logBrandExtractionSuccess({
            store,
            url: categoryUrl
        }, result.brands.length);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        result.errors.push(`Error extrayendo marcas: ${errorMessage}`);

        await scraperLogger.handleErrorWithEvidence(
            { store, url: categoryUrl },
            page,
            error instanceof Error ? error : new Error(errorMessage),
            'DOM_CHANGE'
        );
    }

    return result;
}

/**
 * Scrapea productos de una categoría con extracción de marcas desde títulos
 */
async function scrapeProducts(
    page: Page,
    store: StoreName,
    categoryUrl: string,
    parentPath: string[],
    scraperLogger: typeof scraperLogger,
    brandMatcher: BrandMatcher
): Promise<ScrapingResult> {

    await scraperLogger.logProductExtractionStart({
        store,
        url: categoryUrl
    });

    const result: ScrapingResult = { categories: [], brands: [], errors: [] };

    try {
        await page.goto(categoryUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Extraer productos de la página
        const products = await extractProductsFromPage(page);

        // Procesar cada producto y extraer marca del título
        for (const product of products) {
            try {
                const brandMatch = await brandMatcher.extractBrandFromTitle(product.title, store);

                if (brandMatch) {
                    await scraperLogger.logBrandMatchSuccess({
                        store,
                        productTitle: product.title,
                        brandMatch
                    });

                    // Agregar marca descubierta a los resultados
                    result.brands.push({
                        name: brandMatch.brandName,
                        url: product.url,
                        productCount: 1
                    });
                } else {
                    await scraperLogger.logBrandMatchFailure({
                        store,
                        productTitle: product.title,
                        attemptedBrands: []
                    });
                }
            } catch (brandError) {
                await scraperLogger.logBrandMatchError({
                    store,
                    productTitle: product.title,
                    error: brandError instanceof Error ? brandError.message : 'Error desconocido'
                });
            }
        }

        await scraperLogger.logProductExtractionSuccess({
            store,
            url: categoryUrl,
            productsExtracted: products.length,
            totalProducts: products.length
        });

        // Procesar y guardar productos
        const productResults = await processAndSaveProducts(
            store,
            products,
            parentPath,
            brandMatcher,
            scraperLogger
        );

        result.products = productResults.saved;
        result.updatedProducts = productResults.updated;
        result.errors.push(...productResults.errors);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        result.errors.push(`Error scrapeando productos: ${errorMessage}`);

        await scraperLogger.handleErrorWithEvidence(
            { store, url: categoryUrl },
            page,
            error instanceof Error ? error : new Error(errorMessage),
            'VALIDATION_ERROR'
        );
    }

    return result;
}

/**
 * Guarda los resultados del descubrimiento en base de datos con mapeo de marcas
 */
async function saveDiscoveryResults(
    store: StoreName,
    result: ScrapingResult,
    parentPath: string[],
    scraperLogger: typeof scraperLogger
) {

    const savedCategories: string[] = [];
    const savedBrands: string[] = [];
    const errors: string[] = [];

    try {
        // Guardar categorías
        for (const category of result.categories) {
            try {
                const categoryData = {
                    name: {
                        es: category.name,
                        en: category.name
                    },
                    slug: category.name.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, ''),
                    store: store,
                    level: category.level,
                    parentPath: parentPath,
                    url: category.url,
                    productCount: category.productCount || 0,
                    isActive: true,
                    discoveredAt: new Date()
                };

                const savedCategory = await Category.findOneAndUpdate(
                    {
                        'name.es': category.name,
                        store: store,
                        level: category.level
                    },
                    categoryData,
                    { upsert: true, new: true }
                );

                const categoryName = typeof savedCategory.name === 'string' ? savedCategory.name : savedCategory.name.es || savedCategory.name.en || 'Unknown';
                savedCategories.push(categoryName);

                await scraperLogger.logCategorySaveSuccess({
                    store,
                    categoryName: category.name,
                    categoryId: savedCategory._id.toString()
                });

            } catch (categoryError) {
                const errorMsg = `Error guardando categoría ${category.name}: ${categoryError instanceof Error ? categoryError.message : 'Error desconocido'}`;
                errors.push(errorMsg);

                await scraperLogger.logCategorySaveError({
                    store,
                    categoryName: category.name,
                    error: categoryError instanceof Error ? categoryError.message : 'Error desconocido'
                });
            }
        }

        // Guardar marcas
        for (const brand of result.brands) {
            try {
                const brandData = {
                    name: brand.name,
                    slug: brand.name.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, ''),
                    logo: brand.logo || '',
                    isActive: true,
                    stores: [store],
                    productCount: brand.productCount || 0,
                    discoveredAt: new Date(),
                    discoveredInCategories: parentPath
                };

                const savedBrand = await Brand.findOneAndUpdate(
                    { name: brand.name },
                    {
                        $set: brandData,
                        $addToSet: { stores: store }
                    },
                    { upsert: true, new: true }
                );

                savedBrands.push(savedBrand.name);

                await scraperLogger.logBrandSaveSuccess({
                    store,
                    brandName: brand.name,
                    brandId: savedBrand._id.toString()
                });

            } catch (brandError) {
                const errorMsg = `Error guardando marca ${brand.name}: ${brandError instanceof Error ? brandError.message : 'Error desconocido'}`;
                errors.push(errorMsg);

                await scraperLogger.logBrandSaveError({
                    store,
                    brandName: brand.name,
                    error: brandError instanceof Error ? brandError.message : 'Error desconocido'
                });
            }
        }

        await scraperLogger.logDataPersistenceSuccess({
            store,
            url: 'product_processing',
            itemsSaved: savedCategories.length + savedBrands.length,
            collection: 'categories_and_brands'
        }, {
            categoriesSaved: savedCategories.length,
            brandsSaved: savedBrands.length,
            errors: errors.length,
            collection: 'categories_and_brands'
        });

        logger.info(`Resultados guardados: ${savedCategories.length} categorías, ${savedBrands.length} marcas`, {
            module: 'SCRAPER_ENHANCED'
        });

        if (errors.length > 0) {
            logger.warn(`Errores durante el guardado: ${errors.length}`, {
                module: 'SCRAPER_ENHANCED',
                errors: errors.slice(0, 5) // Mostrar primeros 5 errores
            });
        }

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        logger.error(`Error guardando resultados:`, {
            module: 'SCRAPER_ENHANCED',
            error: errorMsg
        });

        await scraperLogger.logDataPersistenceError({
            store,
            url: 'unknown',
            collection: 'categories_and_brands',
            error: errorMsg
        });
    }
}

/**
 * Procesa y guarda productos con el modelo mejorado y validación
 */
async function processAndSaveProducts(
    store: StoreName,
    scrapedProducts: ScrapedProduct[],
    categoryPath: string[],
    brandMatcher: BrandMatcher,
    scraperLogger: typeof scraperLogger
) {
    const savedProducts: string[] = [];
    const errors: string[] = [];
    const updatedProducts: string[] = [];

    for (const scrapedProduct of scrapedProducts) {
        try {
            // Validar el producto scrapeado
            const validationResult = validateScrapedProduct(scrapedProduct);

            if (!validationResult.success) {
                const errorMsg = `Error de validación: ${validationResult.error.issues.map((e: { message: string }) => e.message).join(', ')}`;
                errors.push(errorMsg);

                await scraperLogger.logProductValidationError({
                    store,
                    productTitle: scrapedProduct.title,
                    errors: validationResult.error.issues.map((issue: { message: string }) => issue.message)
                });
                continue;
            }

            const validatedProduct: ScrapedProductInput = validationResult.data;

            // Extraer marca del título
            const brandMatch = await brandMatcher.extractBrandFromTitle(validatedProduct.title, store);
            let brandId = null;

            if (brandMatch && brandMatcher.isReliableMatch(brandMatch)) {
                // Buscar o crear la marca
                const brand = await Brand.findOneAndUpdate(
                    { name: brandMatch.brandName },
                    {
                        name: brandMatch.brandName,
                        slug: brandMatch.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        stores: [store],
                        isActive: true
                    },
                    { upsert: true, new: true }
                );
                brandId = brand._id;
            }

            // Buscar producto existente por EAN o crear nuevo
            let product = null;
            let isNewProduct = false;

            if (validatedProduct.ean) {
                // Buscar por EAN en variantes
                product = await Product.findOne({ 'variants.ean': validatedProduct.ean });
            }

            if (!product && validatedProduct.storeProductId) {
                // Buscar por ID del supermercado
                product = await Product.findOne({
                    'sources.store': store,
                    'sources.storeProductId': validatedProduct.storeProductId
                });
            }

            if (!product) {
                // Generar slug para buscar coincidencias por nombre
                const slug = slugify(validatedProduct.title);

                // Buscar por slug (nombre normalizado)
                product = await Product.findOne({ slug: slug });
            }

            if (!product) {
                // Crear nuevo producto
                isNewProduct = true;
                product = new Product({
                    name: { es: validatedProduct.title },
                    brand: brandId,
                    category: null, // Se asignará más tarde
                    price: validatedProduct.price,
                    currency: validatedProduct.currency,
                    available: validatedProduct.available,
                    stock: validatedProduct.stock,
                    description: validatedProduct.description ? { es: validatedProduct.description } : undefined,
                    images: validatedProduct.images,
                    imageUrl: validatedProduct.images?.[0],
                    unit: validatedProduct.unit,
                    weight: validatedProduct.weight,
                    sources: [{
                        store: store,
                        storeProductId: validatedProduct.storeProductId,
                        price: validatedProduct.price,
                        categoryPath: categoryPath,
                        originalUrl: validatedProduct.url,
                        lastScraped: validatedProduct.scrapedAt,
                        availabilityStatus: validatedProduct.available ? 'available' : 'out_of_stock'
                    }],
                    variants: [{
                        ean: validatedProduct.ean || `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        price: validatedProduct.price,
                        originalPrice: validatedProduct.originalPrice,
                        stock: validatedProduct.stock,
                        available: validatedProduct.available,
                        images: validatedProduct.images,
                        weight: validatedProduct.weight,
                        packageSize: validatedProduct.packageSize,
                        packageType: validatedProduct.packageType
                    }],
                    scrapingMetadata: {
                        firstSeenAt: new Date(),
                        lastUpdatedAt: new Date(),
                        updateCount: 0,
                        confidenceScore: validatedProduct.confidenceScore || 0.8,
                        dataQuality: 'medium'
                    }
                });

                await product.save();
                savedProducts.push(validatedProduct.title);

                await scraperLogger.logProductSaveSuccess({
                    store,
                    productTitle: validatedProduct.title,
                    productId: product._id.toString(),
                    isNew: isNewProduct
                });
            } else {
                // Actualizar producto existente
                if (validatedProduct.ean) {
                    const existingVariant = product.findVariantByEAN(validatedProduct.ean);

                    if (existingVariant) {
                        // Actualizar variante existente
                        existingVariant.price = validatedProduct.price;
                        existingVariant.originalPrice = validatedProduct.originalPrice;
                        existingVariant.stock = validatedProduct.stock;
                        existingVariant.available = validatedProduct.available;
                        existingVariant.images = validatedProduct.images;
                        existingVariant.weight = validatedProduct.weight;
                        existingVariant.packageSize = validatedProduct.packageSize;
                        existingVariant.packageType = validatedProduct.packageType;
                    } else {
                        // Agregar nueva variante
                        product.variants.push({
                            ean: validatedProduct.ean,
                            price: validatedProduct.price,
                            originalPrice: validatedProduct.originalPrice,
                            stock: validatedProduct.stock,
                            available: validatedProduct.available,
                            images: validatedProduct.images,
                            weight: validatedProduct.weight,
                            packageSize: validatedProduct.packageSize,
                            packageType: validatedProduct.packageType
                        });
                    }
                }

                // Actualizar información general del producto
                if (validatedProduct.images && validatedProduct.images.length > 0) {
                    const existingImages = product.images || [];
                    product.images = Array.from(new Set([...existingImages, ...validatedProduct.images]));
                    if (!product.imageUrl) {
                        product.imageUrl = validatedProduct.images[0];
                    }
                }

                // Actualizar source del supermercado
                await product.addOrUpdateSource({
                    store: store,
                    storeProductId: validatedProduct.storeProductId,
                    price: validatedProduct.price,
                    categoryPath: categoryPath,
                    originalUrl: validatedProduct.url,
                    lastScraped: validatedProduct.scrapedAt,
                    availabilityStatus: validatedProduct.available ? 'available' : 'out_of_stock'
                });

                // Actualizar metadata
                await product.updateScrapingMetadata(
                    validatedProduct.confidenceScore || 0.8,
                    'medium'
                );

                updatedProducts.push(validatedProduct.title);

                await scraperLogger.logProductSaveSuccess({
                    store,
                    productTitle: validatedProduct.title,
                    productId: product._id.toString(),
                    isNew: false
                });
            }

        } catch (error) {
            const errorMsg = `Error procesando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`;
            errors.push(errorMsg);

            await scraperLogger.logProductProcessingError({
                store,
                productTitle: scrapedProduct.title,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    return {
        saved: savedProducts,
        updated: updatedProducts,
        errors: errors,
        total: scrapedProducts.length
    };
}