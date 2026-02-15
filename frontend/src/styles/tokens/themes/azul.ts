import type { DesignTokens } from '../types';
import { spacing, typography, shadows } from '../primitives';

export const azul: DesignTokens = {
    colors: {
        background: '222 47% 4%',
        foreground: '210 40% 98%',
        card: '222 47% 8%',
        cardForeground: '210 40% 98%',
        popover: '222 47% 6%',
        popoverForeground: '210 40% 98%',
        primary: '210 100% 66%',
        primaryForeground: '222.2 47.4% 11.2%',
        secondary: '222 47% 12%',
        secondaryForeground: '210 40% 98%',
        muted: '222 47% 15%',
        mutedForeground: '215 20% 70%',
        accent: '222 47% 12%',
        accentForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        destructiveSubtle: '0 80% 85%', // Pale Red
        destructiveSubtleForeground: '0 84% 10%',
        success: '142.1 70.6% 45.3%',
        successForeground: '144.4 96.6% 4.1%',
        successSubtle: '142 70% 80%', // Verde claro compatible con tema azul
        successSubtleForeground: '142 76% 10%', // Texto verde oscuro
        warning: '48 96% 89%',
        warningForeground: '38 92% 50%',
        warningSubtle: '48 90% 80%', // Pale Yellow
        warningSubtleForeground: '38 92% 10%',
        info: '199 89% 48%',
        infoForeground: '210 40% 98%',
        infoSubtle: '199 80% 80%', // Pale Blue
        infoSubtleForeground: '199 89% 10%',
        indigo: '210 100% 66%', // Mapeamos indigo al color primario del tema azul
        indigoForeground: '222.2 47.4% 11.2%',
        border: '222 47% 18%',
        input: '222 47% 18%',
        ring: '210 100% 66%',
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
