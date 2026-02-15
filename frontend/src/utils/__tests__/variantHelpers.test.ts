import { describe, it, expect } from 'vitest';
import {
    cartesianProduct,
    generateVariantName,
    generateVariantSku,
    countCombinations,
    isSkuUnique
} from '../variantHelpers';

describe('variantHelpers', () => {
    describe('cartesianProduct', () => {
        it('genera combinaciones correctamente con 2 atributos', () => {
            const input = {
                color: ['Rojo', 'Azul'],
                talle: ['S', 'M']
            };

            const result = cartesianProduct(input);

            expect(result).toHaveLength(4);
            expect(result).toContainEqual({ color: 'Rojo', talle: 'S' });
            expect(result).toContainEqual({ color: 'Rojo', talle: 'M' });
            expect(result).toContainEqual({ color: 'Azul', talle: 'S' });
            expect(result).toContainEqual({ color: 'Azul', talle: 'M' });
        });

        it('maneja un solo atributo', () => {
            const input = {
                color: ['Rojo', 'Azul', 'Verde']
            };

            const result = cartesianProduct(input);

            expect(result).toHaveLength(3);
            expect(result).toContainEqual({ color: 'Rojo' });
            expect(result).toContainEqual({ color: 'Azul' });
            expect(result).toContainEqual({ color: 'Verde' });
        });

        it('maneja 3 atributos', () => {
            const input = {
                color: ['Rojo', 'Azul'],
                talle: ['S', 'M'],
                material: ['Algodón']
            };

            const result = cartesianProduct(input);

            expect(result).toHaveLength(4); // 2 * 2 * 1
        });

        it('retorna array vacío si no hay atributos', () => {
            const result = cartesianProduct({});
            expect(result).toEqual([]);
        });
    });

    describe('generateVariantName', () => {
        it('genera nombre con múltiples atributos', () => {
            const name = generateVariantName({ color: 'Rojo', talle: 'M' });
            expect(name).toBe('Rojo - M');
        });

        it('genera nombre con un solo atributo', () => {
            const name = generateVariantName({ color: 'Rojo' });
            expect(name).toBe('Rojo');
        });

        it('maneja atributos vacíos', () => {
            const name = generateVariantName({});
            expect(name).toBe('Variante');
        });

        it('usa separador personalizado', () => {
            const name = generateVariantName({ color: 'Rojo', talle: 'M' }, ' / ');
            expect(name).toBe('Rojo / M');
        });
    });

    describe('generateVariantSku', () => {
        it('genera SKU en mayúsculas', () => {
            const sku = generateVariantSku({ color: 'Rojo', talle: 'M' });
            expect(sku).toBe('ROJO-M');
        });

        it('elimina acentos', () => {
            const sku = generateVariantSku({ color: 'Azúl', talle: 'médium' });
            expect(sku).toBe('AZUL-MEDI'); // Trunca a 4 chars
        });

        it('elimina caracteres especiales', () => {
            const sku = generateVariantSku({ color: 'Rojo/Negro', talle: 'X-L' });
            expect(sku).toBe('ROJO-XL');
        });

        it('trunca valores largos a 4 caracteres', () => {
            const sku = generateVariantSku({ color: 'Multicolor' });
            expect(sku).toBe('MULT');
        });
    });

    describe('countCombinations', () => {
        it('cuenta combinaciones correctamente', () => {
            const count = countCombinations({
                color: ['Rojo', 'Azul', 'Verde'],
                talle: ['S', 'M', 'L', 'XL']
            });
            expect(count).toBe(12); // 3 * 4
        });

        it('retorna 0 para objeto vacío', () => {
            const count = countCombinations({});
            expect(count).toBe(0);
        });

        it('maneja múltiples dimensiones', () => {
            const count = countCombinations({
                color: ['Rojo', 'Azul'],
                talle: ['S', 'M', 'L'],
                material: ['Algodón', 'Poliéster']
            });
            expect(count).toBe(12); // 2 * 3 * 2
        });
    });

    describe('isSkuUnique', () => {
        const variants = [
            { sku: 'PROD-001' },
            { sku: 'PROD-002' },
            { sku: 'PROD-003' }
        ];

        it('retorna true para SKU único', () => {
            expect(isSkuUnique('PROD-004', variants)).toBe(true);
        });

        it('retorna false para SKU duplicado', () => {
            expect(isSkuUnique('PROD-001', variants)).toBe(false);
        });

        it('permite el mismo SKU en el índice actual', () => {
            expect(isSkuUnique('PROD-002', variants, 1)).toBe(true);
        });
    });
});
