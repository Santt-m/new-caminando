/**
 * Utilidades para gestión de variantes de productos
 * Incluye generación de combinaciones, nombres y SKUs
 */

import type { AttributeDefinition } from '@/types/ecommerce';

/**
 * Genera el producto cartesiano de atributos seleccionados
 * 
 * Ejemplo:
 * Input: { color: ['Rojo', 'Azul'], talle: ['S', 'M'] }
 * Output: [
 *   { color: 'Rojo', talle: 'S' },
 *   { color: 'Rojo', talle: 'M' },
 *   { color: 'Azul', talle: 'S' },
 *   { color: 'Azul', talle: 'M' }
 * ]
 */
export function cartesianProduct(
    attributeValues: Record<string, string[]>
): Record<string, string>[] {
    const keys = Object.keys(attributeValues);

    if (keys.length === 0) {
        return [];
    }

    if (keys.length === 1) {
        const key = keys[0];
        return attributeValues[key].map(value => ({ [key]: value }));
    }

    // Algoritmo recursivo para producto cartesiano
    const firstKey = keys[0];
    const firstValues = attributeValues[firstKey];
    const restValues = { ...attributeValues };
    delete restValues[firstKey];

    const restCombinations = cartesianProduct(restValues);

    const result: Record<string, string>[] = [];

    for (const value of firstValues) {
        if (restCombinations.length === 0) {
            result.push({ [firstKey]: value });
        } else {
            for (const combo of restCombinations) {
                result.push({
                    [firstKey]: value,
                    ...combo
                });
            }
        }
    }

    return result;
}

/**
 * Genera un nombre descriptivo para una variante basado en sus atributos
 * 
 * Ejemplo:
 * Input: { color: 'Rojo', talle: 'M' }
 * Output: "Rojo - M"
 */
export function generateVariantName(
    attributes: Record<string, string>,
    separator: string = ' - '
): string {
    const values = Object.values(attributes).filter(Boolean);

    if (values.length === 0) {
        return 'Variante';
    }

    return values.join(separator);
}

/**
 * Genera un SKU automático para una variante
 * 
 * Ejemplo:
 * Input: { color: 'Rojo', talle: 'M' }
 * Output: "ROJO-M"
 */
export function generateVariantSku(
    attributes: Record<string, string>
): string {
    const values = Object.values(attributes)
        .filter(Boolean)
        .map(v => v
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 4) // Max 4 chars per attribute
        );

    return values.join('-');
}

/**
 * Obtiene los atributos que son tipo "select" (pueden generar combinaciones)
 */
export function getVariantAttributes(
    attributes: AttributeDefinition[]
): AttributeDefinition[] {
    return attributes.filter(attr =>
        attr.type === 'select' &&
        attr.active &&
        attr.values &&
        attr.values.length > 0
    );
}

/**
 * Convierte atributos en formato para producto cartesiano
 */
export function attributesToCartesianFormat(
    selectedKeys: string[],
    allAttributes: AttributeDefinition[]
): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const key of selectedKeys) {
        const attr = allAttributes.find(a => a.key === key);
        if (attr && attr.type === 'select' && attr.values) {
            result[key] = attr.values;
        }
    }

    return result;
}

/**
 * Obtiene el nombre traducido de un atributo
 */
export function getAttributeName(
    attr: AttributeDefinition,
    language: string = 'es'
): string {
    if (typeof attr.name === 'string') {
        return attr.name;
    }

    if (typeof attr.name === 'object') {
        return attr.name[language as keyof typeof attr.name] ||
            attr.name.es ||
            attr.name.en ||
            attr.name.pt ||
            attr.key;
    }

    return attr.key;
}

/**
 * Valida que un SKU sea único dentro de un conjunto de variantes
 */
export function isSkuUnique(
    sku: string,
    variants: Array<{ sku?: string }>,
    currentIndex?: number
): boolean {
    return !variants.some((v, idx) =>
        v.sku === sku && idx !== currentIndex
    );
}

/**
 * Cuenta el número de combinaciones posibles
 */
export function countCombinations(
    attributeValues: Record<string, string[]>
): number {
    const values = Object.values(attributeValues);

    if (values.length === 0) {
        return 0;
    }

    return values.reduce((total, arr) => total * arr.length, 1);
}
