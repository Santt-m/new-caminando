
import { Cpu } from 'lucide-react';

interface CpuWidgetProps {
    count: number;
    model: string;
    loadAvg?: number; // Optional load average for more detail
}

export const CpuWidget = ({ count, model, loadAvg }: CpuWidgetProps) => {
    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm h-full">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <label className="text-sm font-medium">CPU Cores</label>
                <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{count} Núcleos</div>
            <p className="text-xs text-muted-foreground truncate" title={model}>{model}</p>
            {loadAvg !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">Load Avg (1m): {loadAvg.toFixed(2)}</p>
            )}
        </div>
    );
};
