import { useQuery } from '@tanstack/react-query';
import { AdminSecurityService } from '@/services/admin/security.service';
import { Globe, MapPin, AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BarChart } from '@/components/ui/Charts';
import { getEventTypeLabel } from '@/constants/security';

export const ThreatAnalysis = () => {
    const { data: threatAnalysis, isLoading } = useQuery({
        queryKey: ['admin-threat-analysis'],
        queryFn: AdminSecurityService.getThreatAnalysis,
        refetchInterval: 300000 // 5 minutes
    });

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>;
    }

    return (
        <div className="space-y-6">
            {/* Top IPs Bloqueadas */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="font-semibold text-lg">IPs Más Bloqueadas</h3>
                </div>
                <div className="space-y-3">
                    {threatAnalysis?.topBlockedIPs?.slice(0, 10).map((threat, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-linear-to-r from-red-50 to-transparent border border-red-100 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold">
                                #{i + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-mono font-semibold text-lg">{threat.ip}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    {threat.country && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {threat.country}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Último: {new Date(threat.lastSeen).toLocaleString('es')}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-red-600">{threat.count}</p>
                                <p className="text-xs text-muted-foreground">intentos bloqueados</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Análisis por País */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Amenazas por País</h3>
                    </div>
                    {threatAnalysis?.threatsByCountry && threatAnalysis.threatsByCountry.length > 0 ? (
                        <BarChart
                            data={threatAnalysis.threatsByCountry.map(t => ({
                                label: t.country,
                                value: t.count,
                                color: 'rgb(239, 68, 68)'
                            }))}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            No hay datos de amenazas por país
                        </div>
                    )}
                </Card>

                {/* Distribución de Tipos de Eventos */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingDown className="h-5 w-5 text-amber-600" />
                        <h3 className="font-semibold text-lg">Eventos Más Frecuentes</h3>
                    </div>
                    {threatAnalysis?.eventTypeDistribution && threatAnalysis.eventTypeDistribution.length > 0 ? (
                        <BarChart
                            data={threatAnalysis.eventTypeDistribution.map(e => ({
                                label: getEventTypeLabel(e.type),
                                value: e.count,
                                color: 'rgb(59, 130, 246)'
                            }))}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            No hay datos de eventos
                        </div>
                    )}
                </Card>
            </div>

            {/* Actividad por Hora del Día */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-lg">Actividad por Hora del Día</h3>
                    <p className="text-sm text-muted-foreground ml-auto">Últimas 24 horas</p>
                </div>
                {threatAnalysis?.hourlyActivity && threatAnalysis.hourlyActivity.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span>Normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span>Sospechoso</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Bloqueado</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-24 gap-1">
                            {threatAnalysis.hourlyActivity.map((hour, i) => {
                                const total = hour.normal + hour.suspicious + hour.blocked;
                                const maxHeight = 100;
                                const normalHeight = total > 0 ? (hour.normal / total) * maxHeight : 0;
                                const suspiciousHeight = total > 0 ? (hour.suspicious / total) * maxHeight : 0;
                                const blockedHeight = total > 0 ? (hour.blocked / total) * maxHeight : 0;

                                return (
                                    <div key={i} className="flex flex-col items-center gap-1 group relative">
                                        <div className="w-full h-32 flex flex-col-reverse bg-muted/30 rounded-t">
                                            {blockedHeight > 0 && (
                                                <div className="w-full bg-red-500 rounded-t" style={{ height: `${blockedHeight}px` }} />
                                            )}
                                            {suspiciousHeight > 0 && (
                                                <div className="w-full bg-amber-500" style={{ height: `${suspiciousHeight}px` }} />
                                            )}
                                            {normalHeight > 0 && (
                                                <div className="w-full bg-emerald-500" style={{ height: `${normalHeight}px` }} />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{hour.hour}h</span>

                                        {/* Tooltip al hover */}
                                        <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-900 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap z-10">
                                            <p className="font-bold">{hour.hour}:00</p>
                                            <p>Total: {total}</p>
                                            <p className="text-emerald-300">Normal: {hour.normal}</p>
                                            <p className="text-amber-300">Sospechoso: {hour.suspicious}</p>
                                            <p className="text-red-300">Bloqueado: {hour.blocked}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        No hay datos de actividad por hora
                    </div>
                )}
            </Card>
        </div>
    );
};
