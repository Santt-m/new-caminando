import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) => {
    return (
        <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline space-x-3">
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <div className={cn(
                        "text-xs font-medium",
                        trendUp ? "text-green-500" : "text-red-500"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}
