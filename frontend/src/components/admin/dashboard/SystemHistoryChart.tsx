import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SystemMetric } from "@/services/admin/system.service";
import { Loader2 } from 'lucide-react';

// Shared formatting hook
function useFormattedData(data: SystemMetric[] | undefined) {
    return useMemo(() => {
        if (!data) return [];
        return data.map(metric => ({
            ...metric,
            formattedTime: new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            memoryGB: parseFloat((metric.memoryUsage / (1024 * 1024 * 1024)).toFixed(2))
        }));
    }, [data]);
}

interface ChartProps {
    data: SystemMetric[] | undefined;
    isLoading: boolean;
}

export function CpuHistoryChart({ data, isLoading }: ChartProps) {
    const formattedData = useFormattedData(data);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex justify-center items-center h-[300px] text-muted-foreground border rounded-md">
                No hay datos históricos disponibles aún.
            </div>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Historial de CPU (Load Avg)</CardTitle>
                <CardDescription>Carga promedio del sistema (últimas 24h)</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData}>
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="formattedTime"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value, index) => index % 10 === 0 ? value : ''}
                        />
                        <YAxis
                            allowDecimals={true}
                            domain={[0, 'auto']}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="cpuLoad"
                            stroke="#f43f5e"
                            fillOpacity={1}
                            fill="url(#colorCpu)"
                            name="Carga CPU"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function MemoryHistoryChart({ data, isLoading }: ChartProps) {
    const formattedData = useFormattedData(data);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex justify-center items-center h-[300px] text-muted-foreground border rounded-md">
                No hay datos históricos disponibles aún.
            </div>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Historial de Memoria (RAM)</CardTitle>
                <CardDescription>Uso de memoria del sistema en GB</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData}>
                        <defs>
                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="formattedTime"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value, index) => index % 10 === 0 ? value : ''}
                        />
                        <YAxis
                            allowDecimals={true}
                            domain={[0, 'auto']}
                            tick={{ fontSize: 12 }}
                            unit=" GB"
                        />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="memoryGB"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorMem)"
                            name="RAM Usada"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
// Keep original for back-compat if needed, or remove. Let's remove to enforce separation.
