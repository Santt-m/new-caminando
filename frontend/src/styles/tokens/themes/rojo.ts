import type { DesignTokens } from '../types';
import { spacing, typography, shadows } from '../primitives';

export const rojo: DesignTokens = {
    colors: {
        background: '345 50% 4%',
        foreground: '210 40% 98%',
        card: '345 50% 8%',
        cardForeground: '210 40% 98%',
        popover: '345 50% 6%',
        popoverForeground: '210 40% 98%',
        primary: '350 100% 60%',
        primaryForeground: '210 40% 98%',
        secondary: '345 50% 12%',
        secondaryForeground: '210 40% 98%',
        muted: '345 50% 12%',
        mutedForeground: '345 20% 70%',
        accent: '345 50% 12%',
        accentForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        destructiveSubtle: '0 80% 85%',
        destructiveSubtleForeground: '0 84% 10%',
        success: '142.1 70.6% 45.3%',
        successForeground: '144.4 96.6% 4.1%',
        successSubtle: '142 70% 80%', // Verde claro compatible con tema rojo
        successSubtleForeground: '142 76% 10%', // Texto verde oscuro
        warning: '48 96% 89%',
        warningForeground: '38 92% 50%',
        warningSubtle: '48 90% 80%',
        warningSubtleForeground: '38 92% 10%',
        info: '199 89% 48%',
        infoForeground: '210 40% 98%',
        infoSubtle: '199 80% 80%',
        infoSubtleForeground: '199 89% 10%',
        indigo: '350 100% 60%', // Mapeamos indigo al color primario del tema rojo
        indigoForeground: '210 40% 98%',
        border: '345 32% 18%',
        input: '345 32% 18%',
        ring: '350 100% 60%',
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
