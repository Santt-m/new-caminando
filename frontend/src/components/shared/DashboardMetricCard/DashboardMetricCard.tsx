import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardMetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        direction: 'up' | 'down';
    };
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
}) => {
    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
                {trend && (
                    <Badge
                        variant={trend.direction === 'up' ? 'default' : 'destructive'}
                        className={trend.direction === 'up' ? 'bg-green-500 hover:bg-green-600 flex items-center gap-1' : 'flex items-center gap-1'}
                    >
                        {trend.direction === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {trend.value}%
                    </Badge>
                )}
            </div>

            <div>
                <p className="text-sm text-muted-foreground mb-2">{title}</p>
                <div className="text-3xl font-bold text-foreground mb-1">
                    {value}
                </div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
        </Card>
    );
};
