import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext } from './context';
import type { ThemeName } from '../../styles/tokens';
import { themes, tokensToCSSVariables } from '../../styles/tokens';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<ThemeName>(() => {
        const saved = localStorage.getItem('theme');
        if (saved && (saved === 'claro' || saved === 'oscuro' || saved === 'azul' || saved === 'rojo' || saved === 'verde')) {
            return saved as ThemeName;
        }

        // Detectar preferencia del sistema
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'oscuro';
        }
        return 'claro';
    });

    const toggleTheme = () => {
        setTheme(prev => prev === 'oscuro' ? 'claro' : 'oscuro');
    };

    useEffect(() => {
        localStorage.setItem('theme', theme);

        // Inyectar variables CSS del tema activo usando la función de conversión
        const activeTheme = themes[theme];
        if (activeTheme) {
            const cssVariables = tokensToCSSVariables(activeTheme);
            Object.entries(cssVariables).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });

            // Actualizar clase en body para tailwind dark mode si es necesario
            if (theme === 'oscuro') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [theme]);

    const value = {
        theme,
        setTheme,
        toggleTheme,
        tokens: themes[theme],
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

