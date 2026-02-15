import { useState, useEffect } from 'react';
import type { SecurityLog } from '@/services/admin/analytics.service';
import { ShieldAlert, User, Bot, Globe, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    logs: SecurityLog[];
    title: string;
}

const getIcon = (state: string) => {
    switch (state) {
        case 'NORMAL': return User;
        case 'BOT': case 'SCRAPER': return Bot;
        case 'MALICIOUS': case 'IP_BLOCKED': return ShieldAlert;
        case 'SUSPICIOUS': return AlertTriangle;
        default: return Globe;
    }
};

const getColor = (state: string) => {
    switch (state) {
        case 'NORMAL': return 'bg-emerald-100 text-emerald-700'; // Success subtle
        case 'BOT': case 'SCRAPER': return 'bg-indigo-100 text-indigo-700'; // Info subtle
        case 'SUSPICIOUS': return 'bg-amber-100 text-amber-700'; // Warning subtle
        case 'MALICIOUS': case 'IP_BLOCKED': return 'bg-rose-100 text-rose-700'; // Destructive subtle
        default: return 'bg-gray-100 text-gray-700';
    }
};

const relativeFormatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

const formatTime = (isoString: string, now: number) => {
    const date = new Date(isoString);
    return relativeFormatter.format(
        -Math.round((now - date.getTime()) / (1000 * 60)), // Minutos
        'minutes'
    );
};

const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
        'LOGIN_SUCCESS': 'Inicio de Sesión Exitoso',
        'LOGIN_FAILED': 'Intento de Login Fallido',
        'LOGOUT': 'Cierre de Sesión',
        'REGISTER_SUCCESS': 'Cuenta Creada',
        'PAGE_VIEW': 'Visitó una página',
        'SEARCH': 'Realizó una búsqueda',
        'FILTER_CHANGE': 'Aplicó filtros',
        'API_ERROR': 'Error de Sistema',
        'SUSPICIOUS_ACTION': 'Acción Sospechosa Detectada'
    };
    return labels[eventType] || eventType.replace(/_/g, ' ');
};
export const RecentActivityList = ({ logs, title }: Props) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        // Update relative times every minute
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
                <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground">Registro cronológico de acciones.</p>
            </div>
            <div className="p-0 flex-1 overflow-auto bg-muted/5">
                <div className="divide-y divide-border">
                    {logs.map((log) => {
                        const Icon = getIcon(log.visitorState);
                        const colorClass = getColor(log.visitorState);

                        return (
                            <div key={log._id} className="flex gap-4 p-4 hover:bg-background transition-colors bg-card/50">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass} mt-1`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-foreground">
                                            {getEventLabel(log.eventType)}
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {formatTime(log.createdAt, now)}
                                        </span>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        {/* Metadata rendering if available */}
                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <div className="mt-1.5 bg-muted/50 p-2 rounded border border-border/50 font-mono text-[10px] break-all">
                                                {JSON.stringify(log.metadata).slice(0, 150)}
                                                {JSON.stringify(log.metadata).length > 150 && '...'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                                        <Globe className="h-3 w-3 opacity-50" />
                                        <span className="font-medium">{log.ip}</span>
                                        {log.riskScore > 0 && (
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded-full font-bold",
                                                log.riskScore > 70 ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700"
                                            )}>
                                                Riesgo: {log.riskScore}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {logs.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center gap-2 text-muted-foreground">
                            <div className="p-3 bg-muted rounded-full mb-2">
                                <Activity className="h-6 w-6 opacity-20" />
                            </div>
                            <p>No hay actividad reciente registrada</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
