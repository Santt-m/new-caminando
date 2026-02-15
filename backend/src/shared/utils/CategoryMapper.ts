import { Category, CategoryDocument } from '../../models/Category.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import logger from '../../utils/logger.js';

/**
 * Interfaz para resultado de mapeo de categoría
 */
export interface CategoryMappingResult {
    masterCategoryId: string;
    confidence: number;
    method: 'exact' | 'fuzzy' | 'ml' | 'manual' | 'pending';
    suggestions?: CategorySuggestion[];
    reason?: string;
}

/**
 * Interfaz para sugerencia de categoría
 */
export interface CategorySuggestion {
    categoryId: string;
    name: string;
    confidence: number;
    score?: number;
    reason?: string;
}


/**
 * Interfaz para categoría maestra
 */
export interface MasterCategory {
    _id: string;
    name: {
        es: string;
        en: string;
    };
    slug: string;
    level: number;
    parent?: string;
    keywords: string[];
    synonyms: string[];
    storeMappings: {
        [store in StoreName]?: string[];
    };
}

/**
 * Interfaz para configuración de mapeo
 */
export interface CategoryMappingConfig {
    fuzzyThreshold: number;
    exactThreshold: number;
    mlThreshold: number;
    maxSuggestions: number;
    useSynonyms: boolean;
    useKeywords: boolean;
    considerHierarchy: boolean;
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: CategoryMappingConfig = {
    fuzzyThreshold: 0.8,
    exactThreshold: 0.95,
    mlThreshold: 0.75,
    maxSuggestions: 5,
    useSynonyms: true,
    useKeywords: true,
    considerHierarchy: true
};

/**
 * Mapeos manuales predefinidos para casos comunes
 */
const MANUAL_MAPPINGS: Record<string, string> = {
    'lacteos': 'lacteos-y-productos-frescos',
    'lácteos': 'lacteos-y-productos-frescos',
    'lacteos-y-productos-frescos': 'lacteos-y-productos-frescos',
    'frutas-y-verduras': 'frutas-y-verduras',
    'frutas': 'frutas-y-verduras',
    'verduras': 'frutas-y-verduras',
    'carnes': 'carnes-y-pescados',
    'pescados': 'carnes-y-pescados',
    'carnes-y-pescados': 'carnes-y-pescados',
    'panaderia': 'panaderia-y-reposteria',
    'panadería': 'panaderia-y-reposteria',
    'reposteria': 'panaderia-y-reposteria',
    'repostería': 'panaderia-y-reposteria',
    'bebidas': 'bebidas-y-licores',
    'licores': 'bebidas-y-licores',
    'bebidas-y-licores': 'bebidas-y-licores',
    'limpieza': 'limpieza-y-hogar',
    'hogar': 'limpieza-y-hogar',
    'limpieza-y-hogar': 'limpieza-y-hogar',
    'perfumeria': 'perfumeria-y-belleza',
    'perfumería': 'perfumeria-y-belleza',
    'belleza': 'perfumeria-y-belleza',
    'mascotas': 'mascotas',
    'mascota': 'mascotas',
    'alimentos-para-mascotas': 'mascotas',
    'bebe': 'bebe-y-infancia',
    'bebé': 'bebe-y-infancia',
    'infancia': 'bebe-y-infancia',
    'bebe-y-infancia': 'bebe-y-infancia'
};

/**
 * Sinónimos comunes para categorías
 */
const CATEGORY_SYNONYMS: Record<string, string[]> = {
    'lacteos-y-productos-frescos': ['lacteos', 'lácteos', 'frescos', 'refrigerados', 'frio', 'frío'],
    'frutas-y-verduras': ['frutas', 'verduras', 'hortalizas', 'verduleria', 'fruteria', 'verdulería', 'frutería'],
    'carnes-y-pescados': ['carnes', 'pescados', 'mariscos', 'pescaderia', 'carniceria', 'pescadería', 'carnicería'],
    'panaderia-y-reposteria': ['pan', 'panaderia', 'reposteria', 'facturas', 'panadería', 'repostería', 'bakery'],
    'bebidas-y-licores': ['bebidas', 'licores', 'aguas', 'jugos', 'gaseosas', 'cervezas', 'vinos', 'drinks'],
    'limpieza-y-hogar': ['limpieza', 'hogar', 'lavanderia', 'detergentes', 'jabones', 'lavandería'],
    'perfumeria-y-belleza': ['perfumeria', 'belleza', 'higiene', 'cosmeticos', 'perfumería', 'cosméticos'],
    'mascotas': ['mascotas', 'perros', 'gatos', 'alimentos-para-mascotas', 'pet', 'pets'],
    'bebe-y-infancia': ['bebe', 'bebé', 'infancia', 'niños', 'pañales', 'baby']
};

/**
 * Palabras clave por categoría
 */

/**
 * Clase para mapear categorías entre diferentes supermercados
 */
export class CategoryMapper {
    private masterCategories: MasterCategory[] = [];
    private config: CategoryMappingConfig;

    constructor(config: Partial<CategoryMappingConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Carga las categorías maestras desde la base de datos
     */
    async loadMasterCategories(): Promise<void> {
        try {
            // Por ahora crear categorías maestras básicas si no existen
            const existingCategories = await Category.find({ 
                isMaster: true 
            }).lean();

            if (existingCategories.length === 0) {
                await this.createDefaultMasterCategories();
            }

            this.masterCategories = existingCategories.map(cat => ({
                _id: cat._id.toString(),
                name: typeof cat.name === 'string' ? { es: cat.name, en: cat.name } : { 
                    es: (cat.name as { es: string; en?: string }).es || '', 
                    en: (cat.name as { es: string; en?: string }).en || (cat.name as { es: string; en?: string }).es || '' 
                },
                slug: cat.slug,
                level: 0,
                parent: undefined,
                keywords: [],
                synonyms: [],
                storeMappings: {}
            }));

            logger.info(`[CategoryMapper] Categorías maestras cargadas: ${this.masterCategories.length}`, {
                module: 'CATEGORY_MAPPING'
            });

        } catch (error) {
            logger.error(`[CategoryMapper] Error cargando categorías maestras:`, {
                module: 'CATEGORY_MAPPING',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            this.masterCategories = [];
        }
    }

    /**
     * Mapea una categoría de tienda a una categoría maestra
     */
    async mapCategory(
        storeName: StoreName,
        categoryPath: string[],
        categoryName: string,
        context?: string
    ): Promise<CategoryMappingResult> {
        try {
            // Normalizar el nombre
            const normalizedName = this.normalizeCategoryName(categoryName);
            const fullPath = [...categoryPath, categoryName].join(' > ');
            
            logger.info(`[CategoryMapper] Mapeando categoría: ${normalizedName} de ${storeName}`, {
                module: 'CATEGORY_MAPPING',
                store: storeName,
                categoryPath,
                categoryName,
                context
            });

            // 1. Intentar mapeo manual predefinido
            const manualMapping = this.findManualMapping(normalizedName);
            if (manualMapping) {
                const masterCategory = this.masterCategories.find(cat => cat.slug === manualMapping);
                if (masterCategory) {
                    return {
                        masterCategoryId: masterCategory._id,
                        confidence: 1.0,
                        method: 'manual',
                        reason: 'Mapeo manual predefinido'
                    };
                }
            }

            // 2. Intentar coincidencia exacta
            const exactMatch = await this.findExactMatch(normalizedName);
            if (exactMatch) {
                return exactMatch;
            }

            // 3. Intentar coincidencia fuzzy
            const fuzzyMatch = await this.findFuzzyMatch(normalizedName);
            if (fuzzyMatch) {
                return fuzzyMatch;
            }

            // 4. Intentar coincidencia por sinónimos y keywords
            const synonymMatch = await this.findSynonymMatch(normalizedName, categoryPath);
            if (synonymMatch) {
                return synonymMatch;
            }

            // 5. Generar sugerencias
            const suggestions = await this.generateSuggestions(normalizedName);

            // 6. Crear categoría maestra pendiente
            const pendingCategory = await this.createPendingCategory(normalizedName, storeName, fullPath, context);

            return {
                masterCategoryId: pendingCategory._id.toString(),
                confidence: 0.0,
                method: 'pending',
                suggestions,
                reason: 'Categoría nueva, requiere revisión manual'
            };

        } catch (error) {
            logger.error(`[CategoryMapper] Error mapeando categoría:`, {
                module: 'CATEGORY_MAPPING',
                store: storeName,
                categoryName,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });

            return {
                masterCategoryId: 'unknown',
                confidence: 0.0,
                method: 'pending',
                reason: 'Error en el mapeo'
            };
        }
    }

    /**
     * Busca mapeo manual predefinido
     */
    private findManualMapping(categoryName: string): string | null {
        const normalizedName = this.normalizeCategoryName(categoryName);
        return MANUAL_MAPPINGS[normalizedName] || null;
    }

    /**
     * Busca coincidencia exacta con categorías maestras
     */
    private async findExactMatch(categoryName: string): Promise<CategoryMappingResult | null> {
        const normalizedName = this.normalizeCategoryName(categoryName);
        
        // Buscar por nombre exacto
        for (const masterCategory of this.masterCategories) {
            if (this.normalizeCategoryName(masterCategory.name.es) === normalizedName ||
                this.normalizeCategoryName(masterCategory.name.en) === normalizedName ||
                masterCategory.slug === normalizedName) {
                
                return {
                    masterCategoryId: masterCategory._id,
                    confidence: 1.0,
                    method: 'exact',
                    reason: 'Coincidencia exacta de nombre'
                };
            }
        }
        
        return null;
    }

    /**
     * Busca coincidencia fuzzy usando similitud de texto
     */
    private async findFuzzyMatch(categoryName: string): Promise<CategoryMappingResult | null> {
        const normalizedName = this.normalizeCategoryName(categoryName);
        let bestMatch: CategoryMappingResult | null = null;
        let bestScore = 0;
        
        for (const masterCategory of this.masterCategories) {
            // Calcular similitud con el nombre
            const nameScore = this.calculateSimilarity(normalizedName, this.normalizeCategoryName(masterCategory.name.es));
            
            // Calcular similitud con keywords
            let keywordScore = 0;
            if (this.config.useKeywords) {
                keywordScore = this.calculateKeywordSimilarity(normalizedName, masterCategory.keywords);
            }
            
            // Calcular similitud con sinónimos
            let synonymScore = 0;
            if (this.config.useSynonyms) {
                synonymScore = this.calculateSynonymSimilarity(normalizedName, masterCategory.synonyms);
            }
            
            // Combinar puntuaciones
            const combinedScore = Math.max(nameScore, keywordScore, synonymScore);
            
            if (combinedScore > bestScore && combinedScore >= this.config.fuzzyThreshold) {
                bestScore = combinedScore;
                bestMatch = {
                    masterCategoryId: masterCategory._id,
                    confidence: combinedScore,
                    method: 'fuzzy',
                    reason: `Similitud de texto: ${(combinedScore * 100).toFixed(1)}%`
                };
            }
        }
        
        return bestMatch;
    }

    /**
     * Busca coincidencia por sinónimos
     */
    private async findSynonymMatch(categoryName: string, categoryPath: string[]): Promise<CategoryMappingResult | null> {
        const normalizedName = this.normalizeCategoryName(categoryName);
        const pathText = categoryPath.join(' ').toLowerCase();
        
        for (const [masterSlug, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
            const masterCategory = this.masterCategories.find(cat => cat.slug === masterSlug);
            if (!masterCategory) continue;
            
            // Buscar coincidencias con sinónimos
            for (const synonym of synonyms) {
                if (normalizedName.includes(synonym) || synonym.includes(normalizedName)) {
                    return {
                        masterCategoryId: masterCategory._id,
                        confidence: 0.9,
                        method: 'fuzzy',
                        reason: `Coincidencia por sinónimo: "${synonym}"`
                    };
                }
            }
            
            // Buscar en el path de categorías
            if (this.config.considerHierarchy) {
                for (const synonym of synonyms) {
                    if (pathText.includes(synonym)) {
                        return {
                            masterCategoryId: masterCategory._id,
                            confidence: 0.85,
                            method: 'fuzzy',
                            reason: `Coincidencia por sinónimo en jerarquía: "${synonym}"`
                        };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Genera sugerencias de mapeo
     */
    private async generateSuggestions(categoryName: string): Promise<CategorySuggestion[]> {
        const suggestions: CategorySuggestion[] = [];
        const normalizedName = this.normalizeCategoryName(categoryName);
        
        for (const masterCategory of this.masterCategories) {
            const scores = [];
            
            // Similitud de nombre
            const nameScore = this.calculateSimilarity(normalizedName, this.normalizeCategoryName(masterCategory.name.es));
            scores.push({ type: 'nombre', score: nameScore });
            
            // Similitud de keywords
            if (this.config.useKeywords) {
                const keywordScore = this.calculateKeywordSimilarity(normalizedName, masterCategory.keywords);
                scores.push({ type: 'keywords', score: keywordScore });
            }
            
            // Similitud de sinónimos
            if (this.config.useSynonyms) {
                const synonymScore = this.calculateSynonymSimilarity(normalizedName, masterCategory.synonyms);
                scores.push({ type: 'sinónimos', score: synonymScore });
            }
            
            // Calcular puntuación final
            const maxScore = Math.max(...scores.map(s => s.score));
            
            if (maxScore > 0.5) { // Umbral mínimo para sugerencia
                suggestions.push({
                    categoryId: masterCategory._id,
                    name: masterCategory.name.es,
                    confidence: maxScore,
                    score: maxScore,
                    reason: `Mejor coincidencia: ${scores.find(s => s.score === maxScore)?.type} (${(maxScore * 100).toFixed(1)}%)`
                });
            }
        }
        
        // Ordenar por puntuación y limitar
        return suggestions
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, this.config.maxSuggestions);
    }

    /**
     * Calcula similitud entre dos textos
     */
    private calculateSimilarity(text1: string, text2: string): number {
        if (text1 === text2) return 1.0;
        
        // Distancia de Levenshtein
        const distance = this.levenshteinDistance(text1, text2);
        const maxLength = Math.max(text1.length, text2.length);
        
        return 1 - (distance / maxLength);
    }

    /**
     * Calcula similitud con keywords
     */
    private calculateKeywordSimilarity(text: string, keywords: string[]): number {
        if (!keywords || keywords.length === 0) return 0;
        
        const textLower = text.toLowerCase();
        let matches = 0;
        
        for (const keyword of keywords) {
            if (textLower.includes(keyword.toLowerCase())) {
                matches++;
            }
        }
        
        return matches / keywords.length;
    }

    /**
     * Calcula similitud con sinónimos
     */
    private calculateSynonymSimilarity(text: string, synonyms: string[]): number {
        if (!synonyms || synonyms.length === 0) return 0;
        
        const textLower = text.toLowerCase();
        let maxScore = 0;
        
        for (const synonym of synonyms) {
            if (textLower.includes(synonym.toLowerCase()) || synonym.toLowerCase().includes(textLower)) {
                maxScore = Math.max(maxScore, 0.9);
            }
        }
        
        return maxScore;
    }

    /**
     * Calcula distancia de Levenshtein
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Normaliza el nombre de la categoría
     */
    private normalizeCategoryName(name: string): string {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .replace(/[^\w\s]/g, ' ') // Eliminar caracteres especiales
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Crea categorías maestras por defecto
     */
    private async createDefaultMasterCategories(): Promise<void> {
        const defaultCategories = [
            {
                name: { es: 'Lácteos y Productos Frescos', en: 'Dairy and Fresh Products' },
                slug: 'lacteos-y-productos-frescos',
                level: 1,
                keywords: ['leche', 'yogur', 'queso', 'manteca', 'crema', 'fresco'],
                synonyms: ['lacteos', 'lácteos', 'frescos', 'refrigerados'],
                isMaster: true
            },
            {
                name: { es: 'Frutas y Verduras', en: 'Fruits and Vegetables' },
                slug: 'frutas-y-verduras',
                level: 1,
                keywords: ['frutas', 'verduras', 'hortalizas', 'manzana', 'banana', 'tomate'],
                synonyms: ['fruteria', 'verduleria', 'frutería', 'verdulería'],
                isMaster: true
            },
            {
                name: { es: 'Carnes y Pescados', en: 'Meat and Fish' },
                slug: 'carnes-y-pescados',
                level: 1,
                keywords: ['carne', 'pollo', 'pescado', 'carniceria', 'pescaderia'],
                synonyms: ['carnicería', 'pescadería', 'mariscos'],
                isMaster: true
            },
            {
                name: { es: 'Panadería y Repostería', en: 'Bakery and Pastry' },
                slug: 'panaderia-y-reposteria',
                level: 1,
                keywords: ['pan', 'facturas', 'reposteria', 'medialuna', 'pan-dulce'],
                synonyms: ['panaderia', 'repostería', 'bakery'],
                isMaster: true
            },
            {
                name: { es: 'Bebidas y Licores', en: 'Drinks and Liquors' },
                slug: 'bebidas-y-licores',
                level: 1,
                keywords: ['bebidas', 'agua', 'jugo', 'gaseosa', 'cerveza', 'vino'],
                synonyms: ['licores', 'drinks', 'alcohol'],
                isMaster: true
            },
            {
                name: { es: 'Limpieza y Hogar', en: 'Cleaning and Home' },
                slug: 'limpieza-y-hogar',
                level: 1,
                keywords: ['limpieza', 'detergente', 'lavandina', 'jabon', 'hogar'],
                synonyms: ['lavanderia', 'lavandería', 'limpiador'],
                isMaster: true
            },
            {
                name: { es: 'Perfumería y Belleza', en: 'Perfumery and Beauty' },
                slug: 'perfumeria-y-belleza',
                level: 1,
                keywords: ['perfumeria', 'higiene', 'shampoo', 'crema', 'cosmeticos'],
                synonyms: ['belleza', 'perfumería', 'cosméticos'],
                isMaster: true
            },
            {
                name: { es: 'Mascotas', en: 'Pets' },
                slug: 'mascotas',
                level: 1,
                keywords: ['mascotas', 'perro', 'gato', 'alimento-mascota'],
                synonyms: ['pet', 'pets', 'animales'],
                isMaster: true
            },
            {
                name: { es: 'Bebé y Infancia', en: 'Baby and Childhood' },
                slug: 'bebe-y-infancia',
                level: 1,
                keywords: ['bebe', 'pañal', 'biberon', 'leche-infantil', 'infancia'],
                synonyms: ['bebé', 'baby', 'niños'],
                isMaster: true
            }
        ];

        for (const categoryData of defaultCategories) {
            await Category.findOneAndUpdate(
                { slug: categoryData.slug, isMaster: true },
                categoryData,
                { upsert: true, new: true }
            );
        }
    }

    /**
     * Crea una categoría maestra pendiente para revisión manual
     */
    private async createPendingCategory(
        categoryName: string, 
        storeName: StoreName, 
        fullPath: string,
        context?: string
    ): Promise<CategoryDocument> {
        const pendingCategory = await Category.create({
            name: {
                es: categoryName,
                en: categoryName
            },
            slug: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            level: 1,
            isMaster: true,
            isPending: true,
            pendingInfo: {
                originalName: categoryName,
                store: storeName,
                fullPath,
                context,
                createdAt: new Date()
            },
            keywords: this.extractKeywords([categoryName]),
            synonyms: []
        });

        logger.info(`[CategoryMapper] Categoría pendiente creada: ${categoryName}`, {
            module: 'CATEGORY_MAPPING',
            categoryId: pendingCategory._id,
            store: storeName
        });

        return pendingCategory;
    }

    /**
     * Extrae palabras clave de un array de nombres
     */
    private extractKeywords(names: string[]): string[] {
        const keywords = new Set<string>();
        
        for (const name of names) {
            const words = name.toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 2 && !this.isStopWord(word));
            
            words.forEach(word => keywords.add(word));
        }
        
        return Array.from(keywords);
    }

    /**
     * Verifica si una palabra es una palabra de parada
     */
    private isStopWord(word: string): boolean {
        const stopWords = new Set([
            'de', 'la', 'el', 'con', 'sin', 'para', 'por', 'en', 'y', 'e', 'o', 'u',
            'un', 'una', 'unos', 'unas', 'del', 'al', 'los', 'las', 'se', 'su',
            'sus', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas'
        ]);
        
        return stopWords.has(word);
    }
}