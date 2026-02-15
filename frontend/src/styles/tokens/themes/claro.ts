import type { DesignTokens } from '../types';
import { spacing, typography, shadows } from '../primitives';

export const claro: DesignTokens = {
    colors: {
        background: '0 0% 100%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        cardForeground: '222.2 84% 4.9%',
        popover: '0 0% 100%',
        popoverForeground: '222.2 84% 4.9%',
        primary: '222.2 84% 4.9%',
        primaryForeground: '0 0% 100%',
        secondary: '220 14% 96%',
        secondaryForeground: '222.2 47.4% 11.2%',
        muted: '220 14% 96%',
        mutedForeground: '215.4 16.3% 46.9%',
        accent: '220 14% 96%',
        accentForeground: '222.2 47.4% 11.2%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        destructiveSubtle: '0 84% 35%', // Dark Red
        destructiveSubtleForeground: '0 0% 100%',
        success: '142.1, 76.2%, 36.3%',
        successForeground: '355.7, 100%, 97.3%',
        successSubtle: '142 76% 25% / 0.85', // Verde oscuro con 85% opacidad para modo claro
        successSubtleForeground: '0 0% 100%', // Texto blanco
        warning: '38 92% 50%',
        warningForeground: '48 96% 89%',
        warningSubtle: '38 92% 30%', // Dark Yellow/Orange
        warningSubtleForeground: '0 0% 100%',
        info: '199 89% 48%',
        infoForeground: '210 40% 98%',
        infoSubtle: '199 89% 30%', // Dark Blue
        infoSubtleForeground: '0 0% 100%',
        indigo: '243 75% 59%', // #6366f1
        indigoForeground: '0 0% 100%',
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
        ring: '222.2 84% 4.9%',
    },
    typography,
    spacing,
    shadows,
    radius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
    },
};
