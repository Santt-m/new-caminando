import type { DesignTokens } from '../types';
import { spacing, typography, shadows } from '../primitives';

export const verde: DesignTokens = {
    colors: {
        background: '150 50% 3%',
        foreground: '210 40% 98%',
        card: '150 50% 6%',
        cardForeground: '210 40% 98%',
        popover: '150 50% 5%',
        popoverForeground: '210 40% 98%',
        primary: '150 100% 50%',
        primaryForeground: '150 100% 10%',
        secondary: '150 50% 10%',
        secondaryForeground: '210 40% 98%',
        muted: '150 50% 10%',
        mutedForeground: '150 20% 70%',
        accent: '150 50% 10%',
        accentForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        destructiveSubtle: '0 80% 85%',
        destructiveSubtleForeground: '0 84% 10%',
        success: '142.1 70.6% 45.3%',
        successForeground: '144.4 96.6% 4.1%',
        successSubtle: '142 70% 80%', // Verde claro compatible con tema verde
        successSubtleForeground: '142 76% 10%', // Texto verde oscuro
        warning: '48 96% 89%',
        warningForeground: '38 92% 50%',
        warningSubtle: '48 90% 80%',
        warningSubtleForeground: '38 92% 10%',
        info: '199 89% 48%',
        infoForeground: '210 40% 98%',
        infoSubtle: '199 80% 80%',
        infoSubtleForeground: '199 89% 10%',
        indigo: '150 100% 50%', // Mapeamos indigo al color primario del tema verde
        indigoForeground: '150 100% 10%',
        border: '150 32% 15%',
        input: '150 32% 15%',
        ring: '150 100% 50%',
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
