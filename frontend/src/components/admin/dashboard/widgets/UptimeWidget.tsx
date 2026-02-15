
import { Server } from 'lucide-react';

interface UptimeWidgetProps {
    uptime: number; // seconds
    platform: string;
    release: string;
}

export const UptimeWidget = ({ uptime, platform, release }: UptimeWidgetProps) => {
    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm h-full">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <label className="text-sm font-medium">Uptime Servidor</label>
                <Server className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{formatUptime(uptime)}</div>
            <p className="text-xs text-muted-foreground capitalize">{platform} ({release})</p>
        </div>
    );
};
