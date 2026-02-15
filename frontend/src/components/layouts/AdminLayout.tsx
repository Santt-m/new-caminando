import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "../admin/layout/AdminSidebar";
import { useLanguage } from "@/hooks/useLanguage";
import { traducciones } from "./traduccion";
import { UserMenu } from "../admin/layout/UserMenu";
import { cn } from "@/lib/utils";

export const AdminLayout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background font-sans antialiased overflow-x-hidden">
            {/* Desktop Sidebar */}
            <div className={cn(
                "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:bg-card transition-all duration-300 ease-in-out z-40",
                isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
            )}>
                <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
            </div>

            {/* Main Content */}
            <div className={cn(
                "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
            )}>
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
                    {/* Mobile Sidebar Trigger */}
                    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <AdminSidebar />
                        </SheetContent>
                    </Sheet>

                    <div className="flex-1 flex items-center overflow-hidden">
                        <h1 className="text-lg font-semibold md:text-xl truncate">
                            {t(traducciones, 'adminPanel')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <UserMenu />
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
