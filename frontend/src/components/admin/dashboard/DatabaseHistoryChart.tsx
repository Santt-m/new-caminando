import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Database, Server } from 'lucide-react';
import type { SystemMetric } from "@/services/admin/system.service";

// Helper to parse "1.24 MB" to number 1.24 for charting
const parseMemory = (memStr?: string) => {
    if (!memStr) return 0;
    const match = memStr.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
};

interface DatabaseHistoryChartProps {
    data: SystemMetric[];
}

// Custom tooltip for better UX
interface TooltipPayloadEntry {
    name: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{entry.value.toFixed(2)}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const DatabaseHistoryChart = ({ data }: DatabaseHistoryChartProps) => {
    // Transform backend data for Recharts
    const chartData = data.map(metric => ({
        time: new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        redisMemory: parseMemory(metric.redis?.usedMemory),
        redisClients: metric.redis?.connectedClients || 0,
        mongoObjects: metric.mongodb?.objects || 0,
        mongoSize: (metric.mongodb?.dataSize || 0) / (1024 * 1024) // Convert bytes to MB
    }));

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Redis Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Server className="h-4 w-4 text-destructive" />
                        Redis Performance (Memory & Clients)
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRedisMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="time"
                                className="text-xs"
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="left"
                                className="text-xs"
                                label={{ value: 'MB', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                className="text-xs"
                                label={{ value: 'Clients', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                                tick={{ fontSize: 10 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="redisMemory"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorRedisMem)"
                                name="Memory (MB)"
                                strokeWidth={2}
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="redisClients"
                                stroke="#f97316"
                                fill="none" // Line only for clients
                                name="Clients"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* MongoDB Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Database className="h-4 w-4 text-emerald-500" />
                        MongoDB Growth (Documents & Size)
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMongoSize" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="time"
                                className="text-xs"
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="left"
                                className="text-xs"
                                label={{ value: 'Size (MB)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                className="text-xs"
                                label={{ value: 'Docs', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                                tick={{ fontSize: 10 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="mongoSize"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorMongoSize)"
                                name="Data Size (MB)"
                                strokeWidth={2}
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="mongoObjects"
                                stroke="#06b6d4"
                                fill="none"
                                name="Documents"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
