import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Sun, Moon, Droplets, Flame, Leaf, Zap, Home, Mail, Info, HelpCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useTheme } from '../../../hooks/useTheme';
import { useLanguage } from '../../../hooks/useLanguage';
import type { ThemeName } from '../../../styles/tokens';
import type { Language } from '../../../contexts/LanguageContext';
import { traduccionesHeader } from './traduccion';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../ui/Logo';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose
}) => {
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const themeOptions = [
        { value: 'claro', label: t(traduccionesHeader, 'themeLight'), icon: <Sun className="h-4 w-4" /> },
        { value: 'oscuro', label: t(traduccionesHeader, 'themeDark'), icon: <Moon className="h-4 w-4" /> },
        { value: 'azul', label: t(traduccionesHeader, 'themeBlue'), icon: <Droplets className="h-4 w-4" /> },
        { value: 'rojo', label: t(traduccionesHeader, 'themeRed'), icon: <Flame className="h-4 w-4" /> },
        { value: 'verde', label: t(traduccionesHeader, 'themeGreen'), icon: <Leaf className="h-4 w-4" /> },
    ];

    const languageOptions = [
        { value: 'es', label: 'Español' },
        { value: 'en', label: 'English' },
        { value: 'pt', label: 'Português' },
    ];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-background border-l border-border shadow-2xl flex flex-col"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-border">
                            <Logo size="md" />
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Navigation Links */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-2">{t(traduccionesHeader, 'navigation')}</p>
                                <Link
                                    to="/"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                                >
                                    <Home className="h-5 w-5 text-primary" />
                                    {t(traduccionesHeader, 'home')}
                                </Link>
                                <Link
                                    to="/productos"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                                >
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    {t(traduccionesHeader, 'products')}
                                </Link>
                                <Link
                                    to="/features"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                                >
                                    <Zap className="h-5 w-5 text-primary" />
                                    {t(traduccionesHeader, 'features')}
                                </Link>
                                <Link
                                    to="/about"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                                >
                                    <Info className="h-5 w-5 text-primary" />
                                    {t(traduccionesHeader, 'about')}
                                </Link>
                                <Link
                                    to="/faq"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                                >
                                    <HelpCircle className="h-5 w-5 text-primary" />
                                    {t(traduccionesHeader, 'faq')}
                                </Link>

                                <Link
                                    to="/contacto"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                                >
                                    <Mail className="h-5 w-5 text-primary" />
                                    {t(traduccionesHeader, 'contact')}
                                </Link>
                                {/* Removed Cart Link as per user request (unified in sidebar) */}
                            </div>

                            {/* Settings Group */}
                            <div className="space-y-6">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-2">{t(traduccionesHeader, 'preferences')}</p>

                                <div className="space-y-4 px-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t(traduccionesHeader, 'theme')}</label>
                                        <Select
                                            value={theme}
                                            onValueChange={(val) => setTheme(val as ThemeName)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t(traduccionesHeader, 'theme')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {themeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            {option.icon}
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t(traduccionesHeader, 'language')}</label>
                                        <Select
                                            value={language}
                                            onValueChange={(val) => setLanguage(val as Language)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t(traduccionesHeader, 'language')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {languageOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
