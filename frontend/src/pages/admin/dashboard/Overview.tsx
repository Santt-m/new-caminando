import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';
import { useQuery } from '@tanstack/react-query';
import { AdminAnalyticsService } from '@/services/admin/analytics.service';
import { AdminSystemService } from '@/services/admin/system.service';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { TrafficHistoryChart } from '@/components/admin/dashboard/TrafficHistoryChart';

import {
    Users,
    ShieldCheck,
    Loader2,
    AlertTriangle,
    Eye,
    Cloud,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatusWidget } from '@/components/admin/dashboard/widgets/StatusWidget';
import { UptimeWidget } from '@/components/admin/dashboard/widgets/UptimeWidget';
import { MemoryWidget } from '@/components/admin/dashboard/widgets/MemoryWidget';
import { CpuWidget } from '@/components/admin/dashboard/widgets/CpuWidget';
import { EventLoopWidget } from '@/components/admin/dashboard/widgets/EventLoopWidget';
import { DraggableWidget } from '@/components/admin/dashboard/DraggableWidget';
import { CleanupModal } from '@/components/admin/system/CleanupModal';
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
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CpuHistoryChart, MemoryHistoryChart } from '@/components/admin/dashboard/SystemHistoryChart';
import { DatabaseHistoryChart } from '@/components/admin/dashboard/DatabaseHistoryChart';
import { LatencyHistoryChart } from '@/components/admin/dashboard/LatencyHistoryChart';

export const AdminDashboard = () => {
    const { t } = useLanguage();
    // const text = ... removed unused
    const [trafficRange, setTrafficRange] = useState<'24h' | '7d'>('24h');
    const [cleanupOpen, setCleanupOpen] = useState(false);

    // Widget state
    const [widgets, setWidgets] = useState<string[]>([
        'kpi-users', 'kpi-security',
        'system-eventloop', 'system-memory', 'system-cpu', 'system-status', 'system-uptime',
        'traffic-chart',
        'latency-history', 'cpu-history', 'memory-history', 'db-history'
    ]);

    // State for widget visibility
    const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('admin_dashboard_visibility');
        if (saved) {
            try { return JSON.parse(saved); } catch { return {}; }
        }
        return {
            'kpi-users': true,
            'kpi-security': true,
            'system-status': true,
            'system-uptime': true,
            'system-cpu': true,
            'system-memory': true,
            'system-eventloop': true,
            'traffic-chart': true,
            'cpu-history': false,
            'memory-history': false,
            'db-history': false,
            'latency-history': true
        };
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { data: overview, isLoading: loadOverview } = useQuery({
        queryKey: ['admin-overview'],
        queryFn: AdminAnalyticsService.getOverview,
    });

    const { data: systemMetrics, isLoading: loadSystem } = useQuery({
        queryKey: ['system-metrics'],
        queryFn: AdminSystemService.getMetrics,
        refetchInterval: 60000
    });

    const { data: trafficHistory, isLoading: isLoadingTraffic } = useQuery({
        queryKey: ['traffic-history', trafficRange],
        queryFn: () => AdminAnalyticsService.getTrafficHistory(trafficRange),
        refetchInterval: 300000
    });

    const { data: systemHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['system-history'],
        queryFn: AdminSystemService.getHistory,
        refetchInterval: 300000
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setWidgets((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newLayout = arrayMove(items, oldIndex, newIndex);
                localStorage.setItem('admin_dashboard_layout', JSON.stringify(newLayout));
                return newLayout;
            });
        }
    };

    const toggleWidgetVisibility = (id: string) => {
        setVisibleWidgets(prev => {
            const newVisible = { ...prev, [id]: !prev[id] };
            localStorage.setItem('admin_dashboard_visibility', JSON.stringify(newVisible));
            return newVisible;
        });
    };

    const isLoading = loadOverview || loadSystem || isLoadingTraffic;

    if (isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="flex h-96 w-full flex-col items-center justify-center text-destructive">
                <AlertTriangle className="h-10 w-10 mb-2" />
                <p>{t(traducciones, 'error')}</p>
            </div>
        );
    }

    const renderWidget = (id: string) => {
        if (!visibleWidgets[id]) return null;

        switch (id) {
            case 'kpi-users':
                return (
                    <DraggableWidget id="kpi-users" className="col-span-1">
                        <StatsCard
                            title={t(traducciones, 'usersTotal')}
                            value={overview.users?.total || 0}
                            icon={Users}
                            trend="+2%"
                            trendUp={true}
                        />
                    </DraggableWidget>
                );
            case 'kpi-security':
                return (
                    <DraggableWidget id="kpi-security" className="col-span-1">
                        <StatsCard
                            title={t(traducciones, 'securityRequests')}
                            value={overview.security?.requestsToday || 0}
                            icon={ShieldCheck}
                            trend={t(traducciones, 'safe')}
                            trendUp={true}
                        />
                    </DraggableWidget>
                );
            case 'system-status':
                return systemMetrics ? (
                    <DraggableWidget id="system-status" className="col-span-1">
                        <StatusWidget />
                    </DraggableWidget>
                ) : null;
            case 'system-uptime':
                return systemMetrics ? (
                    <DraggableWidget id="system-uptime" className="col-span-1">
                        <UptimeWidget
                            uptime={systemMetrics.os.uptime}
                            platform={systemMetrics.os.platform}
                            release={systemMetrics.os.release}
                        />
                    </DraggableWidget>
                ) : null;
            case 'system-cpu':
                return systemMetrics ? (
                    <DraggableWidget id="system-cpu" className="col-span-1">
                        <CpuWidget
                            count={systemMetrics.cpu.count}
                            model={systemMetrics.cpu.model}
                            loadAvg={systemMetrics.os.loadAvg[0]}
                        />
                    </DraggableWidget>
                ) : null;
            case 'system-memory':
                return systemMetrics ? (
                    <DraggableWidget id="system-memory" className="col-span-1">
                        <MemoryWidget
                            total={systemMetrics.memory.total}
                            used={systemMetrics.memory.used}
                            usagePercentage={systemMetrics.memory.usagePercentage}
                        />
                    </DraggableWidget>
                ) : null;
            case 'system-eventloop':
                return systemMetrics ? (
                    <DraggableWidget id="system-eventloop" className="col-span-1">
                        <EventLoopWidget lag={systemMetrics.eventLoop?.lag || 0} />
                    </DraggableWidget>
                ) : null;
            case 'traffic-chart':
                return (
                    <DraggableWidget id="traffic-chart" className="col-span-1 md:col-span-2 lg:col-span-4">
                        <TrafficHistoryChart
                            data={trafficHistory}
                            isLoading={isLoadingTraffic}
                            range={trafficRange}
                            onRangeChange={setTrafficRange}
                        />
                    </DraggableWidget>
                );
            case 'cpu-history':
                return (
                    <DraggableWidget id="cpu-history" className="col-span-1 md:col-span-2 lg:col-span-4">
                        <CpuHistoryChart data={systemHistory} isLoading={isLoadingHistory} />
                    </DraggableWidget>
                );
            case 'memory-history':
                return (
                    <DraggableWidget id="memory-history" className="col-span-1 md:col-span-2 lg:col-span-4">
                        <MemoryHistoryChart data={systemHistory} isLoading={isLoadingHistory} />
                    </DraggableWidget>
                );
            case 'db-history':
                return (
                    <DraggableWidget id="db-history" className="col-span-1 md:col-span-2 lg:col-span-4">
                        <DatabaseHistoryChart data={systemHistory || []} />
                    </DraggableWidget>
                );
            case 'latency-history':
                return (
                    <DraggableWidget id="latency-history" className="col-span-1 md:col-span-2 lg:col-span-4">
                        <LatencyHistoryChart data={systemHistory || []} isLoading={isLoadingHistory} />
                    </DraggableWidget>
                );
            default:
                return null;
        }
    };



    // ... (existing code)

    return (
        <div className="space-y-8 animate-in will-change-transform fade-in duration-500">
            {/* Cleanup Modal */}
            <CleanupModal open={cleanupOpen} onOpenChange={setCleanupOpen} />

            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t(traducciones, 'title')}</h1>
                        <Badge variant="outline" className="py-1 px-3 gap-1.5 bg-primary/10 text-primary border-primary/20">
                            <Cloud className="h-3.5 w-3.5" />
                            Serverless Runtime
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{t(traducciones, 'subtitle')}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setCleanupOpen(true)}>
                        <Trash2 className="h-4 w-4" /> {t(traducciones, 'cleanupButton')}
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" /> {t(traducciones, 'customize')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56" align="end">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">{t(traducciones, 'visibility')}</h4>
                                    <p className="text-xs text-muted-foreground">{t(traducciones, 'selectWidgets')}</p>
                                </div>
                                <div className="grid gap-2 max-h-75 overflow-y-auto">
                                    {widgets.map((id) => (
                                        <div key={id} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id={`widget-${id}`}
                                                checked={visibleWidgets[id]}
                                                onCheckedChange={() => toggleWidgetVisibility(id)}
                                            />
                                            <Label htmlFor={`widget-${id}`} className="text-xs font-medium leading-none capitalize cursor-pointer flex-1">
                                                {id.replace(/-/g, ' ')}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
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
        </div>
    );
};

