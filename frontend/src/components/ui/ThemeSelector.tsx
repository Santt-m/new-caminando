import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { ThemeName } from '@/styles/tokens';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import {
    Sun, Moon, Droplets, Flame, Leaf, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// We reuse the header translations for themes as they are already defined there
import { traduccionesHeader } from '../layout/Header/traduccion';

interface ThemeSelectorProps {
    className?: string;
    showLabel?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    className,
    showLabel = true
}) => {
    const { theme, setTheme } = useTheme();
    const { t } = useLanguage();

    const themeOptions = [
        { id: 'claro', label: t(traduccionesHeader, 'themeLight'), icon: <Sun className="h-4 w-4" /> },
        { id: 'oscuro', label: t(traduccionesHeader, 'themeDark'), icon: <Moon className="h-4 w-4" /> },
        { id: 'azul', label: t(traduccionesHeader, 'themeBlue'), icon: <Droplets className="h-4 w-4" /> },
        { id: 'rojo', label: t(traduccionesHeader, 'themeRed'), icon: <Flame className="h-4 w-4" /> },
        { id: 'verde', label: t(traduccionesHeader, 'themeGreen'), icon: <Leaf className="h-4 w-4" /> },
    ];

    const currentThemeInfo = themeOptions.find(opt => opt.id === theme);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-all text-foreground font-medium text-xs",
                        className
                    )}
                >
                    <span className="shrink-0">
                        {currentThemeInfo?.icon}
                    </span>
                    {showLabel && (
                        <span className="truncate capitalize">{theme}</span>
                    )}
                    <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-40">
                {themeOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.id}
                        onClick={() => setTheme(option.id as ThemeName)}
                        className={cn(theme === option.id && "bg-accent font-bold")}
                    >
                        <span className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
