import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminScraperService } from '@/services/admin/scraper.service';
import type { ScraperStatus } from '@/services/admin/scraper.service';
import {
    Database,
    RefreshCcw,
    Play,
    StopCircle,
    Search,
    AlertCircle,
    Clock,
    LayoutGrid,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { ScraperQueue } from './components/ScraperQueue';
import { ScraperDetail } from './components/ScraperDetail';

export const ScraperDashboard = () => {
    const queryClient = useQueryClient();
    const [selectedScraper, setSelectedScraper] = useState<ScraperStatus | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Estado de los scrapers
    const { data: scrapers, isLoading, error } = useQuery({
        queryKey: ['admin-scrapers'],
        queryFn: AdminScraperService.getStatus,
        refetchInterval: 5000
    });

    // Estado de la cola de BullMQ
    const { data: queue, isLoading: queueLoading } = useQuery({
        queryKey: ['admin-scraper-queue'],
        queryFn: AdminScraperService.getQueueStatus,
        refetchInterval: 5000
    });

    const mutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: string }) => {
            switch (action) {
                case 'discover-categories':
                    return AdminScraperService.discoverCategories(id);
                case 'discover-subcategories':
                    return AdminScraperService.discoverSubcategories(id);
                case 'scrape-products':
                    return AdminScraperService.scrapeProducts(id);
                case 'update-products':
                    return AdminScraperService.updateProducts(id);
                default:
                    throw new Error('Acción no válida');
            }
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Operación iniciada con éxito');
            queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-scraper-queue'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Error al ejecutar la acción');
        }
    });

    const scrapeAllMutation = useMutation({
        mutationFn: () => AdminScraperService.scrapeAll(),
        onSuccess: () => {
            toast.success('Iniciado scraping general para todos los supermercados');
            queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-scraper-queue'] });
        },
        onError: (err: any) => toast.error(err.message || 'Error al iniciar scraping general')
    });

    const purgeQueueMutation = useMutation({
        mutationFn: () => AdminScraperService.purgeQueue(),
        onSuccess: () => {
            toast.success('Cola de trabajos limpiada correctamente');
            queryClient.invalidateQueries({ queryKey: ['admin-scraper-queue'] });
        },
        onError: (err: any) => toast.error(err.message || 'Error al limpiar la cola')
    });

    const stopScraperMutation = useMutation({
        mutationFn: (id: string) => AdminScraperService.stopScraper(id),
        onSuccess: (_, id) => {
            toast.success(`Trabajos detenidos para ${id}`);
            queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-scraper-queue'] });
        },
        onError: (err: any) => toast.error(err.message || 'Error al detener el scraper')
    });

    const cancelJobMutation = useMutation({
        mutationFn: (jobId: string) => AdminScraperService.cancelJob(jobId),
        onSuccess: () => {
            toast.success('Trabajo cancelado con éxito');
            queryClient.invalidateQueries({ queryKey: ['admin-scraper-queue'] });
        },
        onError: (err: any) => toast.error(err.message || 'Error al cancelar el trabajo')
    });

    const handleAction = (id: string, action: string) => {
        mutation.mutate({ id, action });
    };

    const handleOpenDetail = (scraper: ScraperStatus) => {
        setSelectedScraper(scraper);
        setIsDetailOpen(true);
    };

    if (isLoading) return <div className="flex h-96 items-center justify-center"><RefreshCcw className="h-8 w-8 animate-spin text-primary" /></div>;
    if (error) return <div className="p-4 text-destructive flex items-center gap-2"><AlertCircle /> Error cargando scrapers</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Centro de Control de Scraper</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Sistema de monitoreo y control de extracción de datos en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="gap-2 flex-1 md:flex-none h-10 border-primary/20 hover:bg-primary/5"
                        onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ['admin-scrapers'] });
                            queryClient.invalidateQueries({ queryKey: ['admin-scraper-queue'] });
                            toast.info('Sincronizando estados...');
                        }}
                    >
                        <RefreshCcw className="h-4 w-4" /> Refrescar
                    </Button>
                    <Button
                        className="gap-2 flex-1 md:flex-none h-10 shadow-lg shadow-primary/20"
                        onClick={() => scrapeAllMutation.mutate()}
                        disabled={scrapeAllMutation.isPending}
                    >
                        {scrapeAllMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Scrapear Todo
                    </Button>
                </div>
            </div>

            {/* Scraper Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scrapers?.map((scraper) => (
                    <Card key={scraper.id} className="overflow-hidden border-primary/5 group hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                        <Database className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-xl truncate">{scraper.name}</CardTitle>
                                        <CardDescription className="font-mono text-[10px] uppercase opacity-70 tracking-widest leading-none mt-1">
                                            Worker Instance: {scraper.id}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant={scraper.status === 'idle' ? 'secondary' : 'default'} className="capitalize px-2 py-0 h-6">
                                    {scraper.status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border rounded-xl bg-muted/10 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5 italic">
                                        <LayoutGrid className="h-3 w-3" /> Productos
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">{scraper.metrics.productsCount.toLocaleString()}</p>
                                </div>
                                <div className="p-3 border rounded-xl bg-muted/10 space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5 italic">
                                        <AlertCircle className="h-3 w-3 text-destructive" /> Errores
                                    </p>
                                    <p className="text-2xl font-bold tracking-tight">{scraper.metrics.errorCount}</p>
                                </div>
                                <div className="col-span-2 p-3 border rounded-xl bg-muted/10 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 italic">
                                            <Clock className="h-3 w-3" /> Última ejecución
                                        </p>
                                        <p className="text-xs font-medium">{new Date(scraper.lastRun).toLocaleString()}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                        onClick={() => handleOpenDetail(scraper)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Descubrimiento</p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 gap-2 border-primary/10 h-9 text-xs"
                                        onClick={() => handleAction(scraper.id, 'discover-categories')}
                                        disabled={mutation.isPending}
                                    >
                                        <Search className="h-3.5 w-3.5" /> Categorías
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 gap-2 border-primary/10 h-9 text-xs"
                                        onClick={() => handleAction(scraper.id, 'discover-subcategories')}
                                        disabled={mutation.isPending}
                                    >
                                        <Search className="h-3.5 w-3.5" /> Subcategorías
                                    </Button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="border-t bg-muted/50 p-4 flex flex-col gap-3">
                            <div className="flex gap-3 w-full">
                                <Button
                                    className="flex-1 gap-2 h-10 shadow-sm"
                                    onClick={() => handleAction(scraper.id, 'update-products')}
                                    disabled={mutation.isPending}
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" /> Actualizar Productos
                                </Button>
                            </div>
                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2 h-10 border-primary/20 hover:bg-primary/5"
                                    onClick={() => handleAction(scraper.id, 'scrape-products')}
                                    disabled={mutation.isPending}
                                >
                                    <Play className="h-3.5 w-3.5" /> Iniciar Full Scrape
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                                    onClick={() => {
                                        if (confirm(`¿Detener todos los trabajos de ${scraper.name}?`)) {
                                            stopScraperMutation.mutate(scraper.id);
                                        }
                                    }}
                                    disabled={stopScraperMutation.isPending}
                                >
                                    <StopCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Queue Management Section */}
            <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                            Gestor de Colas
                            {queueLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                        </h2>
                        <p className="text-muted-foreground text-sm">Visualización de trabajos pendientes y activos en BullMQ.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:bg-destructive/10 gap-2 border border-destructive/10"
                            onClick={() => {
                                if (confirm('¿Estás seguro de que deseas limpiar TODOS los trabajos pendientes?')) {
                                    purgeQueueMutation.mutate();
                                }
                            }}
                            disabled={purgeQueueMutation.isPending}
                        >
                            {purgeQueueMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <StopCircle className="h-3 w-3" />}
                            Purgar Cola
                        </Button>
                        <Badge variant="outline" className="h-7 px-3 border-dashed">
                            {queue?.length || 0} Trabajos en cola
                        </Badge>
                    </div>
                </div>

                <ScraperQueue
                    jobs={queue || []}
                    isLoading={queueLoading}
                    onCancelJob={(jobId) => cancelJobMutation.mutate(jobId)}
                />
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                {selectedScraper && <ScraperDetail scraper={selectedScraper} />}
            </Dialog>
        </div>
    );
};
