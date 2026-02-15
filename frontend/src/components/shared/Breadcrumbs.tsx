import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
    return (
        <nav className={cn("flex items-center space-x-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 no-scrollbar", className)} aria-label="Breadcrumb">
            <Link
                to="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
            >
                <Home className="h-4 w-4" />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-50" />
                    {item.href && !item.active ? (
                        <Link
                            to={item.href}
                            className="hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={cn(
                            "font-medium",
                            item.active ? "text-foreground font-bold" : ""
                        )}>
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
};
