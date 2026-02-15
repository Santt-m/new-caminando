import React from 'react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/badge';

interface LayoutSectionProps {
    title: string;
    subtitle?: string;
    badge?: string;
    children: React.ReactNode;
    className?: string;
    headerClassName?: string;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({
    title,
    subtitle,
    badge,
    children,
    className,
    headerClassName,
}) => {
    return (
        <section className={cn("py-8 md:py-12", className)}>
            <div className="mb-8 space-y-2">
                <div className={cn("flex flex-col gap-3", headerClassName)}>
                    {badge && (
                        <div className="flex">
                            <Badge variant="default" className="text-xs">
                                {badge}
                            </Badge>
                        </div>
                    )}
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-heading">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-lg text-muted-foreground font-light max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div className="relative">
                {children}
            </div>
        </section>
    );
};
