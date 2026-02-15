
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryWidgetProps {
    total: number;
    used: number;
    usagePercentage: number;
}

export const MemoryWidget = ({ total, used, usagePercentage }: MemoryWidgetProps) => {
    const formatBytes = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    };

    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm h-full">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <label className="text-sm font-medium">Uso de Memoria</label>
                <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{usagePercentage.toFixed(2)}%</div>
            <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-500", usagePercentage > 80 ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${usagePercentage}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatBytes(used)} / {formatBytes(total)}</p>
        </div>
    );
};
