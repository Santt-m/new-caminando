/**
 * Utilidades para manejo de códigos EAN (European Article Number)
 * Incluye validación, generación y utilidades para scraping
 */

export interface EANInfo {
    ean: string;
    isValid: boolean;
    type: 'EAN-8' | 'EAN-13' | 'UPC-A' | 'INVALID';
    countryCode?: string;
    manufacturerCode?: string;
    productCode?: string;
    checkDigit?: number;
    calculatedCheckDigit?: number;
}

/**
 * Valida un código EAN y retorna información detallada
 */
export function validateEAN(ean: string): EANInfo {
    // Limpiar el código - remover espacios y guiones
    const cleanEAN = ean.replace(/[\s-]/g, '');
    
    // Verificar longitud
    if (!/^\d+$/.test(cleanEAN)) {
        return {
            ean: cleanEAN,
            isValid: false,
            type: 'INVALID'
        };
    }
    
    const length = cleanEAN.length;
    let type: 'EAN-8' | 'EAN-13' | 'UPC-A' | 'INVALID';
    
    switch (length) {
        case 8:
            type = 'EAN-8';
            break;
        case 12:
            type = 'UPC-A';
            break;
        case 13:
            type = 'EAN-13';
            break;
        default:
            return {
                ean: cleanEAN,
                isValid: false,
                type: 'INVALID'
            };
    }
    
    // Calcular dígito de control
    const digits = cleanEAN.split('').map(Number);
    const checkDigit = digits[digits.length - 1];
    const payload = digits.slice(0, -1);
    
    let sum = 0;
    for (let i = 0; i < payload.length; i++) {
        const multiplier = i % 2 === 0 ? 3 : 1;
        sum += payload[i] * multiplier;
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    const isValid = checkDigit === calculatedCheckDigit;
    
    // Extraer información según el tipo
    let countryCode: string | undefined;
    let manufacturerCode: string | undefined;
    let productCode: string | undefined;
    
    if (isValid) {
        if (type === 'EAN-13') {
            countryCode = cleanEAN.substring(0, 3);
            manufacturerCode = cleanEAN.substring(3, 8);
            productCode = cleanEAN.substring(8, 12);
        } else if (type === 'EAN-8') {
            countryCode = cleanEAN.substring(0, 2) + '0'; // Aproximado
            productCode = cleanEAN.substring(2, 7);
        } else if (type === 'UPC-A') {
            countryCode = '000'; // USA/Canadá
            manufacturerCode = cleanEAN.substring(0, 6);
            productCode = cleanEAN.substring(6, 11);
        }
    }
    
    return {
        ean: cleanEAN,
        isValid,
        type,
        countryCode,
        manufacturerCode,
        productCode,
        checkDigit,
        calculatedCheckDigit
    };
}

/**
 * Genera un dígito de control para un código EAN incompleto
 */
export function calculateCheckDigit(eanWithoutCheck: string): number {
    const digits = eanWithoutCheck.split('').map(Number);
    
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        const multiplier = i % 2 === 0 ? 3 : 1;
        sum += digits[i] * multiplier;
    }
    
    return (10 - (sum % 10)) % 10;
}

/**
 * Formatea un código EAN para visualización
 */
export function formatEAN(ean: string): string {
    const cleanEAN = ean.replace(/[\s-]/g, '');
    const length = cleanEAN.length;
    
    if (length === 13) {
        return `${cleanEAN.substring(0, 3)}-${cleanEAN.substring(3, 8)}-${cleanEAN.substring(8, 12)}-${cleanEAN.substring(12, 13)}`;
    } else if (length === 8) {
        return `${cleanEAN.substring(0, 4)}-${cleanEAN.substring(4, 7)}-${cleanEAN.substring(7, 8)}`;
    } else if (length === 12) {
        return `${cleanEAN.substring(0, 6)}-${cleanEAN.substring(6, 11)}-${cleanEAN.substring(11, 12)}`;
    }
    
    return cleanEAN;
}

/**
 * Intenta extraer un EAN de un texto (útil para scraping)
 */
export function extractEANFromText(text: string): string[] {
    // Patrones comunes para EAN en texto
    const patterns = [
        // EAN-13
        /\b\d{13}\b/g,
        // EAN-8
        /\b\d{8}\b/g,
        // UPC-A (12 dígitos)
        /\b\d{12}\b/g,
        // Formatos con guiones o espacios
        /\b\d{3}[-\s]?\d{5}[-\s]?\d{5}[-\s]?\d\b/g, // EAN-13 con formato
        /\b\d{4}[-\s]?\d{3}[-\s]?\d\b/g, // EAN-8 con formato
        /\b\d{6}[-\s]?\d{5}[-\s]?\d\b/g // UPC-A con formato
    ];
    
    const foundEANs: string[] = [];
    
    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const cleanEAN = match.replace(/[\s-]/g, '');
                if (validateEAN(cleanEAN).isValid && !foundEANs.includes(cleanEAN)) {
                    foundEANs.push(cleanEAN);
                }
            });
        }
    }
    
    return foundEANs;
}

/**
 * Intenta extraer un EAN de atributos HTML (útil para scraping)
 */
export function extractEANFromAttributes(attributes: Record<string, string>): string | null {
    const eanFields = [
        'ean', 'EAN', 'ean_code', 'eanCode',
        'barcode', 'BARCODE', 'bar_code', 'barCode',
        'upc', 'UPC', 'upc_code', 'upcCode',
        'product_code', 'productCode', 'codigo', 'codigo_barras'
    ];
    
    for (const field of eanFields) {
        const value = attributes[field];
        if (value) {
            const cleanValue = value.replace(/[\s-]/g, '');
            if (/^\d{8,13}$/.test(cleanValue) && validateEAN(cleanValue).isValid) {
                return cleanValue;
            }
        }
    }
    
    return null;
}

/**
 * Genera un EAN temporal para productos sin EAN (útil para scraping)
 */
export function generateTemporaryEAN(store: string, productId: string): string {
    const storeCode = store.substring(0, 3).toUpperCase().padEnd(3, 'X');
    const timestamp = Date.now().toString().slice(-6);
    const productHash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString().slice(-2);
    
    const baseCode = `2${storeCode}${timestamp}${productHash}`; // 2 = prefijo para EAN temporales
    const checkDigit = calculateCheckDigit(baseCode);
    
    return baseCode + checkDigit;
}

/**
 * Verifica si un EAN es temporal (generado por el sistema)
 */
export function isTemporaryEAN(ean: string): boolean {
    return ean.startsWith('2') && ean.length === 13;
}

/**
 * Compara dos EANs y retorna información sobre su relación
 */
export function compareEANs(ean1: string, ean2: string): {
    areEqual: boolean;
    areRelated: boolean;
    relationship?: 'same-product' | 'same-family' | 'variant' | 'different';
    reason?: string;
} {
    const clean1 = ean1.replace(/[\s-]/g, '');
    const clean2 = ean2.replace(/[\s-]/g, '');
    
    if (clean1 === clean2) {
        return {
            areEqual: true,
            areRelated: true,
            relationship: 'same-product'
        };
    }
    
    const info1 = validateEAN(clean1);
    const info2 = validateEAN(clean2);
    
    if (!info1.isValid || !info2.isValid) {
        return {
            areEqual: false,
            areRelated: false,
            relationship: 'different',
            reason: 'Uno o ambos EANs son inválidos'
        };
    }
    
    // Verificar si son de la misma familia (mismo fabricante y código de producto base)
    if (info1.manufacturerCode && info2.manufacturerCode && 
        info1.productCode && info2.productCode) {
        if (info1.manufacturerCode === info2.manufacturerCode) {
            // Mismo fabricante - podrían ser variantes del mismo producto
            const productCode1 = info1.productCode.slice(0, -1); // Remover último dígito de variante
            const productCode2 = info2.productCode.slice(0, -1);
            
            if (productCode1 === productCode2) {
                return {
                    areEqual: false,
                    areRelated: true,
                    relationship: 'variant',
                    reason: 'Mismo fabricante y código de producto base'
                };
            }
            
            return {
                areEqual: false,
                areRelated: true,
                relationship: 'same-family',
                reason: 'Mismo fabricante'
            };
        }
    }
    
    return {
        areEqual: false,
        areRelated: false,
        relationship: 'different',
        reason: 'Diferentes fabricantes o códigos de producto'
    };
}