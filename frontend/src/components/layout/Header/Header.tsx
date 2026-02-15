import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';
import type { Language } from '../../../contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Logo } from '../../ui/Logo';
import {
    Languages, ChevronDown, Menu
} from 'lucide-react';
import { ThemeSelector } from '../../ui/ThemeSelector';
import { MobileMenu } from './MobileMenu';
import { traduccionesHeader } from './traduccion';

export const Header: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLanguageChange = async (newLang: Language) => {
        setLanguage(newLang);
    };

    const languageOptions = [
        { id: 'es', label: 'Español' },
        { id: 'en', label: 'English' },
        { id: 'pt', label: 'Português' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="w-full flex h-16 items-center justify-between px-4 md:px-6">
                <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95">
                    <Logo />
                </Link>

                <nav className="flex items-center gap-6">
                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {t(traduccionesHeader, 'home')}
                        </Link>
                        <Link
                            to="/productos"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {t(traduccionesHeader, 'products')}
                        </Link>
                        <Link
                            to="/features"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {t(traduccionesHeader, 'features')}
                        </Link>
                        <Link
                            to="/about"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {t(traduccionesHeader, 'about')}
                        </Link>
                        <Link
                            to="/faq"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {t(traduccionesHeader, 'faq')}
                        </Link>
                        <Link
                            to="/contacto"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {t(traduccionesHeader, 'contact')}
                        </Link>

                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop Theme & Language - Hidden on Mobile */}
                        <div className="hidden md:flex items-center gap-3">
                            <ThemeSelector />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 h-8 px-3 rounded-lg border-2 border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/50 hover:shadow-sm text-foreground font-bold text-sm transition-all duration-300 group">
                                        <Languages className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span className="uppercase text-xs">{language}</span>
                                        <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {languageOptions.map((option) => (
                                        <DropdownMenuItem key={option.id} onClick={() => handleLanguageChange(option.id as Language)}>
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile Menu Trigger */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg border-2 border-border bg-muted/20 text-foreground transition-all hover:bg-muted/30 hover:border-primary/50"
                            >
                                <Menu className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </header>
    );
};
