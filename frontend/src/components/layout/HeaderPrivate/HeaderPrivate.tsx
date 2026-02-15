import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';
import type { Language } from '../../../contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import {
    Languages, ChevronDown, Bell, User, Settings, LogOut, Menu
} from 'lucide-react';
import { ThemeSelector } from '../../ui/ThemeSelector';
import { authService } from '../../../services/auth/authService';
import { useAuth } from '../../../hooks/useAuth';
import { MobileMenu } from '../Header/MobileMenu';
import { traduccionesHeader } from '../Header/traduccion';
import { BRANDING } from '../../../config/branding';

interface HeaderPrivateProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
    notificationCount?: number;
}

export const HeaderPrivate: React.FC<HeaderPrivateProps> = ({ user, notificationCount = 0 }) => {
    const { language, setLanguage, t } = useLanguage();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLanguageChange = async (newLang: Language) => {
        setLanguage(newLang);
        await authService.updatePreferences({ language: newLang });
    };

    const languageOptions = [
        { id: 'es', label: 'Español' },
        { id: 'en', label: 'English' },
        { id: 'pt', label: 'Português' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            label: t(traduccionesHeader, 'profile'),
            icon: <User className="h-4 w-4" />,
            onClick: () => navigate('/app/dashboard/ajustes')
        },
        {
            label: t(traduccionesHeader, 'settings'),
            icon: <Settings className="h-4 w-4" />,
            onClick: () => navigate('/app/dashboard/ajustes')
        },
        {
            label: t(traduccionesHeader, 'logout'),
            icon: <LogOut className="h-4 w-4" />,
            onClick: handleLogout
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="w-full flex h-16 items-center justify-between px-6">
                <Link to="/app/dashboard/inicio" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <img src="/logo.png" alt={BRANDING.appName} className="h-8 w-auto object-contain" />
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                        {BRANDING.appName}
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    {/* Desktop Navigation Links */}
                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/app/dashboard/inicio"
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {t(traduccionesHeader, 'dashboard')}
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop Theme & Language */}
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

                        {/* Notifications */}
                        <Link to="/app/dashboard/notificaciones" className="relative">
                            <button className="h-8 w-8 rounded-lg border-2 border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/50 flex items-center justify-center transition-all">
                                <Bell className="h-4 w-4" />
                                {notificationCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                        {notificationCount}
                                    </Badge>
                                )}
                            </button>
                        </Link>

                        {/* User Menu - Desktop */}
                        <div className="hidden md:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 h-8 px-2 rounded-lg border-2 border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/50 transition-all">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="hidden sm:inline-block text-sm font-medium">{user.name.split(' ')[0]}</span>
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t(traduccionesHeader, 'profile')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {userMenuItems.map((item, index) => (
                                        <DropdownMenuItem key={index} onClick={item.onClick}>
                                            <span className="flex items-center gap-2">
                                                {item.icon}
                                                {item.label}
                                            </span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile Trigger */}
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
