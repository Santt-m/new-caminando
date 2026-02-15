import type { DesignTokens } from './types';
import { claro } from './themes/claro';
import { oscuro } from './themes/oscuro';
import { azul } from './themes/azul';
import { rojo } from './themes/rojo';
import { verde } from './themes/verde';

export * from './types';

export type ThemeName = 'claro' | 'oscuro' | 'azul' | 'rojo' | 'verde';

export const themes: Record<ThemeName, DesignTokens> = {
    claro,
    oscuro,
    azul,
    rojo,
    verde,
};

/**
 * Convierte un objeto de tokens en un mapa de variables CSS planas.
 */
export const tokensToCSSVariables = (tokens: DesignTokens): Record<string, string> => {
    const variables: Record<string, string> = {};

    // Helper para aplanar objetos y convertirlos a kebab-case
    const flatten = (obj: Record<string, unknown>, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
            // Convertir camelCase a kebab-case y manejar números (2xl -> 2xl)
            const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            const currentKey = prefix ? `${prefix}-${kebabKey}` : kebabKey;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                flatten(value as Record<string, unknown>, currentKey);
            } else {
                variables[`--t-${currentKey}`] = value as string;
            }
        });
    };

    flatten(tokens as unknown as Record<string, unknown>);

    return variables;
};

/**
 * Genera el string CSS completo para inyección.
 */
export const generateThemeCSS = (themeName: ThemeName): string => {
    const tokens = themes[themeName];
    const variables = tokensToCSSVariables(tokens);

    const cssVars = Object.entries(variables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');

    return `:root {\n${cssVars}\n}`;
};
