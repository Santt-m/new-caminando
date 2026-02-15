import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TrafficHistoryItem } from "@/services/admin/analytics.service";
import { Loader2 } from 'lucide-react';

interface TrafficHistoryChartProps {
    data: TrafficHistoryItem[] | undefined;
    isLoading: boolean;
    range: '24h' | '7d';
    onRangeChange: (range: '24h' | '7d') => void;
}

export function TrafficHistoryChart({ data, isLoading, range, onRangeChange }: TrafficHistoryChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Evolución de Tráfico</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Evolución de Tráfico</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] flex justify-center items-center text-muted-foreground">
                    No hay datos de tráfico disponibles.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Evolución de Tráfico</CardTitle>
                        <CardDescription>
                            Peticiones vs Bloqueos y Visitantes Únicos
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                        <button
                            onClick={() => onRangeChange('24h')}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${range === '24h' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            24h
                        </button>
                        <button
                            onClick={() => onRangeChange('7d')}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${range === '7d' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            7 Días
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="displayTime"
                                tick={{ fontSize: 12 }}
                                tickMargin={10}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                                labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                                type="monotone"
                                dataKey="requests"
                                name="Peticiones Totales"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#colorRequests)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="blocked"
                                name="Amenazas Bloqueadas"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorBlocked)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="visitors"
                                name="Visitantes Únicos"
                                stroke="#10b981"
                                fill="none"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
