import type { DesignTokens } from '../types';
import { spacing, typography, shadows } from '../primitives';

export const oscuro: DesignTokens = {
    colors: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        cardForeground: '210 40% 98%',
        popover: '222.2 84% 4.9%',
        popoverForeground: '210 40% 98%',
        primary: '210 40% 98%',
        primaryForeground: '222.2 47.4% 11.2%',
        secondary: '240 3.7% 15.9%',
        secondaryForeground: '210 40% 98%',
        muted: '240 3.7% 15.9%',
        mutedForeground: '240 5% 64.9%',
        accent: '240 3.7% 15.9%',
        accentForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        destructiveSubtle: '0 80% 85%', // Pale Red
        destructiveSubtleForeground: '0 84% 10%',
        success: '142.1 70.6% 45.3%',
        successForeground: '144.4 96.6% 4.1%',
        successSubtle: '142 70% 80%', // Verde claro para modo oscuro
        successSubtleForeground: '142 76% 10%', // Texto verde oscuro para contraste
        warning: '48 96% 89%',
        warningForeground: '38 92% 50%',
        warningSubtle: '48 90% 80%', // Pale Yellow
        warningSubtleForeground: '38 92% 10%',
        info: '199 89% 48%',
        infoForeground: '210 40% 98%',
        infoSubtle: '199 80% 80%', // Pale Blue
        infoSubtleForeground: '199 89% 10%',
        indigo: '243 75% 59%',
        indigoForeground: '0 0% 100%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '240 4.9% 83.9%',
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
