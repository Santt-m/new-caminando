import { Link, useLocation } from "react-router-dom";
import { BRANDING } from "@/config/branding";
import {
    Home,
    Settings,
    Bell,
    LogOut,
    ChevronDown,
    Languages,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { traduccionesSidebar } from "../traduccion";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const languageOptions = [
    { id: 'es', label: 'Español' },
    { id: 'en', label: 'English' },
    { id: 'pt', label: 'Português' }
];

export const AppSidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    const sidebarItems = [
        { icon: Home, label: t(traduccionesSidebar, 'home'), href: "/app/dashboard/inicio" },
        { icon: Bell, label: t(traduccionesSidebar, 'notifications'), href: "/app/dashboard/notificaciones" },
        { icon: Settings, label: t(traduccionesSidebar, 'settings'), href: "/app/dashboard/ajustes" },
    ];

    return (
        <div className="flex flex-col h-full py-4 overflow-hidden">
            <div className="px-6 py-2">
                <h2 className="text-2xl font-bold tracking-tight text-primary">
                    {BRANDING.appName}
                    <span className="text-foreground text-sm font-normal ml-1 italic opacity-70">App</span>
                </h2>
            </div>
            <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn("w-full justify-start gap-3 text-sm", isActive && "bg-secondary/50 font-semibold")}
                            asChild
                        >
                            <Link to={item.href}>
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        </Button>
                    );
                })}
            </div>
            <div className="px-4 py-4 border-t mt-auto">
                {/* User Profile Mini-info */}
                <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-muted/30">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold truncate leading-none mb-1">{user?.name || 'Usuario'}</span>
                        <span className="text-[10px] text-muted-foreground truncate opacity-70">{user?.email}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <ThemeSelector className="flex-1 border bg-background h-8 p-0" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 h-8 gap-2 text-[10px] font-bold uppercase">
                                    <Languages className="h-3.5 w-3.5" />
                                    {language}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="top" className="w-40">
                                {languageOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.id}
                                        onClick={() => setLanguage(option.id as any)}
                                        className={cn("text-xs", language === option.id && "bg-accent font-bold")}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logout()}
                        className="w-full h-8 gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        {t(traduccionesSidebar, 'logout')}
                    </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40">
                    <p className="text-[10px] text-muted-foreground/50 text-center tracking-widest uppercase font-medium">
                        v1.0.0 Serverless
                    </p>
                </div>
            </div>
        </div>
    );
};
