/**
 * Definición de los tokens de color semánticos y de marca.
 */
export interface ColorTokens {
    // Base Colors
    background: string;
    foreground: string;

    // Surfaces
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;

    // States & Actions
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;

    // Feedback
    success: string;
    successForeground: string;
    successSubtle: string;
    successSubtleForeground: string;

    warning: string;
    warningForeground: string;
    warningSubtle: string;
    warningSubtleForeground: string;

    info: string;
    infoForeground: string;
    infoSubtle: string;
    infoSubtleForeground: string;

    destructiveSubtle: string;
    destructiveSubtleForeground: string;

    // Brand & Legacy (para compatibilidad)
    indigo: string;
    indigoForeground: string;

    // Borders & Inputs
    border: string;
    input: string;
    ring: string;
}

/**
 * Tipografía
 */
export interface TypographyTokens {
    fonts: {
        sans: string;
        mono: string;
        heading: string;
    };
    sizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
        '6xl': string;
    };
    weights: {
        light: string;
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
        extrabold: string;
    };
}

/**
 * Espaciado
 */
export type SpacingTokens = Record<string, string>;

/**
 * Agrupación de todos los tokens del sistema de diseño.
 */
export interface DesignTokens {
    colors: ColorTokens;
    typography: TypographyTokens;
    spacing: SpacingTokens;
    radius: {
        lg: string;
        md: string;
        sm: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
    };
}
