import { useQuery } from '@tanstack/react-query';
import { AdminSecurityService } from '@/services/admin/security.service';
import { Shield, ShieldAlert, Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SimpleLineChart, DonutChart } from '@/components/ui/Charts';
import { getVisitorStateLabel, getStateColor } from '@/constants/security';
import { cn } from '@/lib/utils';

export const SecurityOverview = () => {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['admin-security-metrics'],
        queryFn: AdminSecurityService.getMetrics,
        refetchInterval: 120000 // 2 minutes
    });

    const { data: threatAnalysis } = useQuery({
        queryKey: ['admin-threat-analysis'],
        queryFn: AdminSecurityService.getThreatAnalysis,
        refetchInterval: 300000 // 5 minutes
    });

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>;
    }

    // Preparar datos para gráficos
    const trendData = metrics?.requestsTrend?.map(t => ({
        label: `${t.hour}h`,
        value: t.count
    })) || [];

    const stateDistribution = Object.entries(metrics?.visitorStateDistribution || {}).map(([state, count]) => ({
        label: getVisitorStateLabel(state),
        value: count as number,
        color: getStateColor(state).badge
    }));

    return (
        <div className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="p-6 cursor-help">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Activity className="h-4 w-4" /> Solicitudes Hoy
                                        </p>
                                        <p className="text-3xl font-bold">{metrics?.requestsToday.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Activity className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Total de solicitudes HTTP recibidas hoy</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="p-6 cursor-help">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <ShieldAlert className="h-4 w-4" /> Bloqueos Hoy
                                        </p>
                                        <p className="text-3xl font-bold text-destructive">{metrics?.blockedToday.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <ShieldAlert className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Amenazas bloqueadas por Sentinel hoy</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="p-6 cursor-help">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Shield className="h-4 w-4" /> Tasa de Bloqueo
                                        </p>
                                        <p className="text-3xl font-bold">{metrics?.blockRate.toFixed(2)}%</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Porcentaje de tráfico bloqueado vs total</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Card className={cn(
                    "p-6 border-emerald-200",
                    metrics ? "bg-linear-to-br from-emerald-50 to-emerald-100" : "bg-linear-to-br from-amber-50 to-amber-100 border-amber-200"
                )}>
                    <div className="space-y-2">
                        <p className={cn(
                            "text-sm font-medium",
                            metrics ? "text-emerald-700" : "text-amber-700"
                        )}>Estado de Sentinel</p>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className={cn(
                                    "absolute inline-flex h-full w-full rounded-full opacity-75",
                                    metrics ? "animate-ping bg-emerald-400" : "bg-amber-400"
                                )}></span>
                                <span className={cn(
                                    "relative inline-flex rounded-full h-3 w-3",
                                    metrics ? "bg-emerald-500" : "bg-amber-500"
                                )}></span>
                            </span>
                            <span className={cn(
                                "text-lg font-bold",
                                metrics ? "text-emerald-700" : "text-amber-700"
                            )}>
                                {metrics ? "ACTIVO" : isLoading ? "SINC" : "OFFLINE"}
                            </span>
                        </div>
                        <p className={cn(
                            "text-xs",
                            metrics ? "text-emerald-600" : "text-amber-600"
                        )}>
                            {metrics ? "Sentinel protegiendo 24/7" : "Verificando conexión..."}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Gráficos */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Tendencia de Solicitudes */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Tendencia de Solicitudes</h3>
                                <p className="text-sm text-muted-foreground">Últimas 24 horas</p>
                            </div>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <SimpleLineChart data={trendData} height={180} />
                    </div>
                </Card>

                {/* Distribución de Estados */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Distribución de Estados</h3>
                                <p className="text-sm text-muted-foreground">Por tipo de visitante</p>
                            </div>
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {stateDistribution.length > 0 ? (
                            <DonutChart data={stateDistribution} size={180} />
                        ) : (
                            <div className="text-center text-muted-foreground py-8">Sin datos disponibles</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Top Amenazas */}
            {threatAnalysis?.topBlockedIPs && threatAnalysis.topBlockedIPs.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-destructive" />
                        Top 5 IPs Bloqueadas
                    </h3>
                    <div className="space-y-3">
                        {threatAnalysis.topBlockedIPs.slice(0, 5).map((threat, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-mono font-medium">{threat.ip}</p>
                                    {threat.country && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {threat.country} • Último: {new Date(threat.lastSeen).toLocaleString('es')}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-destructive">{threat.count}</p>
                                    <p className="text-xs text-muted-foreground">intentos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};
