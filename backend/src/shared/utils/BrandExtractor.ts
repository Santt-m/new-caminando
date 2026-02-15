import { Page, ElementHandle } from 'playwright';
import logger from '../../utils/logger.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';

/**
 * Interfaz para datos de marca extraída
 */
export interface ExtractedBrand {
    name: string;
    url?: string;
    productCount?: number;
    logo?: string;
    confidence: number;
    source: 'sidebar' | 'product' | 'breadcrumb' | 'filter';
}

/**
 * Interfaz para configuración de extracción de marcas
 */
export interface BrandExtractionConfig {
    selectors: {
        sidebar?: string[];
        filters?: string[];
        breadcrumbs?: string[];
        productCards?: string[];
    };
    patterns: {
        ignorePatterns?: RegExp[];
        cleanPatterns?: RegExp[];
        validationPatterns?: RegExp[];
    };
    confidenceThresholds: {
        high: number;
        medium: number;
        low: number;
    };
}

/**
 * Configuraciones específicas por supermercado
 */
const STORE_CONFIGS: Record<StoreName, BrandExtractionConfig> = {
    [StoreName.COTO]: {
        selectors: {
            sidebar: [
                '.filtro-marca a',
                '.brand-filter a',
                '.sidebar-brands a',
                '[data-filter-type="marca"] a'
            ],
            filters: [
                '.filter-marca .filter-option',
                '.brand-checkbox + label'
            ],
            breadcrumbs: [
                '.breadcrumb a:last-child',
                '.navigation-path a:last-child'
            ]
        },
        patterns: {
            ignorePatterns: [
                /^\d+$/,                    // Solo números
                /^\s*$/,                    // Solo espacios
                /todo|todos|all/i,         // Genéricos
                /seleccionar|select/i      // Instrucciones
            ],
            cleanPatterns: [
                /\s*\(\d+\)\s*$/,          // (123) cantidad de productos
                /\s*-\s*\d+\s*$/,          // - 123
                /^\s+|\s+$/g               // Espacios extra
            ]
        },
        confidenceThresholds: {
            high: 0.9,
            medium: 0.7,
            low: 0.5
        }
    },
    [StoreName.CARREFOUR]: {
        selectors: {
            sidebar: [
                '.vtex-search-result-3-x-filter .vtex-search-result-3-x-filterTemplate--brand a',
                '.brand-filter a',
                '.facet-brand a'
            ],
            filters: [
                '.vtex-checkbox__label',
                '.filter-item.brand-item'
            ],
            breadcrumbs: [
                '.vtex-breadcrumb-1-x-container a:last-child'
            ]
        },
        patterns: {
            ignorePatterns: [
                /^\d+$/,
                /^\s*$/,
                /todo|todos|all/i,
                /ver más|see more/i
            ],
            cleanPatterns: [
                /\s*\(\d+\)\s*$/,
                /\s*-\s*\d+\s*$/,
                /^\s+|\s+$/g
            ]
        },
        confidenceThresholds: {
            high: 0.95,
            medium: 0.75,
            low: 0.55
        }
    },
    [StoreName.JUMBO]: {
        selectors: {
            sidebar: [
                '.filtro-marca a',
                '.brand-sidebar a',
                '.marca-filter a'
            ],
            filters: [
                '.filter-brand input + label',
                '.checkbox-brand + label'
            ],
            productCards: [
                '.product-item .brand',
                '.product-card .marca'
            ]
        },
        patterns: {
            ignorePatterns: [
                /^\d+$/,
                /^\s*$/,
                /seleccionar|select/i,
                /filtrar por|filter by/i
            ],
            cleanPatterns: [
                /\s*\(\d+\)\s*$/,
                /^\s+|\s+$/g
            ]
        },
        confidenceThresholds: {
            high: 0.85,
            medium: 0.65,
            low: 0.45
        }
    },
    [StoreName.VEA]: {
        selectors: {
            sidebar: [
                '.sidebar-brands a',
                '.filter-marca a',
                '.brand-list a'
            ],
            filters: [
                '.brand-checkbox + label',
                '.filter-option.brand'
            ]
        },
        patterns: {
            ignorePatterns: [
                /^\d+$/,
                /^\s*$/,
                /todo/i,
                /marca|brand/i           // Palabras genéricas
            ],
            cleanPatterns: [
                /\s*\(\d+\)\s*$/,
                /^\s+|\s+$/g
            ]
        },
        confidenceThresholds: {
            high: 0.9,
            medium: 0.7,
            low: 0.5
        }
    },
    [StoreName.DISCO]: {
        selectors: {
            sidebar: [
                '.vtex-search-result-3-x-filterTemplate--brand a',
                '.brand-filter a'
            ],
            filters: [
                '.vtex-checkbox__label',
                '.filter-item.brand'
            ]
        },
        patterns: {
            ignorePatterns: [
                /^\d+$/,
                /^\s*$/,
                /todo|todos/i,
                /seleccionar/i
            ],
            cleanPatterns: [
                /\s*\(\d+\)\s*$/,
                /^\s+|\s+$/g
            ]
        },
        confidenceThresholds: {
            high: 0.95,
            medium: 0.75,
            low: 0.55
        }
    },
    [StoreName.DIA]: {
        selectors: {
            sidebar: [
                '.filter-marca a',
                '.brand-sidebar a',
                '.marca-item a'
            ],
            filters: [
                '.brand-checkbox + label',
                '.filter-brand'
            ]
        },
        patterns: {
            ignorePatterns: [
                /^\d+$/,
                /^\s*$/,
                /todo/i,
                /filtrar/i
            ],
            cleanPatterns: [
                /\s*\(\d+\)\s*$/,
                /^\s+|\s+$/g
            ]
        },
        confidenceThresholds: {
            high: 0.85,
            medium: 0.65,
            low: 0.45
        }
    },
    [StoreName.LA_ANONIMA]: {
        selectors: {
            sidebar: [
                '.filtro-marca a',
                '.brand-filter a',
                '.sidebar-brands a'
            ],
            filters: [
                '.brand-checkbox + label',
                '.filter-item.brand'
            ]
        },
        patterns: {
            ignorePatterns: [
                /^\d+$/,
                /^\s*$/,
                /todo|todos/i,
                /seleccionar/i
            ],
            cleanPatterns: [
                /\s*\(\d+\)\s*$/,
                /^\s+|\s+$/g
            ]
        },
        confidenceThresholds: {
            high: 0.90,
            medium: 0.70,
            low: 0.50
        }
    }
};

/**
 * Clase para extraer marcas de páginas de supermercados
 */
export class BrandExtractor {
    private page: Page;
    private store: StoreName;
    private config: BrandExtractionConfig;

    constructor(page: Page, store: StoreName) {
        this.page = page;
        this.store = store;
        this.config = STORE_CONFIGS[store] || STORE_CONFIGS[StoreName.COTO];
    }

    /**
     * Extrae todas las marcas disponibles de la página actual
     */
    async extractBrands(): Promise<ExtractedBrand[]> {
        logger.info(`[BrandExtractor] Extrayendo marcas para ${this.store}`, {
            module: 'BRAND_EXTRACTION'
        });



        try {
            // Extraer de múltiples fuentes
            const sidebarBrands = await this.extractFromSidebar();
            const filterBrands = await this.extractFromFilters();
            const breadcrumbBrands = await this.extractFromBreadcrumbs();

            // Combinar y deduplicar
            const allBrands = [...sidebarBrands, ...filterBrands, ...breadcrumbBrands];
            const uniqueBrands = this.deduplicateBrands(allBrands);

            // Validar y filtrar
            const validBrands = this.validateBrands(uniqueBrands);

            logger.info(`[BrandExtractor] Marcas extraídas: ${validBrands.length}`, {
                module: 'BRAND_EXTRACTION',
                store: this.store,
                sources: {
                    sidebar: sidebarBrands.length,
                    filters: filterBrands.length,
                    breadcrumbs: breadcrumbBrands.length
                }
            });

            return validBrands;

        } catch (error) {
            logger.error(`[BrandExtractor] Error extrayendo marcas:`, {
                module: 'BRAND_EXTRACTION',
                store: this.store,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return [];
        }
    }

    /**
     * Extrae marcas del sidebar/filtros laterales
     */
    private async extractFromSidebar(): Promise<ExtractedBrand[]> {
        const brands: ExtractedBrand[] = [];

        if (!this.config.selectors.sidebar) return brands;

        for (const selector of this.config.selectors.sidebar) {
            try {
                const elements = await this.page.locator(selector).elementHandles();
                
                for (const element of elements) {
                    const brand = await this.extractBrandFromElement(element, 'sidebar');
                    if (brand) brands.push(brand);
                }

                if (brands.length > 0) break; // Usar el primer selector que funcione

            } catch (error) {
                logger.debug(`[BrandExtractor] Selector sidebar falló: ${selector}`, {
                    module: 'BRAND_EXTRACTION',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        }

        return brands;
    }

    /**
     * Extrae marcas de filtros/checkboxes
     */
    private async extractFromFilters(): Promise<ExtractedBrand[]> {
        const brands: ExtractedBrand[] = [];

        if (!this.config.selectors.filters) return brands;

        for (const selector of this.config.selectors.filters) {
            try {
                const elements = await this.page.locator(selector).elementHandles();
                
                for (const element of elements) {
                    const brand = await this.extractBrandFromElement(element, 'filter');
                    if (brand) brands.push(brand);
                }

                if (brands.length > 0) break;

            } catch (error) {
                logger.debug(`[BrandExtractor] Selector filters falló: ${selector}`, {
                    module: 'BRAND_EXTRACTION',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        }

        return brands;
    }

    /**
     * Extrae marcas de breadcrumbs (último nivel)
     */
    private async extractFromBreadcrumbs(): Promise<ExtractedBrand[]> {
        const brands: ExtractedBrand[] = [];

        if (!this.config.selectors.breadcrumbs) return brands;

        for (const selector of this.config.selectors.breadcrumbs) {
            try {
                const element = await this.page.locator(selector).first();
                if (await element.count() > 0) {
                    const elementHandle = await element.elementHandle();
                    if (elementHandle) {
                        const brand = await this.extractBrandFromElement(elementHandle, 'breadcrumb');
                        if (brand) brands.push(brand);
                    }
                }

            } catch (error) {
                logger.debug(`[BrandExtractor] Selector breadcrumbs falló: ${selector}`, {
                    module: 'BRAND_EXTRACTION',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        }

        return brands;
    }

    /**
     * Extrae información de marca de un elemento DOM
     */
    private async extractBrandFromElement(element: ElementHandle, source: ExtractedBrand['source']): Promise<ExtractedBrand | null> {
        try {
            const text = await element.textContent();
            const href = await element.getAttribute('href');
            
            if (!text) return null;

            // Limpiar el texto
            const cleanedName = this.cleanBrandName(text);
            
            // Validar
            if (!this.isValidBrandName(cleanedName)) {
                return null;
            }

            // Calcular confianza
            const confidence = this.calculateConfidence(cleanedName, source);

            // Extraer cantidad de productos si está disponible
            const productCount = await this.extractProductCount(element);

            return {
                name: cleanedName,
                url: href || undefined,
                productCount,
                confidence,
                source
            };

        } catch (error) {
            logger.debug(`[BrandExtractor] Error extrayendo marca de elemento:`, {
                module: 'BRAND_EXTRACTION',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return null;
        }
    }

    /**
     * Limpia el nombre de la marca
     */
    private cleanBrandName(name: string): string {
        let cleaned = name.trim();

        // Aplicar patrones de limpieza
        if (this.config.patterns.cleanPatterns) {
            for (const pattern of this.config.patterns.cleanPatterns) {
                cleaned = cleaned.replace(pattern, '');
            }
        }

        // Eliminar espacios extra
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        return cleaned;
    }

    /**
     * Valida si el nombre es una marca válida
     */
    private isValidBrandName(name: string): boolean {
        // Verificar patrones de ignorar
        if (this.config.patterns.ignorePatterns) {
            for (const pattern of this.config.patterns.ignorePatterns) {
                if (pattern.test(name)) {
                    return false;
                }
            }
        }

        // Verificar longitud mínima
        if (name.length < 2) {
            return false;
        }

        // Verificar que no sea solo números o símbolos
        if (/^[\d\s\W]+$/.test(name)) {
            return false;
        }

        return true;
    }

    /**
     * Calcula la confianza de que el nombre sea una marca válida
     */
    private calculateConfidence(name: string, source: ExtractedBrand['source']): number {
        let confidence = 0.5; // Base

        // Bonus por fuente
        switch (source) {
            case 'sidebar':
                confidence += 0.3;
                break;
            case 'filter':
                confidence += 0.25;
                break;
            case 'breadcrumb':
                confidence += 0.2;
                break;
            case 'product':
                confidence += 0.15;
                break;
        }

        // Bonus por formato
        if (/^[A-Z]/.test(name)) { // Empieza con mayúscula
            confidence += 0.1;
        }

        if (name.length >= 3 && name.length <= 20) { // Longitud razonable
            confidence += 0.1;
        }

        if (!/\d/.test(name)) { // Sin números
            confidence += 0.05;
        }

        // Penalización por palabras sospechosas
        if (/(marca|brand|todos|todo|seleccionar|filtrar)/i.test(name)) {
            confidence -= 0.3;
        }

        return Math.min(1, Math.max(0, confidence));
    }

    /**
     * Extrae la cantidad de productos asociados a la marca
     */
    private async extractProductCount(element: ElementHandle): Promise<number | undefined> {
        try {
            // Buscar elementos que contengan números
            const text = await element.textContent();
            const match = text?.match(/\((\d+)\)|-(\d+)|(\d+)\s*productos?/i);
            
            if (match) {
                const count = parseInt(match[1] || match[2] || match[3]);
                if (!isNaN(count) && count > 0 && count < 10000) {
                    return count;
                }
            }

            // Buscar en elementos hijos
            const countElement = await element.$('.count, .quantity, .number');
            if (countElement) {
                const countText = await countElement.textContent();
                const count = parseInt(countText?.replace(/\D/g, '') || '0');
                if (!isNaN(count) && count > 0 && count < 10000) {
                    return count;
                }
            }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            // Silencioso - no es crítico
            // Error ignorado intencionalmente para no interrumpir el flujo principal
        }

        return undefined;
    }

    /**
     * Elimina duplicados basándose en el nombre normalizado
     */
    private deduplicateBrands(brands: ExtractedBrand[]): ExtractedBrand[] {
        const seen = new Set<string>();
        const unique: ExtractedBrand[] = [];

        // Ordenar por confianza (descendente)
        brands.sort((a, b) => b.confidence - a.confidence);

        for (const brand of brands) {
            const normalizedName = this.normalizeBrandName(brand.name);
            
            if (!seen.has(normalizedName)) {
                seen.add(normalizedName);
                unique.push(brand);
            }
        }

        return unique;
    }

    /**
     * Normaliza el nombre de la marca para comparación
     */
    private normalizeBrandName(name: string): string {
        return name.toLowerCase()
            .replace(/[^a-z0-9]/g, '') // Eliminar caracteres especiales
            .replace(/\s+/g, '');     // Eliminar espacios
    }

    /**
     * Valida y filtra marcas basándose en confianza
     */
    private validateBrands(brands: ExtractedBrand[]): ExtractedBrand[] {
        return brands.filter(brand => {
            // Filtrar por confianza mínima
            if (brand.confidence < this.config.confidenceThresholds.low) {
                return false;
            }

            // Filtrar marcas muy genéricas o sospechosas
            const genericBrands = ['marca', 'brand', 'todos', 'todo', 'otros', 'varios', 'seleccionar'];
            if (genericBrands.includes(brand.name.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    /**
     * Extrae marcas de productos en la página (para validación cruzada)
     */
    async extractBrandsFromProducts(): Promise<string[]> {
        const brands: string[] = [];

        if (!this.config.selectors.productCards) return brands;

        for (const selector of this.config.selectors.productCards) {
            try {
                const elements = await this.page.locator(selector).elementHandles();
                
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text && this.isValidBrandName(text)) {
                        brands.push(this.cleanBrandName(text));
                    }
                }

                if (brands.length > 0) break;

            } catch (error) {
                logger.debug(`[BrandExtractor] Selector productCards falló: ${selector}`, {
                    module: 'BRAND_EXTRACTION',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        }

        return Array.from(new Set(brands)); // Eliminar duplicados
    }
}