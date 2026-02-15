
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventLoopWidgetProps {
    lag: number;
}

export const EventLoopWidget = ({ lag }: EventLoopWidgetProps) => {
    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm h-full">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <label className="text-sm font-medium">Latencia (Event Loop)</label>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{lag?.toFixed(2) || '0'} ms</div>
            <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-500",
                        lag > 50 ? "bg-destructive" :
                            lag > 20 ? "bg-warning" : "bg-success"
                    )}
                    style={{ width: `${Math.min(100, (lag / 100) * 100)}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                {lag < 20 ? 'Excelente' : lag < 50 ? 'Normal' : 'Alta latencia'}
            </p>
        </div>
    );
};
