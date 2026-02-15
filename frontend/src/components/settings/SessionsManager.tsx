import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/useToast';
import { sessionsService, type Session } from '../../services/sessions/sessionsService';
import { Monitor, Smartphone, Tablet, MapPin, Clock, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { traducciones } from './traduccion';

export const SessionsManager: React.FC = () => {
    const { showToast } = useToast();
    const { t, language } = useLanguage();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [terminatingId, setTerminatingId] = useState<string | null>(null);
    const [isTerminatingAll, setIsTerminatingAll] = useState(false);

    const loadSessions = async () => {
        setIsLoading(true);
        try {
            const data = await sessionsService.getSessions();
            setSessions(data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || t(traducciones, 'loadError') });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTerminateSession = async (sessionId: string) => {
        setTerminatingId(sessionId);
        try {
            await sessionsService.terminateSession(sessionId);
            showToast({ type: 'success', message: t(traducciones, 'terminateSuccess') });
            await loadSessions();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || t(traducciones, 'terminateError') });
        } finally {
            setTerminatingId(null);
        }
    };

    const handleTerminateAllOthers = async () => {
        setIsTerminatingAll(true);
        try {
            await sessionsService.terminateAllOtherSessions();
            showToast({ type: 'success', message: t(traducciones, 'terminateAllSuccess') });
            await loadSessions();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || t(traducciones, 'terminateAllError') });
        } finally {
            setIsTerminatingAll(false);
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        const type = deviceType.toLowerCase();
        if (type.includes('mobile') || type.includes('smartphone')) {
            return <Smartphone className="h-5 w-5" />;
        }
        if (type.includes('tablet')) {
            return <Tablet className="h-5 w-5" />;
        }
        return <Monitor className="h-5 w-5" />;
    };

    const getLocationString = (session: Session): string => {
        const parts = [];
        if (session.ipInfo.city) parts.push(session.ipInfo.city);
        if (session.ipInfo.country) parts.push(session.ipInfo.country);
        return parts.length > 0 ? parts.join(', ') : session.ipInfo.ip;
    };

    const getTimeAgo = (date: string | Date): string => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return t(traducciones, 'now');
        if (diffMins < 60) return t(traducciones, 'minutesAgo').replace('{{value}}', String(diffMins));

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return t(traducciones, 'hoursAgo').replace('{{value}}', String(diffHours));

        const diffDays = Math.floor(diffHours / 24);
        return t(traducciones, 'daysAgo').replace('{{value}}', String(diffDays));
    };

    const getLocale = () => {
        if (language === 'en') return 'en-US';
        if (language === 'pt') return 'pt-BR';
        return 'es-AR';
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">{t(traducciones, 'loading')}</span>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{t(traducciones, 'title')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t(traducciones, 'subtitle')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadSessions}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {t(traducciones, 'refresh')}
                    </Button>
                    {sessions.filter(s => !s.isCurrent).length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleTerminateAllOthers}
                            disabled={isTerminatingAll}
                        >
                            {isTerminatingAll ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t(traducciones, 'closing')}
                                </>
                            ) : (
                                <>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {t(traducciones, 'closeOthers')}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {sessions.map((session) => (
                    <Card
                        key={session.id}
                        className={`p-4 ${session.isCurrent ? 'border-primary/50 bg-primary/5' : ''}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`p-3 rounded-lg ${session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {getDeviceIcon(session.deviceInfo.device)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-foreground">
                                            {session.deviceInfo.browser}
                                        </h4>
                                        {session.isCurrent && (
                                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                                                {t(traducciones, 'currentSession')}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">
                                            {session.deviceInfo.os} · {session.deviceInfo.device}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="truncate">{getLocationString(session)}</span>
                                        </div>
                                        {session.ipInfo.isp && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Monitor className="h-3.5 w-3.5" />
                                                <span className="truncate">{session.ipInfo.isp}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>
                                                {t(traducciones, 'lastActivity')}: {getTimeAgo(session.lastUsedAt)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {t(traducciones, 'startedAt')}: {new Date(session.createdAt).toLocaleString(getLocale())}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!session.isCurrent && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleTerminateSession(session.id)}
                                    disabled={terminatingId === session.id}
                                    className="text-destructive hover:bg-destructive/10"
                                >
                                    {terminatingId === session.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <LogOut className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}

                {sessions.length === 0 && (
                    <Card className="p-8 text-center">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">{t(traducciones, 'noSessions')}</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
