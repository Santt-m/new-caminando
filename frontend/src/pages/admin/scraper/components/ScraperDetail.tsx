import { useState, useEffect } from 'react';
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
    Play
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
        maxConcurrency: scraper.settings?.maxConcurrency || 2,
        retryCount: scraper.settings?.retryCount || 3,
        retryDelay: scraper.settings?.retryDelay || 5000
    });

    useEffect(() => {
        if (scraper.settings) {
            setSettings({
                maxConcurrency: scraper.settings.maxConcurrency,
                retryCount: scraper.settings.retryCount,
                retryDelay: scraper.settings.retryDelay
            });
        }
    }, [scraper.settings]);

    const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
        queryKey: ['scraper-logs', scraper.id],
        queryFn: () => AdminScraperService.getLogs(scraper.id),
        enabled: !!scraper.id,
        refetchInterval: 3000
    });

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
        updateSettingsMutation.mutate(settings);
    };

    const getLogIcon = (level: ScraperLog['level']) => {
        switch (level) {
            case 'error': return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
            case 'warn': return <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />;
            case 'debug': return <Bug className="h-3.5 w-3.5 text-blue-400" />;
            default: return <Info className="h-3.5 w-3.5 text-primary/60" />;
        }
    };

    return (
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[1200px] h-[90vh] p-0 flex flex-col overflow-hidden border-primary/20 bg-background/95 backdrop-blur-sm">
            <DialogHeader className="p-6 border-b bg-muted/20 relative">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                        <Settings2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">{scraper.name}</DialogTitle>
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
            </DialogHeader>

            <Tabs defaultValue="logs" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-8 pt-4 border-b bg-background/50">
                    <TabsList className="w-full justify-start h-12 bg-transparent gap-8 p-0">
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
                    <TabsContent value="logs" className="h-full m-0 p-0">
                        <div className="h-full flex flex-col p-6 gap-3">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Terminal Output
                                </span>
                                <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/10 hover:bg-primary/5" onClick={() => refetchLogs()}>
                                    <RefreshCcw className={cn("h-3.5 w-3.5", logsLoading && "animate-spin")} />
                                    Sincronizar
                                </Button>
                            </div>
                            <div className="flex-1 border-2 border-primary/5 rounded-2xl bg-[#09090b] font-mono text-[12px] p-6 shadow-2xl overflow-auto custom-scrollbar ring-1 ring-white/5">
                                {logsLoading ? (
                                    <div className="flex h-full items-center justify-center text-zinc-500 italic animate-pulse">
                                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                                        Inyectando flujos de datos...
                                    </div>
                                ) : logs && logs.length > 0 ? (
                                    <div className="space-y-2">
                                        {logs.map((log, idx) => (
                                            <div key={idx} className="group flex gap-4 text-zinc-300 leading-relaxed border-b border-white/[0.03] pb-2 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors">
                                                <span className="text-zinc-500 shrink-0 font-light select-none tabular-nums opacity-60">
                                                    [{new Date(log.timestamp).toLocaleTimeString()}]
                                                </span>
                                                <span className="shrink-0 flex items-center">
                                                    {getLogIcon(log.level)}
                                                </span>
                                                <span className={cn(
                                                    "break-all selection:bg-primary/30",
                                                    log.level === 'error' && "text-red-400 font-medium",
                                                    log.level === 'warn' && "text-yellow-400",
                                                    log.level === 'debug' && "text-blue-400 opacity-80"
                                                )}>
                                                    {log.message}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-zinc-600 italic">
                                        No hay logs disponibles en el buffer actual.
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
                                <Badge variant="secondary" className="h-7 px-4 border-dashed bg-secondary/50 font-semibold">
                                    Refresh Rate: 10s
                                </Badge>
                            </div>
                            <div className="flex-1 border-2 border-dashed border-primary/10 rounded-[2rem] bg-muted/20 flex flex-col items-center justify-center p-12 text-center gap-6 group transition-colors hover:bg-muted/30">
                                <div className="h-24 w-24 rounded-full bg-background border shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <ImageIcon className="h-10 w-10 text-primary/40" />
                                </div>
                                <div className="max-w-xs">
                                    <p className="text-lg font-bold">Sin señal de video</p>
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                        El navegador headless se activará automáticamente al iniciar una tarea de descubrimiento o scraping.
                                    </p>
                                </div>
                                <Button className="mt-4 gap-2 rounded-full px-8 h-12 shadow-lg shadow-primary/20">
                                    <Play className="h-4 w-4" /> Iniciar Motor
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="config" className="h-full m-0 p-8">
                        <div className="max-w-2xl mx-auto space-y-10 flex flex-col h-full">
                            <div className="space-y-8 flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Settings2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <h4 className="text-xl font-bold tracking-tight">Capacidad del Navegador</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Controla la carga de trabajo concurrente. Valores más altos aceleran el scraping pero requieren más memoria RAM y CPU.</p>
                                    <div className="p-6 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors">
                                        <div className="space-y-1">
                                            <span className="text-base font-bold">Instancias Simultáneas</span>
                                            <p className="text-xs text-muted-foreground">Recomendado: 2-4 para servidores estándar.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="number"
                                                className="w-24 h-12 text-center text-lg font-bold border-2 focus-visible:ring-primary/20"
                                                value={settings.maxConcurrency}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, maxConcurrency: parseInt(e.target.value) || 1 })}
                                                min={1}
                                                max={10}
                                            />
                                            <Badge variant="outline" className="h-10 px-4 rounded-lg bg-muted/30">Cromos</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <RefreshCcw className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <h4 className="text-xl font-bold tracking-tight">Estrategia de Reintentos</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Configura cómo debe reaccionar el sistema ante bloqueos de red o errores del servidor remoto.</p>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex flex-col gap-4 hover:border-primary/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Límite Crítico</span>
                                                <Badge variant="secondary" className="text-[10px]">INTENTOS</Badge>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-12 text-xl font-black border-2 focus-visible:ring-primary/20"
                                                value={settings.retryCount}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, retryCount: parseInt(e.target.value) || 0 })}
                                                min={0}
                                                max={5}
                                            />
                                        </div>
                                        <div className="p-6 border-2 border-primary/5 rounded-2xl bg-background/50 shadow-sm flex flex-col gap-4 hover:border-primary/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Cooldown</span>
                                                <Badge variant="secondary" className="text-[10px]">MS</Badge>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-12 text-xl font-black border-2 focus-visible:ring-primary/20"
                                                value={settings.retryDelay}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, retryDelay: parseInt(e.target.value) || 1000 })}
                                                step={1000}
                                                min={1000}
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
