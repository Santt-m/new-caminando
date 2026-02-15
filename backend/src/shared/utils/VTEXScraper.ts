import { Page } from 'playwright';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import logger from '../../utils/logger.js';

/**
 * Interfaces para tipos VTEX
 */
interface VTEXClusterHighlights {
    [key: string]: string;
}

interface VTEXProductClusters {
    [key: string]: string;
}

interface VTEXSearchableClusters {
    [key: string]: string;
}

interface VTEXDimensions {
    [key: string]: string;
}

interface VTEXMeasures {
    [key: string]: string;
}

interface VTEXSku {
    sku: number;
    skuname: string;
    dimensions: VTEXDimensions;
    available: boolean;
    availablequantity: number;
    cacheVersionUsedToCallCheckout: string;
    listPriceFormated: string;
    listPrice: number;
    bestPriceFormated: string;
    bestPrice: number;
    spotPrice: number;
    installments: number;
    installmentsValue: number;
    installmentsInsterestRate: number;
    image: string;
    sellerId: string;
    seller: string;
    measures: VTEXMeasures;
    unitMultiplier: number;
    rewardValue: number;
    giftSkuIds: string[];
    giftList: VTEXGiftItem[];
}

interface VTEXGiftItem {
    skuId: string;
    quantity: number;
}

/**
 * Interfaz para la configuración VTEX
 */
export interface VTEXConfig {
    accountName: string;
    environment: string;
    apiVersion: string;
    categoryPageSize: number;
    maxRetries: number;
    selectors: {
        productContainer: string;
        productLink: string;
        productName: string;
        productPrice: string;
        productImage: string;
        categoryBreadcrumb: string;
        brandFilter: string;
        pagination: string;
        loadingSpinner: string;
    };
    endpoints: {
        products: string;
        categories: string;
        brands: string;
        facets: string;
    };
}

/**
 * Configuración específica de VTEX para cada supermercado
 */
export const VTEX_CONFIG: Record<StoreName, VTEXConfig> = {
    [StoreName.CARREFOUR]: {
        accountName: 'carrefourar',
        environment: 'vtexcommercestable',
        apiVersion: 'v1',
        categoryPageSize: 50,
        maxRetries: 3,
        selectors: {
            productContainer: '.vtex-search-result-3-x-galleryItem',
            productLink: '.vtex-product-summary-2-x-productNameContainer a',
            productName: '.vtex-product-summary-2-x-productBrand',
            productPrice: '.vtex-product-price-1-x-sellingPriceValue',
            productImage: '.vtex-product-summary-2-x-imageNormal',
            categoryBreadcrumb: '.vtex-breadcrumb-1-x-container a',
            brandFilter: '.vtex-search-result-3-x-filterItem--marca',
            pagination: '.vtex-search-result-3-x-pagination button',
            loadingSpinner: '.vtex-search-result-3-x-loadingSpinner'
        },
        endpoints: {
            products: '/api/catalog_system/pub/products/search',
            categories: '/api/catalog_system/pub/category/tree',
            brands: '/api/catalog_system/pub/brand/list',
            facets: '/api/catalog_system/pub/facets/search'
        }
    },
    [StoreName.COTO]: {
        accountName: 'coto',
        environment: 'vtexcommercestable',
        apiVersion: 'v1',
        categoryPageSize: 48,
        maxRetries: 3,
        selectors: {
            productContainer: '.product-item',
            productLink: '.product-item a',
            productName: '.product-item-name',
            productPrice: '.product-price',
            productImage: '.product-item-image',
            categoryBreadcrumb: '.breadcrumb a',
            brandFilter: '.filter-brand',
            pagination: '.pagination button',
            loadingSpinner: '.loading-spinner'
        },
        endpoints: {
            products: '/api/catalog_system/pub/products/search',
            categories: '/api/catalog_system/pub/category/tree',
            brands: '/api/catalog_system/pub/brand/list',
            facets: '/api/catalog_system/pub/facets/search'
        }
    },
    [StoreName.DIA]: {
        accountName: 'diaargentina',
        environment: 'vtexcommercestable',
        apiVersion: 'v1',
        categoryPageSize: 48,
        maxRetries: 3,
        selectors: {
            productContainer: '.product-item',
            productLink: '.product-item a',
            productName: '.product-item-name',
            productPrice: '.product-price',
            productImage: '.product-item-image',
            categoryBreadcrumb: '.breadcrumb a',
            brandFilter: '.filter-brand',
            pagination: '.pagination button',
            loadingSpinner: '.loading-spinner'
        },
        endpoints: {
            products: '/api/catalog_system/pub/products/search',
            categories: '/api/catalog_system/pub/category/tree',
            brands: '/api/catalog_system/pub/brand/list',
            facets: '/api/catalog_system/pub/facets/search'
        }
    },
    [StoreName.DISCO]: {
        accountName: 'discoargentina',
        environment: 'vtexcommercestable',
        apiVersion: 'v1',
        categoryPageSize: 48,
        maxRetries: 3,
        selectors: {
            productContainer: '.product-item',
            productLink: '.product-item a',
            productName: '.product-item-name',
            productPrice: '.product-price',
            productImage: '.product-item-image',
            categoryBreadcrumb: '.breadcrumb a',
            brandFilter: '.filter-brand',
            pagination: '.pagination button',
            loadingSpinner: '.loading-spinner'
        },
        endpoints: {
            products: '/api/catalog_system/pub/products/search',
            categories: '/api/catalog_system/pub/category/tree',
            brands: '/api/catalog_system/pub/brand/list',
            facets: '/api/catalog_system/pub/facets/search'
        }
    },
    [StoreName.JUMBO]: {
        accountName: 'jumboargentina',
        environment: 'vtexcommercestable',
        apiVersion: 'v1',
        categoryPageSize: 48,
        maxRetries: 3,
        selectors: {
            productContainer: '.product-item',
            productLink: '.product-item a',
            productName: '.product-item-name',
            productPrice: '.product-price',
            productImage: '.product-item-image',
            categoryBreadcrumb: '.breadcrumb a',
            brandFilter: '.filter-brand',
            pagination: '.pagination button',
            loadingSpinner: '.loading-spinner'
        },
        endpoints: {
            products: '/api/catalog_system/pub/products/search',
            categories: '/api/catalog_system/pub/category/tree',
            brands: '/api/catalog_system/pub/brand/list',
            facets: '/api/catalog_system/pub/facets/search'
        }
    },
    [StoreName.LA_ANONIMA]: {
        accountName: 'laanonima',
        environment: 'vtexcommercestable',
        apiVersion: 'v1',
        categoryPageSize: 48,
        maxRetries: 3,
        selectors: {
            productContainer: '.product-item',
            productLink: '.product-item a',
            productName: '.product-item-name',
            productPrice: '.product-price',
            productImage: '.product-item-image',
            categoryBreadcrumb: '.breadcrumb a',
            brandFilter: '.filter-brand',
            pagination: '.pagination button',
            loadingSpinner: '.loading-spinner'
        },
        endpoints: {
            products: '/api/catalog_system/pub/products/search',
            categories: '/api/catalog_system/pub/category/tree',
            brands: '/api/catalog_system/pub/brand/list',
            facets: '/api/catalog_system/pub/facets/search'
        }
    },
    [StoreName.VEA]: {
        accountName: 'veaargentina',
        environment: 'vtexcommercestable',
        apiVersion: 'v1',
        categoryPageSize: 48,
        maxRetries: 3,
        selectors: {
            productContainer: '.vtex-search-result-3-x-galleryItem',
            productLink: '.vtex-product-summary-2-x-productNameContainer a',
            productName: '.vtex-product-summary-2-x-productBrand',
            productPrice: '.vtex-product-price-1-x-sellingPriceValue',
            productImage: '.vtex-product-summary-2-x-imageNormal',
            categoryBreadcrumb: '.vtex-breadcrumb-1-x-container a',
            brandFilter: '.vtex-search-result-3-x-filterItem--marca',
            pagination: '.vtex-search-result-3-x-pagination button',
            loadingSpinner: '.vtex-search-result-3-x-loadingSpinner'
        },
        endpoints: {
            products: '/api/catalog_system/pub/products/search',
            categories: '/api/catalog_system/pub/category/tree',
            brands: '/api/catalog_system/pub/brand/list',
            facets: '/api/catalog_system/pub/facets/search'
        }
    }
};

/**
 * Interfaz para productos VTEX
 */
export interface VTEXProduct {
    productId: string;
    productName: string;
    brand: string;
    brandId: number;
    linkText: string;
    productReference: string;
    categoryId: string;
    productTitle: string;
    metaTagDescription: string;
    releaseDate: string;
    clusterHighlights: VTEXClusterHighlights;
    productClusters: VTEXProductClusters;
    searchableClusters: VTEXSearchableClusters;
    categories: string[];
    categoriesIds: string[];
    link: string;
    sku: VTEXSku[];
}

/**
 * Interfaz para categorías VTEX
 */
export interface VTEXCategory {
    id: number;
    name: string;
    hasChildren: boolean;
    url: string;
    children: VTEXCategory[];
    Title: string;
    MetaTagDescription: string;
}

/**
 * Interfaz para marcas VTEX
 */
export interface VTEXBrand {
    id: number;
    name: string;
    isActive: boolean;
    title: string;
    metaTagDescription: string;
    imageUrl: string | null;
}

/**
 * Clase para manejar scraping de sitios VTEX
 */
export class VTEXScraper {
    private page: Page;
    private store: StoreName;
    private config: typeof VTEX_CONFIG[keyof typeof VTEX_CONFIG];

    constructor(page: Page, store: StoreName) {
        this.page = page;
        this.store = store;
        this.config = VTEX_CONFIG[store];
        
        if (!this.config) {
            throw new Error(`Configuración VTEX no encontrada para ${store}`);
        }
    }

    /**
     * Verifica si una URL pertenece a un sitio VTEX
     */
    static isVTEXSite(url: string): boolean {
        return url.includes('vtexcommercestable') || 
               url.includes('vteximg.com.br') ||
               url.includes('vtexassets.com') ||
               url.includes('myvtex.com');
    }

    /**
     * Obtiene el nombre de cuenta VTEX desde la URL
     */
    static extractAccountName(url: string): string | null {
        const match = url.match(/https?:\/\/([^.]+)\.(vtexcommercestable|myvtex\.com)/);
        return match ? match[1] : null;
    }

    /**
     * Espera a que VTEX termine de cargar
     */
    async waitForVTEXLoad(): Promise<void> {
        try {
            // Esperar que desaparezca el spinner de carga
            await this.page.waitForSelector(this.config.selectors.loadingSpinner, { state: 'hidden', timeout: 10000 });
        } catch (error) {
            logger.warn(`[VTEX] Spinner de carga no encontrado, continuando...`, {
                store: this.store,
                module: 'VTEX_SCRAPER',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }

        // Esperar a que el contenedor de productos esté presente
        try {
            await this.page.waitForSelector(this.config.selectors.productContainer, { timeout: 5000 });
        } catch (error) {
            logger.warn(`[VTEX] Contenedor de productos no encontrado`, {
                store: this.store,
                module: 'VTEX_SCRAPER',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Extrae productos de una página de categoría VTEX
     */
    async extractProductsFromCategoryPage(): Promise<VTEXProduct[]> {
        await this.waitForVTEXLoad();

        const products = await this.page.evaluate((selectors) => {
            const productElements = document.querySelectorAll(selectors.productContainer);
            const extractedProducts: Partial<VTEXProduct>[] = [];

            productElements.forEach((element) => {
                try {
                    // Extraer información básica del producto
                    const nameElement = element.querySelector(selectors.productName);
                    const linkElement = element.querySelector(selectors.productLink);
                    const priceElement = element.querySelector(selectors.productPrice);
                    const imageElement = element.querySelector(selectors.productImage);

                    if (!nameElement || !linkElement) return;

                    const productName = nameElement.textContent?.trim() || '';
                    const productUrl = linkElement.getAttribute('href') || '';
                    const priceText = priceElement?.textContent?.trim() || '';
                    const imageUrl = imageElement?.getAttribute('src') || '';

                    // Extraer precio
                    const priceMatch = priceText.match(/[\d.,]+/);
                    const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;

                    // Extraer datos del data layer de VTEX
                    extractedProducts.push({
                        productName,
                        link: productUrl,
                        sku: [{
                            sku: 1,
                            skuname: productName,
                            dimensions: {},
                            available: price > 0,
                            availablequantity: 1,
                            cacheVersionUsedToCallCheckout: '',
                            listPriceFormated: priceText,
                            listPrice: price,
                            bestPriceFormated: priceText,
                            bestPrice: price,
                            spotPrice: price,
                            installments: 1,
                            installmentsValue: price,
                            installmentsInsterestRate: 0,
                            image: imageUrl,
                            sellerId: '1',
                            seller: 'default',
                            measures: {},
                            unitMultiplier: 1,
                            rewardValue: 0,
                            giftSkuIds: [],
                            giftList: []
                        }]
                    });

                } catch (error) {
                    console.error('Error extrayendo producto:', error);
                }
            });

            return extractedProducts;
        }, this.config.selectors);

        return products as VTEXProduct[];
    }

    /**
     * Extrae marcas de los filtros VTEX
     */
    async extractBrandsFromFilters(): Promise<VTEXBrand[]> {
        try {
            await this.page.waitForSelector(this.config.selectors.brandFilter, { timeout: 5000 });

            const brands = await this.page.evaluate((brandSelector) => {
                const brandElements = document.querySelectorAll(`${brandSelector} .vtex-search-result-3-x-filterItem`);
                const extractedBrands: Partial<VTEXBrand>[] = [];

                brandElements.forEach((element) => {
                    try {
                        const nameElement = element.querySelector('.vtex-search-result-3-x-filterItemLabel');
                        const checkbox = element.querySelector('input[type="checkbox"]');
                        
                        if (nameElement) {
                            const brandName = nameElement.textContent?.trim() || '';
                            const isActive = checkbox ? !(checkbox as HTMLInputElement).disabled : true;

                            extractedBrands.push({
                                name: brandName,
                                isActive: isActive
                            });
                        }
                    } catch (error) {
                        console.error('Error extrayendo marca:', error);
                    }
                });

                return extractedBrands;
            }, this.config.selectors.brandFilter);

            return brands as VTEXBrand[];
        } catch (error) {
            logger.error(`[VTEX] Error extrayendo marcas de filtros:`, {
                store: this.store,
                module: 'VTEX_SCRAPER',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return [];
        }
    }

    /**
     * Extrae categorías del breadcrumb VTEX
     */
    async extractCategoriesFromBreadcrumb(): Promise<string[]> {
        try {
            await this.page.waitForSelector(this.config.selectors.categoryBreadcrumb, { timeout: 5000 });

            const categories = await this.page.evaluate((breadcrumbSelector) => {
                const breadcrumbElements = document.querySelectorAll(breadcrumbSelector);
                const categoryPath: string[] = [];

                breadcrumbElements.forEach((element, index) => {
                    if (index > 0) { // Saltar "Home"
                        const categoryName = element.textContent?.trim();
                        if (categoryName && categoryName !== 'Home') {
                            categoryPath.push(categoryName);
                        }
                    }
                });

                return categoryPath;
            }, this.config.selectors.categoryBreadcrumb);

            return categories;
        } catch (error) {
            logger.warn(`[VTEX] Error extrayendo categorías del breadcrumb:`, {
                store: this.store,
                module: 'VTEX_SCRAPER',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return [];
        }
    }

    /**
     * Navega a la siguiente página de resultados
     */
    async goToNextPage(): Promise<boolean> {
        try {
            const nextButton = await this.page.$(`${this.config.selectors.pagination}[aria-label="Next page"]`);
            if (nextButton) {
                const isDisabled = await nextButton.evaluate(el => el.getAttribute('disabled') !== null);
                if (!isDisabled) {
                    await nextButton.click();
                    await this.waitForVTEXLoad();
                    return true;
                }
            }
            return false;
        } catch (error) {
            logger.warn(`[VTEX] Error navegando a siguiente página:`, {
                store: this.store,
                module: 'VTEX_SCRAPER',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return false;
        }
    }

    /**
     * Maneja errores comunes de VTEX
     */
    async handleVTEXError(error: Error): Promise<void> {
        logger.error(`[VTEX] Error en scraping VTEX:`, {
            store: this.store,
            module: 'VTEX_SCRAPER',
            error: error.message
        });

        // Verificar si es un error de rate limit
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            logger.warn(`[VTEX] Rate limit detectado, esperando...`, {
                store: this.store,
                module: 'VTEX_SCRAPER'
            });
            await this.page.waitForTimeout(5000);
        }

        // Verificar si es un error de bot detection
        if (error.message.includes('403') || error.message.includes('Access Denied')) {
            logger.warn(`[VTEX] Posible detección de bot, tomando captura...`, {
                store: this.store,
                module: 'VTEX_SCRAPER'
            });
            
            try {
                await this.page.screenshot({ 
                    path: `logs/vtex-bot-detection-${this.store}-${Date.now()}.png`,
                    fullPage: true 
                });
            } catch (screenshotError) {
                logger.error(`[VTEX] Error tomando captura:`, {
                    store: this.store,
                    module: 'VTEX_SCRAPER',
                    error: screenshotError instanceof Error ? screenshotError.message : 'Error desconocido'
                });
            }
        }
    }
}

/**
 * Función auxiliar para detectar si un supermercado usa VTEX
 */
export function isVTEXStore(store: StoreName): boolean {
    return store in VTEX_CONFIG;
}

/**
 * Función auxiliar para obtener la configuración VTEX de un supermercado
 */
export function getVTEXConfig(store: StoreName) {
    return VTEX_CONFIG[store];
}