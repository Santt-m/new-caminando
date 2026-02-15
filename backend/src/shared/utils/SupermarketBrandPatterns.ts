/**
 * Patrones de marcas específicos por supermercado
 * Estos patrones ayudan a mejorar la precisión del reconocimiento de marcas
 */

import { StoreName } from '../../config/bullmq/QueueConfig.js';

/**
 * Interfaz para patrón de supermercado
 */
interface SupermarketPattern {
    privateLabels: string[];
    productPatterns: RegExp[];
    brandIndicators: string[];
    commonPositions: {
        titleStart: number;
        afterFirstWord: number;
        beforeLastWord: number;
        middleWords: number;
    };
    commonBrands: string[];
    brandExtractionPatterns: RegExp[];
    exclusionPatterns: RegExp[];
    keywordMatch: number;
    contextualMatch: number;
    positionBonus: number;
    supermarketSpecific: number;
    privateLabel: number;
}

/**
 * Patrones comunes de marcas por supermercado
 */
export const SUPERMARKET_BRAND_PATTERNS: Record<StoreName, SupermarketPattern> = {
    [StoreName.COTO]: {
        // Marcas propias de Coto
        privateLabels: ['Coto', 'CotoMax', 'CotoSelection', 'CotoBasics'],
        
        // Patrones de productos con marca
        productPatterns: [
            /^(\w+)\s+Marca\s+(\w+)/i,
            /^(\w+)\s+®/i,
            /^(\w+)\s+™/i
        ],
        
        // Palabras que indican inicio de marca
        brandIndicators: ['Marca', 'Fabricante', 'Elaborado por'],
        
        // Posiciones comunes donde aparece la marca en Coto
        commonPositions: {
            titleStart: 0.8, // 80% de las veces la marca está al inicio
            afterFirstWord: 0.6,
            beforeLastWord: 0.4,
            middleWords: 0.3
        },
        
        // Marcas comunes en Coto
        commonBrands: ['Coca-Cola', 'Pepsi', 'Nestlé', 'Danone', 'La Serenísima', 'Sancor', 'Mastellone'],
        
        // Patrones de extracción de marca
        brandExtractionPatterns: [
            /^([A-Z][a-z]+)\s+/i, // Marca al inicio
            /\s+([A-Z][a-z]+)$/i, // Marca al final
            /\b([A-Z][a-z]+)\s+\d+/i // Marca antes de números
        ],
        
        // Patrones de exclusión
        exclusionPatterns: [
            /\d+g$/i, // Peso
            /\d+ml$/i, // Volumen
            /\d+%$/i // Porcentaje
        ],
        
        // Puntuaciones para diferentes tipos de coincidencia
        keywordMatch: 0.7,
        contextualMatch: 0.8,
        positionBonus: 0.5,
        supermarketSpecific: 0.9,
        privateLabel: 0.95
    },
    
    [StoreName.CARREFOUR]: {
        // Marcas propias de Carrefour
        privateLabels: ['Carrefour', 'Carrefour Bio', 'Carrefour Discount', 'Carrefour Selection'],
        
        // Patrones VTEX específicos
        productPatterns: [
            /^(\w+)\s+-/i, // Marca seguida de guión
            /^\[(\w+)\]/i, // Marca entre corchetes
            /^(\w+)\s+\d+/i // Marca seguida de números
        ],
        
        // Indicadores de marca
        brandIndicators: ['Marca', 'Fabricante', 'Elaborado por'],
        
        // Posiciones comunes
        commonPositions: {
            titleStart: 0.7,
            afterFirstWord: 0.5,
            beforeLastWord: 0.3,
            middleWords: 0.2
        },
        
        // Marcas comunes
        commonBrands: [],
        
        // Patrones de extracción
        brandExtractionPatterns: [],
        
        // Patrones de exclusión
        exclusionPatterns: [],
        
        // Pesos de coincidencia
        keywordMatch: 0.8,
        contextualMatch: 0.6,
        positionBonus: 0.1,
        supermarketSpecific: 0.2,
        privateLabel: 0.9
    },
    
    [StoreName.JUMBO]: {
        // Marcas propias de Jumbo
        privateLabels: ['Jumbo', 'Jumbo Selection', 'Jumbo Bio', 'Jumbo Basics'],
        
        // Patrones específicos de Jumbo
        productPatterns: [
            /^(\w+)\s+de\s+(\d+)/i, // Marca seguida de "de" y cantidad
            /^(\w+)\s+para/i, // Marca seguida de "para"
            /^(\w+)\s+con/i // Marca seguida de "con"
        ],
        
        // Indicadores de marca
        brandIndicators: ['Marca', 'Fabricante', 'Elaborado por'],
        
        // Posiciones comunes
        commonPositions: {
            titleStart: 0.6,
            afterFirstWord: 0.4,
            beforeLastWord: 0.3,
            middleWords: 0.2
        },
        
        // Marcas comunes
        commonBrands: [],
        
        // Patrones de extracción
        brandExtractionPatterns: [],
        
        // Patrones de exclusión
        exclusionPatterns: [],
        
        // Pesos de coincidencia
        keywordMatch: 0.7,
        contextualMatch: 0.5,
        positionBonus: 0.1,
        supermarketSpecific: 0.3,
        privateLabel: 0.8
    },
    
    [StoreName.VEA]: {
        // Similar a Jumbo pero con algunas diferencias
        privateLabels: ['Vea', 'Vea Selection', 'Vea Bio'],
        
        // Patrones VEA
        productPatterns: [
            /^(\w+)\s+\(/i, // Marca seguida de paréntesis
            /^(\w+)\s+\d+\s*\w*$/i // Marca seguida de números y posiblemente unidades
        ],
        
        // Indicadores de marca
        brandIndicators: ['Marca', 'Fabricante', 'Elaborado por'],
        
        // Posiciones comunes
        commonPositions: {
            titleStart: 0.5,
            afterFirstWord: 0.4,
            beforeLastWord: 0.3,
            middleWords: 0.2
        },
        
        // Marcas comunes
        commonBrands: [],
        
        // Patrones de extracción
        brandExtractionPatterns: [],
        
        // Patrones de exclusión
        exclusionPatterns: [],
        
        // Pesos de coincidencia
        keywordMatch: 0.6,
        contextualMatch: 0.4,
        positionBonus: 0.1,
        supermarketSpecific: 0.4,
        privateLabel: 0.7
    },
    
    [StoreName.DISCO]: {
        // Similar a Jumbo/VEA
        privateLabels: ['Disco', 'Disco Selection', 'Disco Bio'],
        
        // Patrones Disco
        productPatterns: [
            /^(\w+)\s+\d+\s*l$/i, // Marca seguida de cantidad en litros
            /^(\w+)\s+\d+\s*g$/i, // Marca seguida de cantidad en gramos
            /^(\w+)\s+family/i // Marca seguida de "family"
        ],
        
        // Indicadores de marca
        brandIndicators: ['Marca', 'Fabricante', 'Elaborado por'],
        
        // Posiciones comunes
        commonPositions: {
            titleStart: 0.5,
            afterFirstWord: 0.4,
            beforeLastWord: 0.3,
            middleWords: 0.2
        },
        
        // Marcas comunes
        commonBrands: [],
        
        // Patrones de extracción
        brandExtractionPatterns: [],
        
        // Patrones de exclusión
        exclusionPatterns: [],
        
        // Pesos de coincidencia
        keywordMatch: 0.6,
        contextualMatch: 0.4,
        positionBonus: 0.1,
        supermarketSpecific: 0.4,
        privateLabel: 0.7
    },
    
    [StoreName.DIA]: {
        // Marcas propias de Día
        privateLabels: ['Dia', 'Dia%', 'Dia Basics', 'Dia Selection'],
        
        // Patrones Día (más simples)
        productPatterns: [
            /^(\w+)\s+\d+$/i, // Simple: marca + número
            /^(\w+)\s+\w+\s+\d+$/i // marca + palabra + número
        ],
        
        // Indicadores de marca
        brandIndicators: ['Marca', 'Fabricante', 'Elaborado por'],
        
        // Posiciones comunes
        commonPositions: {
            titleStart: 0.4,
            afterFirstWord: 0.3,
            beforeLastWord: 0.2,
            middleWords: 0.1
        },
        
        // Marcas comunes
        commonBrands: [],
        
        // Patrones de extracción
        brandExtractionPatterns: [],
        
        // Patrones de exclusión
        exclusionPatterns: [],
        
        // Pesos de coincidencia
        keywordMatch: 0.5,
        contextualMatch: 0.3,
        positionBonus: 0.1,
        supermarketSpecific: 0.5,
        privateLabel: 0.9
    },
    
    [StoreName.LA_ANONIMA]: {
        // Marcas propias de La Anónima
        privateLabels: ['La Anónima', 'Anónima', 'LA'],
        
        // Patrones La Anónima
        productPatterns: [
            /^La+Anónima/i,
            /^Anónima/i,
            /^La+Anónima.+/i
        ],
        
        // Indicadores de marca
        brandIndicators: ['Marca', 'Fabricante', 'Elaborado por'],
        
        // Posiciones comunes
        commonPositions: {
            titleStart: 0.6,
            afterFirstWord: 0.4,
            beforeLastWord: 0.3,
            middleWords: 0.2
        },
        
        // Marcas comunes
        commonBrands: [],
        
        // Patrones de extracción
        brandExtractionPatterns: [],
        
        // Patrones de exclusión
        exclusionPatterns: [],
        
        // Pesos de coincidencia
        keywordMatch: 0.6,
        contextualMatch: 0.7,
        positionBonus: 0.4,
        supermarketSpecific: 0.8,
        privateLabel: 0.9
    }
};

/**
 * Palabras que indican que el texto siguiente es una marca
 */
export const BRAND_INDICATORS = [
    'marca', 'brand', 'fabricante', 'elaborado por', 'hecho por',
    'producto de', 'importado por', 'distribuido por', '®', '™'
];

/**
 * Sufijos que pueden confundirse con marcas pero no lo son
 */
export const FALSE_BRAND_SUFFIXES = [
    'gr', 'kg', 'ml', 'l', 'lt', 'cc', 'mm', 'cm', 'm',
    'un', 'ud', 'pack', 'packs', 'unidad', 'unidades',
    'x', 'con', 'sin', 'para', 'de', 'la', 'el', 'y'
];

/**
 * Marcas comunes que aparecen en muchos supermercados
 * Esto ayuda a mejorar la precisión del matching
 */
export const COMMON_BRANDS = [
    'Coca Cola', 'Pepsi', 'Nestlé', 'Unilever', 'Procter & Gamble',
    'Danone', 'Mondelēz', 'Mars', 'Kraft', 'General Mills',
    'Kellogg\'s', 'Frito Lay', 'Bimbo', 'Arcor', 'Molinos',
    'La Serenísima', 'Sancor', 'Williner', 'Ilolay', 'Veronica'
];

/**
 * Patrones de productos que facilitan la extracción de marcas
 */
export const PRODUCT_BRAND_PATTERNS = {
    // Patrón: [MARCA] Producto Descripción
    bracketPattern: /^\[([^\]]+)\]\s*(.+)$/i,
    
    // Patrón: MARCA - Producto Descripción  
    dashPattern: /^([^-]+)\s*-\s*(.+)$/i,
    
    // Patrón: MARCA® Producto Descripción
    registeredPattern: /^([^®]+)®\s*(.+)$/i,
    
    // Patrón: MARCA™ Producto Descripción
    trademarkPattern: /^([^™]+)™\s*(.+)$/i,
    
    // Patrón: MARCA Producto Descripción (cantidad)
    parenthesisPattern: /^([^)]+)\s+(.+?)\s*\(([^)]+)\)$/i,
    
    // Patrón: Producto de MARCA
    dePattern: /^(.+?)\s+de\s+(.+)$/i,
    
    // Patrón: MARCA palabra números
    numberPattern: /^(.+?)\s+\w+\s+\d+$/i
};

/**
 * Configuración de pesos para diferentes tipos de coincidencia
 */
export const MATCH_WEIGHTS = {
    exactMatch: 1.0,
    fuzzyMatch: 0.8,
    keywordMatch: 0.7,
    contextualMatch: 0.6,
    positionBonus: 0.1,
    supermarketSpecific: 0.15,
    privateLabel: 0.2
};

/**
 * Función auxiliar para obtener el patrón de un supermercado específico
 */
export function getSupermarketPattern(store: StoreName): SupermarketPattern {
    return SUPERMARKET_BRAND_PATTERNS[store] || SUPERMARKET_BRAND_PATTERNS[StoreName.COTO];
}

/**
 * Verifica si una marca es una marca propia del supermercado
 */
export function isPrivateLabel(store: StoreName, brandName: string): boolean {
    const patterns = getSupermarketPattern(store);
    if (!patterns.privateLabels) return false;
    
    return patterns.privateLabels.some((label: string) => 
        brandName.toLowerCase().includes(label.toLowerCase())
    );
}

/**
 * Detecta el formato de producto basado en el supermercado
 */
export function detectProductFormat(store: StoreName, productTitle: string): string {
    const patterns = getSupermarketPattern(store);
    
    // Probar patrones específicos del supermercado
    if (patterns.productPatterns) {
        for (const pattern of patterns.productPatterns) {
            const match = productTitle.match(pattern);
            if (match) {
                return 'supermarket-specific';
            }
        }
    }
    
    // Probar patrones generales
    for (const [patternName, pattern] of Object.entries(PRODUCT_BRAND_PATTERNS)) {
        const match = productTitle.match(pattern);
        if (match) {
            return patternName;
        }
    }
    
    return 'unknown';
}

/**
 * Extrae la marca basándose en el formato detectado
 */
export function extractBrandByFormat(productTitle: string, format: string): string | null {
    switch (format) {
        case 'bracketPattern': {
            const match = productTitle.match(PRODUCT_BRAND_PATTERNS.bracketPattern);
            return match ? match[1].trim() : null;
        }
        
        case 'dashPattern': {
            const match = productTitle.match(PRODUCT_BRAND_PATTERNS.dashPattern);
            return match ? match[1].trim() : null;
        }
        
        case 'registeredPattern': {
            const match = productTitle.match(PRODUCT_BRAND_PATTERNS.registeredPattern);
            return match ? match[1].trim() : null;
        }
        
        case 'trademarkPattern': {
            const match = productTitle.match(PRODUCT_BRAND_PATTERNS.trademarkPattern);
            return match ? match[1].trim() : null;
        }
        
        case 'dePattern': {
            const match = productTitle.match(PRODUCT_BRAND_PATTERNS.dePattern);
            return match ? match[2].trim() : null; // La marca está después de "de"
        }
        
        default:
            return null;
    }
}

/**
 * Calcula la confianza basada en el formato y supermercado
 */
export function calculateFormatConfidence(format: string): number {
    const baseConfidence = {
        bracketPattern: 0.95,
        dashPattern: 0.9,
        registeredPattern: 0.95,
        trademarkPattern: 0.9,
        parenthesisPattern: 0.85,
        dePattern: 0.8,
        numberPattern: 0.7,
        supermarketSpecific: 0.85,
        unknown: 0.5
    };
    
    let confidence = baseConfidence[format as keyof typeof baseConfidence] || 0.5;
    
    // Bonus por supermercado específico
    if (format === 'supermarketSpecific') {
        confidence += MATCH_WEIGHTS.supermarketSpecific;
    }
    
    return Math.min(1.0, confidence);
}