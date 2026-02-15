import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { campaignsService } from '@/services/admin/campaigns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const CampaignDetail = () => {
    const { id } = useParams<{ id: string }>();

    const { data: campaign, isLoading } = useQuery({
        queryKey: ['campaign', id],
        queryFn: () => campaignsService.getById(id!),
        enabled: !!id
    });

    if (isLoading) return <div className="p-8">Cargando detalles...</div>;
    if (!campaign) return <div className="p-8">Campaña no encontrada</div>;

    // Preparar datos para el gráfico
    // Asumimos que dailyMetrics viene ordenado o lo ordenamos
    const chartData = campaign.dailyMetrics?.map((metric: { date: string | Date; visits: number; conversions: number }) => ({
        date: new Date(metric.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Visitas: metric.visits,
        Conversiones: metric.conversions
    })) || [];

    const ratio = campaign.metrics.visits > 0
        ? ((campaign.metrics.conversions / campaign.metrics.visits) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/panel/campaigns">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        {campaign.code}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {campaign.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Creada el {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaign.metrics.visits}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Conversiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaign.metrics.conversions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ratio}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Rendimiento Histórico</CardTitle>
                    <CardDescription>
                        Visitas y conversiones a lo largo del tiempo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="Visitas"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorVisits)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Conversiones"
                                        stroke="#82ca9d"
                                        fillOpacity={1}
                                        fill="url(#colorConv)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No hay datos históricos suficientes para mostrar el gráfico.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
