import { createContext, useContext } from 'react';
import type { ThemeName } from '../../styles/tokens';
import { themes } from '../../styles/tokens';

export interface ThemeContextType {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    tokens: typeof themes.claro;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
