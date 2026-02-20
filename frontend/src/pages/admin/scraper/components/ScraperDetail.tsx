import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminScraperService } from '@/services/admin/scraper.service';
import type { ScraperStatus, ScraperLog, ScraperSettings } from '@/services/admin/scraper.service';
import {
    Terminal,
    Image as ImageIcon,
    Settings2,
    RefreshCcw,
    AlertCircle,
    Info,
    Bug,
    Save,
    Loader2,
    Play,
    StopCircle,
    Pause,
    PlayCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ScraperDetailProps {
    scraper: ScraperStatus;
}

export const ScraperDetail = ({ scraper }: ScraperDetailProps) => {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<ScraperSettings>({
        enabled: scraper.settings?.enabled ?? true,
        maxConcurrency: scraper.settings?.maxConcurrency ?? 2,
        retryCount: scraper.settings?.retryCount ?? 3,
        retryDelay: scraper.settings?.delayBetweenRequests ?? scraper.settings?.retryDelay ?? 1000,
        delayBetweenRequests: scraper.settings?.delayBetweenRequests ?? 1000,
        productUpdateFrequency: scraper.settings?.productUpdateFrequency ?? 24
    });

    const [screenshotUrl, setScreenshotUrl] = useState<string>(
        AdminScraperService.getScreenshotUrl(scraper.id)
    );
    const [screenshotLoaded, setScreenshotLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (scraper.settings) {
            const delay = scraper.settings.delayBetweenRequests ?? scraper.settings.retryDelay ?? 1000;
            setSettings({
                enabled: scraper.settings.enabled ?? true,
                maxConcurrency: scraper.settings.maxConcurrency,
                retryCount: scraper.settings.retryCount,
                retryDelay: delay,
                delayBetweenRequests: delay,
                productUpdateFrequency: scraper.settings.productUpdateFrequency ?? 24
            });
        }
    }, [scraper.settings]);

    // Refresh screenshot URL periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setScreenshotLoaded(false);
            setScreenshotUrl(AdminScraperService.getScreenshotUrl(scraper.id));
        }, 10000);
        return () => clearInterval(interval);
    }, [scraper.id]);

    const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
        queryKey: ['scraper-logs', scraper.id],
        queryFn: () => AdminScraperService.getLogs(scraper.id),
        enabled: !!scraper.id,
        refetchInterval: 3000
    });

    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings: ScraperSettings) =>
            AdminScraperService.updateSettings(scraper.id, newSettings),
        onSuccess: () => {
            toast.success('Configuración actualizada correctamente');
            queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar la configuración');
        }
    });

    const handleSaveSettings = () => {
        // Ensure both retryDelay and delayBetweenRequests are in sync
        updateSettingsMutation.mutate({
            ...settings,
            delayBetweenRequests: settings.retryDelay,
        });
    };

    const clearScreenshotsMutation = useMutation({
        mutationFn: () => AdminScraperService.clearScreenshots(scraper.id),
        onSuccess: () => {
            setScreenshotLoaded(false);
            setScreenshotUrl(AdminScraperService.getScreenshotUrl(scraper.id));
            toast.success('Capturas eliminadas correctamente');
        },
        onError: () => toast.error('Error al eliminar capturas')
    });

    const getLogIcon = (level: ScraperLog['level']) => {
        switch (level) {
            case 'error': return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
            case 'warn': return <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />;
            case 'debug': return <Bug className="h-3.5 w-3.5 text-blue-400" />;
            default: return <Info className="h-3.5 w-3.5 text-primary/60" />;
        }
    };

    return (
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[1200px] h-[90vh] p-0 flex flex-col border-primary/20 bg-background/95 backdrop-blur-sm overflow-hidden">
            <DialogHeader className="p-6 border-b bg-muted/20 relative shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                            <Settings2 className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-3xl font-bold tracking-tight text-foreground truncate">{scraper.name}</DialogTitle>
                            <DialogDescription asChild>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-0.5 rounded border">
                                        ID: {scraper.id}
                                    </span>
                                    <Badge className={cn(
                                        "h-6 px-3 border-none shadow-sm capitalize font-bold",
                                        scraper.status === 'idle' ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground animate-pulse"
                                    )}>
                                        {scraper.status}
                                    </Badge>
                                </div>
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            className="gap-2 h-10 px-6 shadow-lg shadow-primary/20 font-bold"
                            onClick={() => AdminScraperService.scrapeProducts(scraper.id).then(() => {
                                toast.success('Scraping iniciado');
                                queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
                            })}
                            disabled={scraper.status === 'running'}
                        >
                            <Play className="h-4 w-4" />
                            {scraper.status === 'running' ? 'En ejecución...' : 'Iniciar Scraping'}
                        </Button>
                        <Button
                            variant="outline"
                            className={cn(
                                "h-10 w-10 p-0 border-primary/20 hover:bg-primary/5",
                                scraper.status === 'paused' && "text-primary border-primary/40 bg-primary/5"
                            )}
                            onClick={() => {
                                const action = scraper.status === 'paused' ? AdminScraperService.resumeScraper(scraper.id) : AdminScraperService.pauseScraper(scraper.id);
                                action.then(() => {
                                    toast.success(scraper.status === 'paused' ? 'Cola reanudada' : 'Cola pausada');
                                    queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
                                });
                            }}
                        >
                            {scraper.status === 'paused' ? <PlayCircle className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10 w-10 p-0 text-destructive border-destructive/20 hover:bg-destructive/5"
                            onClick={() => {
                                if (confirm('¿Detener todos los trabajos pendientes para este supermercado?')) {
                                    AdminScraperService.stopScraper(scraper.id).then(() => {
                                        toast.success('Scraper detenido');
                                        queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
                                    });
                                }
                            }}
                        >
                            <StopCircle className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </DialogHeader>

            <Tabs defaultValue="logs" className="flex-1 flex flex-col min-h-0">
                <div className="px-8 pt-4 border-b bg-background/50 shrink-0">
                    <TabsList className="w-full justify-start h-12 bg-transparent gap-8 p-0 overflow-x-auto no-scrollbar">
                        <TabsTrigger
                            value="logs"
                            className="text-base font-semibold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 shadow-none transition-all hover:text-primary/70"
                        >
                            <Terminal className="h-5 w-5 mr-2.5" /> Logs en Vivo
                        </TabsTrigger>
                        <TabsTrigger
                            value="screenshots"
                            className="text-base font-semibold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 shadow-none transition-all hover:text-primary/70"
                        >
                            <ImageIcon className="h-5 w-5 mr-2.5" /> Capturas
                        </TabsTrigger>
                        <TabsTrigger
                            value="config"
                            className="text-base font-semibold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 shadow-none transition-all hover:text-primary/70"
                        >
                            <Settings2 className="h-5 w-5 mr-2.5" /> Configuración
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 min-h-0 bg-muted/5 relative">
                    <TabsContent value="logs" className="h-full m-0 p-0 overflow-hidden">
                        <div className="h-full flex flex-col p-4 md:p-6 gap-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    Terminal Output Stream
                                </span>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-widest gap-2 border-primary/20 hover:bg-primary/5 bg-background shadow-sm" onClick={() => refetchLogs()}>
                                    <RefreshCcw className={cn("h-3 w-3", logsLoading && "animate-spin")} />
                                    Synchronize
                                </Button>
                            </div>
                            <div className="flex-1 border border-primary/10 rounded-xl bg-[#09090b] font-mono text-[11px] md:text-[12px] p-4 md:p-5 shadow-inner overflow-y-auto custom-scrollbar ring-1 ring-white/5 selection:bg-primary/30">
                                {logsLoading ? (
                                    <div className="flex h-full items-center justify-center text-zinc-500 italic animate-pulse">
                                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                                        Inyectando flujos de datos...
                                    </div>
                                ) : logs && logs.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {logs.map((log, idx) => (
                                            <div key={idx} className="group flex gap-3 text-zinc-300 leading-relaxed border-b border-white/[0.02] pb-1.5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors">
                                                <span className="text-zinc-600 shrink-0 font-light select-none tabular-nums opacity-60 text-[10px] mt-0.5">
                                                    [{new Date(log.timestamp).toLocaleTimeString()}]
                                                </span>
                                                <span className="shrink-0 flex items-center h-5">
                                                    {getLogIcon(log.level)}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "break-all",
                                                        log.level === 'error' && "text-red-400 font-bold",
                                                        log.level === 'warn' && "text-yellow-400 font-medium",
                                                        log.level === 'debug' && "text-blue-400 opacity-80",
                                                        log.level === 'info' && "text-emerald-400/90"
                                                    )}>
                                                        {log.message}
                                                    </span>
                                                    {log.details && Object.keys(log.details).length > 0 && (
                                                        <span className="text-[10px] text-zinc-500 font-light opacity-50 mt-0.5 group-hover:opacity-100 transition-opacity">
                                                            {JSON.stringify(log.details).substring(0, 100)}...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={logsEndRef} />
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-zinc-600 italic flex-col gap-4">
                                        <Bug className="h-8 w-8 opacity-20" />
                                        <p>No hay logs disponibles en el buffer actual.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="screenshots" className="h-full m-0 p-8">
                        <div className="h-full flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h4 className="text-lg font-bold tracking-tight">Visualización en Tiempo Real</h4>
                                    <p className="text-sm text-muted-foreground">Monitoriza visualmente lo que el motor de scraping está procesando.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="h-7 px-4 border-dashed bg-secondary/50 font-semibold">
                                        Refresh Rate: 10s
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] uppercase font-bold tracking-widest gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                                        onClick={() => clearScreenshotsMutation.mutate()}
                                        disabled={clearScreenshotsMutation.isPending}
                                    >
                                        <RefreshCcw className={cn('h-3 w-3', clearScreenshotsMutation.isPending && 'animate-spin')} />
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden border-2 border-primary/5 rounded-[2rem] bg-muted/20 relative group">
                                {screenshotLoaded && (
                                    <img
                                        src={screenshotUrl}
                                        alt="Scraper Screenshot"
                                        className="w-full h-full object-contain bg-black/40 transition-opacity duration-500"
                                    />
                                )}
                                {/* Preload: hidden img for loading state detection */}
                                <img
                                    key={screenshotUrl}
                                    src={screenshotUrl}
                                    alt=""
                                    className="hidden"
                                    onLoad={() => setScreenshotLoaded(true)}
                                    onError={() => setScreenshotLoaded(false)}
                                />
                                {!screenshotLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center gap-6">
                                        <div className="h-24 w-24 rounded-full bg-background border shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <ImageIcon className="h-10 w-10 text-primary/40" />
                                        </div>
                                        <div className="max-w-xs">
                                            <p className="text-lg font-bold">Sin señal de video</p>
                                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                                El navegador headless se activará automáticamente al iniciar una tarea.
                                            </p>
                                        </div>
                                        <Button variant="outline" className="mt-4 gap-2 rounded-full px-8"
                                            onClick={() => {
                                                setScreenshotLoaded(false);
                                                setScreenshotUrl(AdminScraperService.getScreenshotUrl(scraper.id));
                                            }}
                                        >
                                            <RefreshCcw className="h-4 w-4" /> Reintentar Conexión
                                        </Button>
                                    </div>
                                )}
                                <div className="absolute bottom-6 right-6 flex items-center gap-2">
                                    <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 px-4 py-1.5 h-auto font-mono text-[10px] tracking-widest">
                                        LIVE_FEED_01
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="config" className="h-full m-0 overflow-y-auto custom-scrollbar">
                        <div className="max-w-2xl mx-auto space-y-10 flex flex-col p-8">
                            <div className="space-y-8 flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Settings2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <h4 className="text-xl font-bold tracking-tight">Capacidad del Navegador</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Controla la carga de trabajo concurrente. Valores más altos aceleran el scraping pero requieren más memoria RAM y CPU.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors">
                                            <div className="space-y-1">
                                                <span className="text-base font-bold">Estado del Scraper</span>
                                                <p className="text-xs text-muted-foreground">Habilitar/Deshabilitar ejecución.</p>
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300",
                                                    settings.enabled ? "bg-primary" : "bg-muted-foreground/30"
                                                )}
                                                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                                            >
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300",
                                                    settings.enabled ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </div>
                                        </div>

                                        <div className="p-6 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors">
                                            <div className="space-y-1">
                                                <span className="text-base font-bold">Concurrencia</span>
                                                <p className="text-xs text-muted-foreground">Instancias simultáneas.</p>
                                            </div>
                                            <Input
                                                type="number"
                                                className="w-20 h-10 text-center font-bold"
                                                value={settings.maxConcurrency}
                                                onChange={(e) => setSettings({ ...settings, maxConcurrency: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <RefreshCcw className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <h4 className="text-xl font-bold tracking-tight">Estrategia de Ejecución</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Configura cómo debe reaccionar el sistema ante errores y con qué frecuencia actualizar el catálogo.</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex flex-col gap-3 hover:border-primary/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reintentos</span>
                                                <Badge variant="secondary" className="text-[9px] px-1.5 h-4">MAX</Badge>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-10 text-lg font-black border-2 focus-visible:ring-primary/20"
                                                value={settings.retryCount}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, retryCount: parseInt(e.target.value) || 0 })}
                                                min={0}
                                                max={10}
                                            />
                                        </div>
                                        <div className="p-4 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex flex-col gap-3 hover:border-primary/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Espera</span>
                                                <Badge variant="secondary" className="text-[9px] px-1.5 h-4">MS</Badge>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-10 text-lg font-black border-2 focus-visible:ring-primary/20"
                                                value={settings.retryDelay}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, retryDelay: parseInt(e.target.value) || 1000 })}
                                                step={1000}
                                                min={0}
                                            />
                                        </div>
                                        <div className="p-4 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex flex-col gap-3 hover:border-primary/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Frecuencia</span>
                                                <Badge variant="secondary" className="text-[9px] px-1.5 h-4">HRS</Badge>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-10 text-lg font-black border-2 focus-visible:ring-primary/20"
                                                value={settings.productUpdateFrequency}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, productUpdateFrequency: parseInt(e.target.value) || 24 })}
                                                min={1}
                                                max={720}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t mt-auto flex justify-end">
                                <Button
                                    className="px-12 h-14 gap-3 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                                    onClick={handleSaveSettings}
                                    disabled={updateSettingsMutation.isPending}
                                >
                                    {updateSettingsMutation.isPending ? (
                                        <RefreshCcw className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5" />
                                    )}
                                    Confirmar Ajustes Técnicos
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </DialogContent>
    );
};
