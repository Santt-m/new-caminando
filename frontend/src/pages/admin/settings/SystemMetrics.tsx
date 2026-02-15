
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdminSystemService } from '@/services/admin/system.service';
import { useToast } from '@/contexts/ToastContext';
import { Loader2, Trash2, Eye, LayoutDashboard } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { CpuHistoryChart, MemoryHistoryChart } from '@/components/admin/dashboard/SystemHistoryChart';
import { DatabaseHistoryChart } from '@/components/admin/dashboard/DatabaseHistoryChart';
import { LatencyHistoryChart } from '@/components/admin/dashboard/LatencyHistoryChart';
import { DatabaseHealth } from '@/components/admin/dashboard/DatabaseHealth';
import { DraggableWidget } from '@/components/admin/dashboard/DraggableWidget';
import { StatusWidget } from '@/components/admin/dashboard/widgets/StatusWidget';
import { UptimeWidget } from '@/components/admin/dashboard/widgets/UptimeWidget';
import { MemoryWidget } from '@/components/admin/dashboard/widgets/MemoryWidget';
import { CpuWidget } from '@/components/admin/dashboard/widgets/CpuWidget';
import { EventLoopWidget } from '@/components/admin/dashboard/widgets/EventLoopWidget';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { SafetyConfirmationModal } from '@/components/admin/SafetyConfirmationModal';
import { CleanupModal } from '@/components/admin/system/CleanupModal';
import { cn } from '@/lib/utils';

export const SystemMetrics = () => {
    const toast = useToast();
    const [currentTime, setCurrentTime] = useState(new Date());

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Update real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: metrics, isLoading } = useQuery({
        queryKey: ['system-metrics'],
        queryFn: AdminSystemService.getMetrics,
        refetchInterval: 60000 // 1 minute
    });

    const { data: history, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['system-history'],
        queryFn: AdminSystemService.getHistory,
        refetchInterval: 300000 // 5 minutes
    });

    // State for widget visibility - load from localStorage
    const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('admin_system_metrics_visibility');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return {
                    'status': true,
                    'uptime': true,
                    'memory': true,
                    'cpu': true,
                    'event-loop': true,
                    'db-health': true,
                    'cpu-history': true,
                    'memory-history': true,
                    'db-history': true,
                    'latency-history': true,
                    'danger-zone': true
                };
            }
        }
        return {
            'status': true,
            'uptime': true,
            'memory': true,
            'cpu': true,
            'event-loop': true,
            'db-health': true,
            'cpu-history': true,
            'memory-history': true,
            'db-history': true,
            'latency-history': true,
            'danger-zone': true
        };
    });

    // State for widget size expansion
    const [widgetSizes, setWidgetSizes] = useState<Record<string, boolean>>({
        'cpu-history': false,
        'memory-history': false,
        'db-history': false,
        'latency-history': false
    });

    // Widget order
    const [widgets, setWidgets] = useState<string[]>([
        'event-loop', 'memory', 'cpu',
        'status', 'uptime',
        'db-health',
        'latency-history', 'cpu-history', 'memory-history', 'db-history',
        'danger-zone'
    ]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setWidgets((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleWidgetVisibility = (id: string) => {
        setVisibleWidgets(prev => {
            const updated = { ...prev, [id]: !prev[id] };
            // Save to localStorage instead of making API calls
            localStorage.setItem('admin_system_metrics_visibility', JSON.stringify(updated));
            return updated;
        });
    };

    const toggleWidgetSize = (id: string) => {
        setWidgetSizes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const [isClearCacheModalOpen, setIsClearCacheModalOpen] = useState(false);
    const [cleanupOpen, setCleanupOpen] = useState(false);

    const clearCacheMutation = useMutation({
        mutationFn: (password: string) => AdminSystemService.clearCache(password),
        onSuccess: (data) => {
            toast.success(data.message);
            setIsClearCacheModalOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al limpiar la caché");
        }
    });

    if (isLoading) {
        return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (!metrics) return null;

    const renderWidget = (id: string) => {
        if (!visibleWidgets[id]) return null;

        switch (id) {
            case 'event-loop':
                return (
                    <DraggableWidget id="event-loop" className="col-span-1">
                        <EventLoopWidget lag={metrics.eventLoop?.lag || 0} />
                    </DraggableWidget>
                );
            case 'status':
                return (
                    <DraggableWidget id="status" className="col-span-1">
                        <StatusWidget />
                    </DraggableWidget>
                );
            case 'uptime':
                return (
                    <DraggableWidget id="uptime" className="col-span-1">
                        <UptimeWidget
                            uptime={metrics.os.uptime}
                            platform={metrics.os.platform}
                            release={metrics.os.release}
                        />
                    </DraggableWidget>
                );
            case 'memory':
                return (
                    <DraggableWidget id="memory" className="col-span-1">
                        <MemoryWidget
                            total={metrics.memory.total}
                            used={metrics.memory.used}
                            usagePercentage={metrics.memory.usagePercentage}
                        />
                    </DraggableWidget>
                );
            case 'cpu':
                return (
                    <DraggableWidget id="cpu" className="col-span-1">
                        <CpuWidget
                            count={metrics.cpu.count}
                            model={metrics.cpu.model}
                            loadAvg={metrics.os.loadAvg[0]}
                        />
                    </DraggableWidget>
                );
            case 'db-health':
                return metrics.database ? (
                    <DraggableWidget id="db-health" className="col-span-1 md:col-span-2 lg:col-span-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Infraestructura de Datos</h3>
                            <DatabaseHealth data={metrics.database} />
                        </div>
                    </DraggableWidget>
                ) : null;
            case 'cpu-history':
                return (
                    <DraggableWidget
                        id="cpu-history"
                        className={cn("col-span-1 md:col-span-2", widgetSizes['cpu-history'] ? "lg:col-span-4" : "lg:col-span-2")}
                        onResize={() => toggleWidgetSize('cpu-history')}
                        isExpanded={widgetSizes['cpu-history']}
                    >
                        <CpuHistoryChart data={history} isLoading={isLoadingHistory} />
                    </DraggableWidget>
                );
            case 'memory-history':
                return (
                    <DraggableWidget
                        id="memory-history"
                        className={cn("col-span-1 md:col-span-2", widgetSizes['memory-history'] ? "lg:col-span-4" : "lg:col-span-2")}
                        onResize={() => toggleWidgetSize('memory-history')}
                        isExpanded={widgetSizes['memory-history']}
                    >
                        <MemoryHistoryChart data={history} isLoading={isLoadingHistory} />
                    </DraggableWidget>
                );
            case 'db-history':
                return (
                    <DraggableWidget
                        id="db-history"
                        className={cn("col-span-1 md:col-span-2", widgetSizes['db-history'] ? "lg:col-span-4" : "lg:col-span-2")}
                        onResize={() => toggleWidgetSize('db-history')}
                        isExpanded={widgetSizes['db-history']}
                    >
                        <DatabaseHistoryChart data={history || []} />
                    </DraggableWidget>
                );
            case 'latency-history':
                return (
                    <DraggableWidget
                        id="latency-history"
                        className={cn("col-span-1 md:col-span-2", widgetSizes['latency-history'] ? "lg:col-span-4" : "lg:col-span-2")}
                        onResize={() => toggleWidgetSize('latency-history')}
                        isExpanded={widgetSizes['latency-history']}
                    >
                        <LatencyHistoryChart data={history || []} isLoading={isLoadingHistory} />
                    </DraggableWidget>
                );
            case 'danger-zone':
                return (
                    <DraggableWidget id="danger-zone" className="col-span-1 md:col-span-2 lg:col-span-4">
                        <div className="rounded-lg border bg-destructive/5 border-destructive/20 p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-destructive/20 pb-4">
                                <Trash2 className="h-5 w-5 text-destructive" />
                                <h2 className="text-lg font-semibold text-destructive">Zona de Peligro</h2>
                            </div>

                            {/* Clear Cache */}
                            <div className="flex items-center justify-between border-b border-destructive/10 pb-4">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Limpiar Caché del Sistema</h3>
                                    <p className="text-sm text-muted-foreground">Eliminará cachés de datos y contenido dinámico.</p>
                                </div>
                                <button
                                    onClick={() => setIsClearCacheModalOpen(true)}
                                    disabled={clearCacheMutation.isPending}
                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium bg-white border border-destructive text-destructive hover:bg-destructive hover:text-white h-9 px-4 py-2"
                                >
                                    {clearCacheMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Limpiar Caché
                                </button>
                            </div>

                            {/* System Cleanup */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-medium">Limpieza Profunda del Sistema</h3>
                                    <p className="text-sm text-muted-foreground">Elimina logs antiguos, métricas obsoletas y archivos temporales.</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setCleanupOpen(true)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Ejecutar Limpieza
                                </Button>
                            </div>
                        </div>
                    </DraggableWidget>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 w-full">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" /> Runtime & Performance Dashboard
                </h2>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" /> Personalizar
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="end">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Visibilidad</h4>
                                <p className="text-xs text-muted-foreground">Elige qué paneles mostrar.</p>
                            </div>
                            <div className="grid gap-2 max-h-75 overflow-y-auto">
                                {widgets.map((id) => (
                                    <div key={id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`widget-${id}`}
                                            checked={visibleWidgets[id]}
                                            onCheckedChange={() => toggleWidgetVisibility(id)}
                                        />
                                        <label htmlFor={`widget-${id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer">
                                            {id.replace(/-/g, ' ')}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={widgets}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {widgets.map(id => renderWidget(id))}
                    </div>
                </SortableContext>
            </DndContext>

            <CleanupModal open={cleanupOpen} onOpenChange={setCleanupOpen} />

            <SafetyConfirmationModal
                isOpen={isClearCacheModalOpen}
                onClose={() => setIsClearCacheModalOpen(false)}
                onConfirm={(password: string) => clearCacheMutation.mutate(password)}
                title="Limpiar Caché"
                description="Estás a punto de limpiar toda la caché de Redis. Esto puede degradar el rendimiento temporalmente."
                confirmValue="CONFIRM"
                confirmLabel="Escribe CONFIRM para confirmar:"
                confirmPlaceholder="Escribe CONFIRM..."
                isPending={clearCacheMutation.isPending}
            />

            <div className="text-center text-xs text-muted-foreground pt-4">
                Última actualización: {currentTime.toLocaleTimeString()}
            </div>
        </div>
    );
};
