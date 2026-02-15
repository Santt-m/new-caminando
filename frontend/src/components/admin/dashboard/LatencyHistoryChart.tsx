
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LatencyHistoryProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    isLoading: boolean;
}

export const LatencyHistoryChart = ({ data, isLoading }: LatencyHistoryProps) => {
    if (isLoading) {
        return (
            <Card className="col-span-4 shadow-sm">
                <CardHeader>
                    <CardTitle>Historial de Latencia</CardTitle>
                    <CardDescription>Event Loop Lag en milisegundos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-pulse w-full h-full bg-muted/10 rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    // Process data to ensure valid numbers
    const chartData = data?.filter(item => item.eventLoop).map(item => ({
        timestamp: new Date(item.timestamp),
        lag: item.eventLoop?.lag || 0
    })) || [];

    if (chartData.length === 0) {
        return (
            <Card className="col-span-4 shadow-sm">
                <CardHeader>
                    <CardTitle>Historial de Latencia (Event Loop)</CardTitle>
                    <CardDescription>Event Loop Lag en milisegundos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No hay datos de latencia disponibles aún. Recolectando...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Historial de Latencia (Event Loop)
                </CardTitle>
                <CardDescription>
                    Mide el retraso en el bucle de eventos de Node.js.
                    <span className="inline-block ml-2 px-2 py-0.5 rounded text-xs bg-success/10 text-success border border-success/20">
                        Objetivo: &lt; 20ms
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorLag" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(date) => format(date, 'HH:mm', { locale: es })}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}ms`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                labelFormatter={(date) => format(date, 'd MMM HH:mm', { locale: es })}
                            />
                            <Area
                                type="monotone"
                                dataKey="lag"
                                stroke="#f59e0b" // Amber/Warning color usually good for latency
                                fillOpacity={1}
                                fill="url(#colorLag)"
                                strokeWidth={2}
                                name="Lag"
                                unit="ms"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
