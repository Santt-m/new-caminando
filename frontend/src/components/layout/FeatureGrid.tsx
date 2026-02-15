import React from 'react';
import { cn } from '../../utils/cn';

interface FeatureGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: 1 | 2 | 3 | 4;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
    children,
    className,
    columns = 3,
}) => {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={cn(
            "grid gap-6 w-full auto-rows-fr",
            gridCols[columns],
            className
        )}>
            {children}
        </div>
    );
};
