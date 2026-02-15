import { Link, useLocation } from "react-router-dom";
import { useState } from 'react';
import { BRANDING } from "@/config/branding";
import {
    LayoutDashboard,
    Users,
    Ticket,
    Settings,
    Shield,
    Image,
    Database,
    Languages,
    LogOut,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FileJson,
    Zap,
    Mail,
    ShoppingBag,
    FolderTree,
    Tag,
    Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { traduccionesSidebar } from "@/components/layout/traduccion";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { AdminTicketsService } from "@/services/admin/tickets.service";
import { useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const languageOptions = [
    { id: 'es', label: 'Español' },
    { id: 'en', label: 'English' },
    { id: 'pt', label: 'Português' }
];

interface AdminSidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

interface SidebarItem {
    icon: React.ElementType;
    label: string;
    href: string;
    badge?: number;
    subItems?: { icon?: React.ElementType, label: string, href: string }[];
}

export const AdminSidebar = ({ isCollapsed = false, onToggle }: AdminSidebarProps) => {
    const location = useLocation();
    const { logout, admin } = useAdminAuth();
    const { language, setLanguage, t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState<number>(0);

    // Fetch unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const count = await AdminTicketsService.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        fetchUnreadCount();
        // Set up interval for polling (optional but good for a "real-time" feel)
        const interval = setInterval(fetchUnreadCount, 60000); // every 1 min
        return () => clearInterval(interval);
    }, []);

    // State for expanded items
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const sidebarItems: SidebarItem[] = [
        { icon: LayoutDashboard, label: t(traduccionesSidebar, 'dashboard'), href: "/panel/dashboard" },
        { icon: Users, label: t(traduccionesSidebar, 'users'), href: "/panel/users" },
        {
            icon: Ticket,
            label: t(traduccionesSidebar, 'tickets'),
            href: "/panel/tickets",
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        {
            icon: ShoppingBag,
            label: t(traduccionesSidebar, 'ecommerce'),
            href: "/panel/ecommerce",
            subItems: [
                { icon: ShoppingBag, label: t(traduccionesSidebar, 'products'), href: "/panel/products" },
                { icon: FolderTree, label: t(traduccionesSidebar, 'categories'), href: "/panel/categories" },
                { icon: Tag, label: t(traduccionesSidebar, 'brands'), href: "/panel/brands" },
                { icon: Sliders, label: t(traduccionesSidebar, 'attributes'), href: "/panel/attributes" },
            ]
        },
        {
            icon: Database,
            label: t(traduccionesSidebar, 'database'),
            href: "/panel/database",
            subItems: [
                { icon: FileJson, label: t(traduccionesSidebar, 'mongodb'), href: "/panel/database/mongodb" },
                { icon: Zap, label: t(traduccionesSidebar, 'redis'), href: "/panel/database/redis" },
                { icon: Image, label: t(traduccionesSidebar, 'images'), href: "/panel/database/cloudinary" },
            ]
        },
        // { icon: Image, label: t(traduccionesSidebar, 'images'), href: "/panel/database/cloudinary" }, // Moved to sub-item
        { icon: LayoutDashboard, label: t(traduccionesSidebar, 'campaigns'), href: "/panel/campaigns" },
        { icon: Database, label: t(traduccionesSidebar, 'scraper'), href: "/panel/scraper" },
        { icon: Mail, label: t(traduccionesSidebar, 'emails'), href: "/panel/emails" },
        { icon: Shield, label: t(traduccionesSidebar, 'security'), href: "/panel/security" },
        { icon: Settings, label: t(traduccionesSidebar, 'system'), href: "/panel/settings" },
    ];

    const toggleExpand = (href: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation when clicking toggle
        e.stopPropagation();
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        );
    };

    return (
        <div className="flex flex-col h-full py-4 overflow-hidden">
            <div className={cn("px-6 py-2 transition-all duration-300", isCollapsed && "px-4")}>
                <h2 className={cn("text-2xl font-bold tracking-tight text-primary truncate", isCollapsed && "text-xl text-center")}>
                    {isCollapsed ? BRANDING.appName.charAt(0) : BRANDING.appName}
                    {!isCollapsed && (
                        <span className="text-foreground text-sm font-normal ml-1 italic opacity-70">Admin</span>
                    )}
                </h2>
            </div>
            <div className={cn("flex-1 px-3 py-6 space-y-1 overflow-y-auto", isCollapsed && "px-2")}>
                {sidebarItems.map((item: SidebarItem) => {
                    const isActive = location.pathname.startsWith(item.href);
                    const isExpanded = expandedItems.includes(item.href);
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    if (isCollapsed && hasSubItems) {
                        // Collapsed Mode with Dropdown
                        return (
                            <DropdownMenu key={item.href}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant={isActive ? "secondary" : "ghost"}
                                                className={cn(
                                                    "w-full justify-center px-0 gap-3 text-sm transition-all duration-300 relative",
                                                    isActive && "bg-secondary/50 font-semibold"
                                                )}
                                            >
                                                <item.icon className="h-5 w-5 shrink-0 mx-auto" />
                                                {item.badge !== undefined && (
                                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                                                        {item.badge > 9 ? '9+' : item.badge}
                                                    </span>
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent side="right" align="start" className="w-48 ml-2">
                                    <DropdownMenuItem asChild>
                                        <Link to={item.href} className="font-semibold cursor-pointer w-full flex items-center gap-2">
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                    {item.subItems?.map((sub) => (
                                        <DropdownMenuItem key={sub.href} asChild>
                                            <Link to={sub.href} className="cursor-pointer pl-4 w-full flex items-center gap-2">
                                                {sub.icon && <sub.icon className="h-4 w-4" />}
                                                {sub.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        );
                    }

                    return (
                        <div key={item.href} className="space-y-1">
                            {/* Main Item */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={cn(
                                                "flex-1 justify-start gap-3 text-sm transition-all duration-300",
                                                isActive && "bg-secondary/50 font-semibold",
                                                isCollapsed && "justify-center px-0"
                                            )}
                                            asChild
                                        >
                                            <Link to={item.href} className="relative">
                                                <item.icon className={cn("h-5 w-5 shrink-0", isCollapsed && "mx-auto")} />
                                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                                                {item.badge !== undefined && (
                                                    <span className={cn(
                                                        "flex items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold",
                                                        isCollapsed
                                                            ? "absolute top-1 right-1 h-4 w-4"
                                                            : "ml-auto px-1.5 h-5 min-w-[20px]"
                                                    )}>
                                                        {item.badge > 99 ? '99+' : item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </Button>
                                        {/* Toggle Button for Submenu */}
                                        {!isCollapsed && hasSubItems && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 shrink-0 hover:bg-muted"
                                                onClick={(e) => toggleExpand(item.href, e)}
                                            >
                                                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                            </Button>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right">
                                        {item.label}
                                    </TooltipContent>
                                )}
                            </Tooltip>

                            {/* Submenu Items */}
                            {!isCollapsed && hasSubItems && isExpanded && (
                                <div className="pl-9 space-y-1">
                                    {item.subItems?.map(sub => {
                                        const isSubActive = location.pathname === sub.href;
                                        return (
                                            <Button
                                                key={sub.href}
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "w-full justify-start h-8 text-xs font-normal",
                                                    isSubActive && "bg-secondary/30 text-primary font-medium"
                                                )}
                                                asChild
                                            >
                                                <Link to={sub.href} className="flex items-center gap-2">
                                                    {sub.icon && <sub.icon className="h-4 w-4 shrink-0" />}
                                                    {sub.label}
                                                </Link>
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className={cn("px-4 py-4 border-t mt-auto transition-all duration-300", isCollapsed && "px-2")}>
                {/* Admin Profile Mini-info */}
                <div className={cn("flex items-center gap-3 mb-4 p-2 rounded-lg bg-muted/30 transition-all duration-300", isCollapsed && "justify-center p-1")}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Users className="h-4 w-4" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-semibold truncate leading-none mb-1">{admin?.name || 'Admin'}</span>
                            <span className="text-[10px] text-muted-foreground truncate opacity-70">{admin?.email}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn("flex-1", isCollapsed && "w-full")}>
                                    <ThemeSelector className={cn("flex-1 border bg-background h-8 p-0", isCollapsed && "w-full")} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {t(traduccionesSidebar, 'theme')}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className={cn("flex-1 h-8 gap-2 text-[10px] font-bold uppercase", isCollapsed && "w-full")}>
                                                <Languages className="h-3.5 w-3.5" />
                                                {!isCollapsed && (
                                                    <>
                                                        {language}
                                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                                    </>
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align={isCollapsed ? "center" : "end"} side="right" className="w-40">
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
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {t(traduccionesSidebar, 'language')}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => logout()}
                                className={cn(
                                    "w-full h-8 gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                {!isCollapsed && t(traduccionesSidebar, 'logout')}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {t(traduccionesSidebar, 'logout')}
                        </TooltipContent>
                    </Tooltip>
                </div>

            </div>
            {/* Desktop Toggle Button */}
            {onToggle && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onToggle}
                            className={cn(
                                "hidden lg:flex absolute -right-3 bottom-32 h-6 w-6 rounded-full bg-background border shadow-sm z-50 hover:bg-accent hover:text-accent-foreground transition-all duration-300",
                                isCollapsed && "right-[-12px]"
                            )}
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {isCollapsed ? "Expandir menú" : "Contraer menú"}
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
};
