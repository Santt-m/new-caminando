import { Brand } from '../../models/Brand.js';
import logger from '../../utils/logger.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import { 
    BRAND_INDICATORS, 
    MATCH_WEIGHTS,
    getSupermarketPattern,
    isPrivateLabel,
    detectProductFormat,
    extractBrandByFormat,
    calculateFormatConfidence
} from './SupermarketBrandPatterns.js';

/**
 * Interfaz para resultado de coincidencia de marca
 */
export interface BrandMatchResult {
    brandId: string;
    brandName: string;
    confidence: number;
    method: 'exact' | 'fuzzy' | 'keyword' | 'contextual';
    matchedText: string;
    position: number;
}

/**
 * Interfaz para configuración de coincidencia
 */
export interface BrandMatchingConfig {
    exactMatchThreshold: number;
    fuzzyMatchThreshold: number;
    keywordMatchThreshold: number;
    contextualMatchThreshold: number;
    maxResults: number;
    maxDistance: number;
    minWordLength: number;
    ignoreCase: boolean;
    considerPosition: boolean;
    useAcronyms: boolean;
}

/**
 * Interfaz para marca en formato lean
 */
interface LeanBrand {
    _id: string;
    name: string;
    slug: string;
    aliases?: string[];
    acronyms?: string[];
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: BrandMatchingConfig = {
    exactMatchThreshold: 0.95,
    fuzzyMatchThreshold: 0.85,
    keywordMatchThreshold: 0.75,
    contextualMatchThreshold: 0.65,
    maxResults: 5,
    maxDistance: 2,
    minWordLength: 2,
    ignoreCase: true,
    considerPosition: true,
    useAcronyms: true
};

/**
 * Palabras comunes a ignorar en la búsqueda de marcas
 */
const STOP_WORDS = new Set([
    'de', 'la', 'el', 'con', 'sin', 'para', 'por', 'en', 'y', 'e', 'o', 'u',
    'un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las',
    'kg', 'g', 'ml', 'l', 'lt', 'cc', 'mm', 'cm', 'm',
    'x', 'pack', 'packs', 'unidad', 'unidades', 'ud', 'uds',
    'gr', 'grs', 'litro', 'litros', 'mililitro', 'mililitros'
]);



/**
 * Clase para detectar y extraer marcas de títulos de productos
 */
export class BrandMatcher {
    private brands: Array<{
        _id: string;
        name: string;
        slug: string;
        aliases?: string[];
        acronyms?: string[];
    }> = [];
    private config: BrandMatchingConfig;
    private currentStore?: StoreName;

    constructor(config: Partial<BrandMatchingConfig> = {}, store?: StoreName) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.currentStore = store;
    }

    /**
     * Establece el supermercado actual para mejorar el matching
     */
    setStore(store: StoreName): void {
        this.currentStore = store;
    }

    /**
     * Carga las marcas disponibles desde la base de datos
     */
    async loadBrands(): Promise<void> {
        try {
            this.brands = await Brand.find({ active: true })
                .select('_id name slug')
                .lean()
                .then(brands => brands.map(brand => ({
                    _id: brand._id.toString(),
                    name: brand.name,
                    slug: brand.slug,
                    aliases: [],
                    acronyms: []
                })));

            logger.info(`[BrandMatcher] Marcas cargadas: ${this.brands.length}`, {
                module: 'BRAND_MATCHING'
            });

        } catch (error) {
            logger.error(`[BrandMatcher] Error cargando marcas:`, {
                module: 'BRAND_MATCHING',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            this.brands = [];
        }
    }

    /**
     * Encuentra la marca en un título de producto con soporte para supermercado específico
     */
    async extractBrandFromTitle(title: string, store?: StoreName): Promise<BrandMatchResult | null> {
        if (!title || title.trim().length === 0) {
            return null;
        }

        // Usar el supermercado proporcionado o el actual
        const targetStore = store || this.currentStore;

        try {
            // Primero intentar coincidencia por formato específico del supermercado
            if (targetStore) {
                const formatMatch = this.findFormatBasedMatch(title, targetStore);
                if (formatMatch && formatMatch.confidence >= this.config.exactMatchThreshold) {
                    return formatMatch;
                }
            }

            // Intentar coincidencia exacta primero
            const exactMatch = this.findExactMatch(title);
            if (exactMatch && exactMatch.confidence >= this.config.exactMatchThreshold) {
                return exactMatch;
            }

            // Intentar coincidencia fuzzy mejorada con contexto de supermercado
            const fuzzyMatch = this.findFuzzyMatch(title, targetStore);
            if (fuzzyMatch && fuzzyMatch.confidence >= this.config.fuzzyMatchThreshold) {
                return fuzzyMatch;
            }

            // Intentar coincidencia por palabras clave
            const keywordMatch = this.findKeywordMatch(title);
            if (keywordMatch && keywordMatch.confidence >= this.config.keywordMatchThreshold) {
                return keywordMatch;
            }

            // Intentar coincidencia contextual
            const contextualMatch = this.findContextualMatch(title);
            if (contextualMatch && contextualMatch.confidence >= this.config.contextualMatchThreshold) {
                return contextualMatch;
            }

            return null;

        } catch (error) {
            logger.error(`[BrandMatcher] Error extrayendo marca del título:`, {
                module: 'BRAND_MATCHING',
                title,
                store: targetStore,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return null;
        }
    }

    /**
     * Busca coincidencia exacta de marca en el título
     */
    private findExactMatch(title: string): BrandMatchResult | null {
        const normalizedTitle = this.normalizeText(title);
        
        for (const brand of this.brands) {
            const variations = this.getBrandVariations(brand);
            
            for (const variation of variations) {
                const normalizedVariation = this.normalizeText(variation);
                
                // Buscar coincidencia exacta
                const index = normalizedTitle.indexOf(normalizedVariation);
                if (index !== -1) {
                    // Verificar que no esté dentro de otra palabra
                    const beforeChar = normalizedTitle[index - 1];
                    const afterChar = normalizedTitle[index + normalizedVariation.length];
                    
                    if (this.isWordBoundary(beforeChar) && this.isWordBoundary(afterChar)) {
                        return {
                            brandId: brand._id.toString(),
                            brandName: brand.name,
                            confidence: 1.0,
                            method: 'exact',
                            matchedText: variation,
                            position: index
                        };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Busca coincidencia basada en el formato específico del supermercado
     */
    private findFormatBasedMatch(title: string, store: StoreName): BrandMatchResult | null {
        try {
            // Detectar el formato del producto
            const format = detectProductFormat(store, title);
            if (format === 'unknown') {
                return null;
            }

            // Extraer la marca basándose en el formato
            const extractedBrand = extractBrandByFormat(title, format);
            if (!extractedBrand) {
                return null;
            }

            // Buscar la marca extraída en nuestra base de datos
            for (const brand of this.brands) {
                if (this.isBrandMatch(brand.name, extractedBrand)) {
                    const confidence = calculateFormatConfidence(format);
                    return {
                        brandId: brand._id.toString(),
                        brandName: brand.name,
                        confidence,
                        method: 'contextual',
                        matchedText: extractedBrand,
                        position: title.indexOf(extractedBrand)
                    };
                }
            }

            return null;
        } catch (error) {
            logger.error(`[BrandMatcher] Error en coincidencia por formato:`, {
                module: 'BRAND_MATCHING',
                title,
                store,
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            return null;
        }
    }

    /**
     * Busca coincidencia fuzzy (aproximada) de marca en el título
     */
    private findFuzzyMatch(title: string, store?: StoreName): BrandMatchResult | null {
        const normalizedTitle = this.normalizeText(title);
        let bestMatch: BrandMatchResult | null = null;
        let bestScore = 0;
        
        for (const brand of this.brands) {
            const variations = this.getBrandVariations(brand);
            
            for (const variation of variations) {
                const normalizedVariation = this.normalizeText(variation);
                
                // Buscar coincidencias parciales
                for (let i = 0; i <= normalizedTitle.length - normalizedVariation.length; i++) {
                    const substring = normalizedTitle.substring(i, i + normalizedVariation.length);
                    const score = this.calculateLevenshteinSimilarity(normalizedVariation, substring);
                    
                    if (score > bestScore && score >= this.config.fuzzyMatchThreshold) {
                        // Verificar contexto
                        if (this.isValidContext(normalizedTitle, i, normalizedVariation.length)) {
                            // Aplicar bonus por supermercado específico
                            let finalScore = score;
                            if (store) {
                                finalScore = this.applySupermarketBonus(score, store, brand);
                            }
                            
                            if (finalScore > bestScore) {
                                bestScore = finalScore;
                                bestMatch = {
                                    brandId: brand._id.toString(),
                                    brandName: brand.name,
                                    confidence: finalScore,
                                    method: 'fuzzy',
                                    matchedText: variation,
                                    position: i
                                };
                            }
                        }
                    }
                }
            }
        }
        
        return bestMatch;
    }

    /**
     * Busca coincidencia por palabras clave
     */
    private findKeywordMatch(title: string): BrandMatchResult | null {
        const words = this.tokenize(title);
        const validWords = words.filter(word => 
            word.length >= this.config.minWordLength && 
            !STOP_WORDS.has(word.toLowerCase())
        );
        
        let bestMatch: BrandMatchResult | null = null;
        let bestScore = 0;
        
        for (const brand of this.brands) {
            const variations = this.getBrandVariations(brand);
            
            for (const variation of variations) {
                const brandWords = this.tokenize(variation);
                
                // Calcular coincidencia de palabras
                const score = this.calculateKeywordSimilarity(validWords, brandWords);
                
                if (score > bestScore && score >= this.config.keywordMatchThreshold) {
                    bestScore = score;
                    bestMatch = {
                        brandId: brand._id.toString(),
                        brandName: brand.name,
                        confidence: score,
                        method: 'keyword',
                        matchedText: variation,
                        position: -1
                    };
                }
            }
        }
        
        return bestMatch;
    }

    /**
     * Busca coincidencia contextual (indicadores de marca)
     */
    private findContextualMatch(title: string): BrandMatchResult | null {
        // Buscar indicadores de marca (®, ™, etc.)
        for (const indicator of Array.from(BRAND_INDICATORS)) {
            const index = title.toLowerCase().indexOf(indicator.toLowerCase());
            if (index !== -1) {
                // Buscar palabra antes del indicador
                const beforeText = title.substring(0, index).trim();
                const words = beforeText.split(/\s+/);
                const potentialBrand = words[words.length - 1];
                
                if (potentialBrand && potentialBrand.length >= 2) {
                    // Verificar si es una marca conocida
                    for (const brand of this.brands) {
                        if (this.isBrandMatch(brand.name, potentialBrand)) {
                            return {
                                brandId: brand._id.toString(),
                                brandName: brand.name,
                                confidence: 0.8,
                                method: 'contextual',
                                matchedText: potentialBrand,
                                position: index - potentialBrand.length
                            };
                        }
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Obtiene todas las variaciones posibles de una marca
     */
    private getBrandVariations(brand: LeanBrand): string[] {
        const variations = new Set<string>();
        
        // Nombre principal
        variations.add(brand.name);
        
        // Slug
        if (brand.slug) {
            variations.add(brand.slug.replace(/-/g, ' '));
        }
        
        // Alias
        if (brand.aliases) {
            brand.aliases.forEach((alias: string) => variations.add(alias));
        }
        
        // Acrónimos
        if (brand.acronyms) {
            brand.acronyms.forEach((acronym: string) => variations.add(acronym));
        }
        
        // Variaciones comunes
        // Sin espacios
        variations.add(brand.name.replace(/\s+/g, ''));
        
        // Solo iniciales
        if (brand.name.split(' ').length > 1) {
            const initials = brand.name.split(' ')
                .map((word: string) => word[0])
                .join('');
            variations.add(initials);
        }
        
        return Array.from(variations);
    }

    /**
     * Normaliza el texto para comparación
     */
    private normalizeText(text: string): string {
        let normalized = text;
        
        if (this.config.ignoreCase) {
            normalized = normalized.toLowerCase();
        }
        
        // Eliminar acentos
        normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Eliminar caracteres especiales pero mantener espacios
        normalized = normalized.replace(/[^\w\s]/g, ' ');
        
        // Normalizar espacios
        normalized = normalized.replace(/\s+/g, ' ').trim();
        
        return normalized;
    }

    /**
     * Tokeniza el texto en palabras
     */
    private tokenize(text: string): string[] {
        return text.split(/\s+/).filter(word => word.length > 0);
    }

    /**
     * Verifica si un carácter es un límite de palabra
     */
    private isWordBoundary(char: string | undefined): boolean {
        return !char || /[\s\W_]/.test(char);
    }

    /**
     * Verifica si el contexto es válido para una marca
     */
    private isValidContext(text: string, start: number, length: number): boolean {
        // Verificar que no esté en medio de una palabra larga
        const beforeChar = start > 0 ? text[start - 1] : ' ';
        const afterChar = start + length < text.length ? text[start + length] : ' ';
        
        if (!this.isWordBoundary(beforeChar) || !this.isWordBoundary(afterChar)) {
            return false;
        }
        
        return true;
    }

    /**
     * Calcula la similitud usando distancia de Levenshtein
     */
    private calculateLevenshteinSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Calcula la distancia de Levenshtein entre dos strings
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
                        matrix[i - 1][j - 1] + 1, // substitución
                        matrix[i][j - 1] + 1,     // inserción
                        matrix[i - 1][j] + 1      // eliminación
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Calcula la similitud basada en palabras clave
     */
    private calculateKeywordSimilarity(words1: string[], words2: string[]): number {
        const set1 = new Set(words1.map(w => w.toLowerCase()));
        const set2 = new Set(words2.map(w => w.toLowerCase()));
        
        const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
        const union = new Set([...Array.from(set1), ...Array.from(set2)]);
        
        if (union.size === 0) return 0;
        
        // Calcular Jaccard similarity
        const jaccard = intersection.size / union.size;
        
        // Bonus por orden de palabras
        const orderBonus = this.calculateOrderBonus(words1, words2);
        
        return Math.min(1, jaccard + orderBonus);
    }

    /**
     * Calcula bonus por orden de palabras
     */
    private calculateOrderBonus(words1: string[], words2: string[]): number {
        if (words1.length === 0 || words2.length === 0) return 0;
        
        let matches = 0;
        const total = Math.min(words1.length, words2.length);
        
        for (let i = 0; i < total; i++) {
            if (words1[i].toLowerCase() === words2[i].toLowerCase()) {
                matches++;
            }
        }
        
        return (matches / total) * 0.2; // Máximo 0.2 de bonus
    }

    /**
     * Verifica si un texto coincide con una marca
     */
    private isBrandMatch(brandName: string, text: string): boolean {
        const normalizedBrand = this.normalizeText(brandName);
        const normalizedText = this.normalizeText(text);
        
        return normalizedBrand === normalizedText ||
               this.calculateLevenshteinSimilarity(normalizedBrand, normalizedText) > 0.8;
    }

    /**
     * Extrae múltiples marcas de un título (para productos con múltiples marcas)
     */
    async extractMultipleBrandsFromTitle(title: string): Promise<BrandMatchResult[]> {
        const matches: BrandMatchResult[] = [];
        const usedPositions = new Set<number>();
        
        // Intentar encontrar múltiples marcas
        const match = await this.extractBrandFromTitle(title);
        if (match && !usedPositions.has(match.position)) {
            matches.push(match);
            usedPositions.add(match.position);
            
            // Marcar la posición como usada para evitar solapamientos
            for (let i = match.position; i < match.position + match.matchedText.length; i++) {
                usedPositions.add(i);
            }
        }
        
        // Ordenar por posición en el título
        return matches.sort((a, b) => a.position - b.position);
    }

    /**
     * Aplica bonus por contexto de supermercado específico
     */
    private applySupermarketBonus(score: number, store: StoreName, brand: LeanBrand): number {
        let bonus = 0;
        
        // Bonus por marca propia del supermercado
        if (isPrivateLabel(store, brand.name)) {
            bonus += MATCH_WEIGHTS.privateLabel;
        }
        
        // Bonus por supermercado específico
        bonus += MATCH_WEIGHTS.supermarketSpecific;
        
        // Verificar si la marca es común en este supermercado
        const storePattern = getSupermarketPattern(store);
        if (storePattern.commonPositions) {
            // Aplicar bonus basado en posición típica
            // Esto se puede expandir con análisis más sofisticado
            bonus += 0.05;
        }
        
        return Math.min(1.0, score + bonus);
    }

    /**
     * Verifica si una marca detectada es confiable
     */
    isReliableMatch(match: BrandMatchResult): boolean {
        // Verificar confianza mínima
        if (match.confidence < this.config.fuzzyMatchThreshold) {
            return false;
        }
        
        // Verificar método de detección
        const reliableMethods = ['exact', 'fuzzy', 'keyword'];
        if (!reliableMethods.includes(match.method)) {
            return false;
        }
        
        // Verificar longitud del texto coincidente
        if (match.matchedText.length < 2) {
            return false;
        }
        
        return true;
    }
}