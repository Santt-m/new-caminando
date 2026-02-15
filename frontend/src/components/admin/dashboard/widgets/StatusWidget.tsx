
import { Activity } from 'lucide-react';

export const StatusWidget = () => (
    <div className="rounded-lg border bg-card p-4 shadow-sm h-full">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <label className="text-sm font-medium">Estado del Sistema</label>
            <Activity className="h-4 w-4 text-success" />
        </div>
        <div className="text-2xl font-bold text-success">OPERATIVO</div>
        <p className="text-xs text-muted-foreground">Backend v1.0.0</p>
    </div>
);
