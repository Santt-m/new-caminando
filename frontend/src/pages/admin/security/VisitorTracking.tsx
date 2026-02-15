import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSecurityService, type SecurityLog } from '@/services/admin/security.service';
import { Search, Monitor, MapPin, Clock, Activity, ChevronRight, User, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getEventTypeLabel, getStateColor } from '@/constants/security';
import { cn } from '@/lib/utils';

export const VisitorTracking = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

    const { data: visitorActivity, isLoading: isLoadingActivity, isError } = useQuery({
        queryKey: ['admin-visitor-activity', selectedVisitorId],
        queryFn: () => selectedVisitorId ? AdminSecurityService.getVisitorActivity(selectedVisitorId) : null,
        enabled: !!selectedVisitorId,
    });

    const { data: logsData } = useQuery({
        queryKey: ['admin-security-logs-visitors', searchTerm],
        queryFn: () => AdminSecurityService.getLogs({ limit: 100 }),
    });

    // Extraer visitantes únicos de los logs
    const visitors: string[] = logsData?.data?.filter((log: SecurityLog) => log.visitorId)
        .reduce((acc: string[], log: SecurityLog) => {
            if (log.visitorId && !acc.includes(log.visitorId)) {
                acc.push(log.visitorId);
            }
            return acc;
        }, []) || [];

    const filteredVisitors = searchTerm
        ? visitors.filter(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
        : visitors;

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por Visitor ID (Token largo)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card className="overflow-hidden">
                        <div className="border-b p-4 bg-muted/30">
                            <h3 className="font-semibold">Visitantes Recientes</h3>
                            <p className="text-sm text-muted-foreground">{filteredVisitors.length} identificados</p>
                        </div>
                        <div className="divide-y max-h-150 overflow-y-auto">
                            {filteredVisitors.map((vId) => (
                                <button
                                    key={vId}
                                    onClick={() => setSelectedVisitorId(vId)}
                                    className={cn(
                                        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                                        selectedVisitorId === vId && "bg-primary/5 border-l-4 border-primary"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                <Monitor className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-mono text-[10px] break-all">{vId}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    {isLoadingActivity ? (
                        <Card className="p-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground font-medium">Reconstruyendo viaje del visitante...</p>
                        </Card>
                    ) : isError ? (
                        <Card className="p-12 text-center border-destructive/50 bg-destructive/5">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                            <h3 className="font-semibold text-lg text-destructive mb-2">Error de Sincronización</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                No pudimos recuperar la actividad de este visitante. Intenta de nuevo en unos momentos.
                            </p>
                            <button
                                onClick={() => setSelectedVisitorId(selectedVisitorId)}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                            >
                                Reintentar
                            </button>
                        </Card>
                    ) : visitorActivity ? (
                        <div className="space-y-6">
                            <Card className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                                            <Monitor className="h-5 w-5" /> Viaje del Visitante
                                        </h3>
                                        <p className="font-mono text-xs text-muted-foreground">{visitorActivity.visitorId}</p>
                                    </div>
                                    {visitorActivity.user && (
                                        <div className="text-right bg-primary/10 p-2 rounded-lg border border-primary/20">
                                            <p className="text-[10px] uppercase font-bold text-primary mb-1">Usuario Vinculado</p>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">{visitorActivity.user.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div className="space-y-4">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {visitorActivity.sessions.map((session: any, i: number) => (
                                    <Card key={i} className="overflow-hidden">
                                        <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-primary" />
                                                <span className="font-semibold text-sm">Sesión: {session.sessionId.slice(-8)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(session.firstSeen).toLocaleString('es')}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {session.ip}
                                                </span>
                                                {session.ipInfo?.country && <span>{session.ipInfo.country}</span>}
                                                <span className="ml-auto">{session.events.length} eventos en esta visita</span>
                                            </div>
                                            <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {session.events.map((event: any, j: number) => (
                                                    <div key={j} className="flex gap-4 items-start relative bg-background pl-2">
                                                        <div className={cn(
                                                            "w-4 h-4 rounded-full border-2 border-background z-10 mt-1",
                                                            getStateColor(event.visitorState).bg
                                                        )} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-medium">{getEventTypeLabel(event.eventType)}</p>
                                                                    {event.userId && (
                                                                        <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded">
                                                                            <User className="h-2 w-2" /> {event.userId.name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {new Date(event.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground font-mono truncate">{event.method} {event.path}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <Monitor className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <h3 className="font-semibold text-lg mb-2">Selecciona un Visitante</h3>
                            <p className="text-sm text-muted-foreground">
                                Elige un ID de la lista para reconstruir su historial de navegación y sesiones.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
