import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSecurityService, type SecurityLog } from '@/services/admin/security.service';
import { Search, Download, Eye, Ban, Globe, Calendar, X, MapPin, Network, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getVisitorStateLabel, getEventTypeLabel, getStateColor, getRiskLevel } from '@/constants/security';
import { cn } from '@/lib/utils';

const IPDetailsModal = ({ log, onClose }: { log: SecurityLog; onClose: () => void }) => {
    const info = log.ipInfo || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="border-b p-4 bg-muted/30 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Network className="h-4 w-4 text-primary" />
                        Detalles Técnicos de IP
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Dirección IP</p>
                            <p className="font-mono text-sm">{log.ip}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Riesgo Escaneado</p>
                            <span className={cn("text-sm font-bold", getRiskLevel(log.riskScore).color)}>
                                {log.riskScore} / 100
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Ubicación Geográfica</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{info.city || 'Desconocida'}, {info.country || 'Desconocido'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span>Continente: {info.continent || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Información de Red (ISP)</p>
                        <div className="bg-muted/50 p-3 rounded-md space-y-1">
                            <p className="text-sm font-medium">{info.isp || 'Administrador de red desconocido'}</p>
                            <p className="text-xs text-muted-foreground">{info.organization || 'Sin organización registrada'}</p>
                            <p className="text-[10px] font-mono mt-2 text-primary">ASN: {info.asn || 'N/A'}</p>
                        </div>
                    </div>

                    {log.userId && (
                        <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Usuario Vinculado</p>
                            <div className="flex items-center gap-2 text-sm">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{log.userId.name} ({log.userId.email})</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-muted/30 p-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                    >
                        Cerrar reporte
                    </button>
                </div>
            </Card>
        </div>
    );
};

export const SecurityLogs = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        ip: '',
        visitorState: '',
        eventType: '',
        dateFrom: '',
        dateTo: ''
    });
    const [selectedLog, setSelectedLog] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const { data: logsData, isLoading } = useQuery({
        queryKey: ['admin-security-logs', page, filters],
        queryFn: () => AdminSecurityService.getLogs({
            page,
            limit: 20,
            ...filters
        }),
        refetchInterval: 60000 // 1 minute
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleExport = async () => {
        try {
            const blob = await AdminSecurityService.exportReport({
                dateFrom: filters.dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                dateTo: filters.dateTo || new Date().toISOString(),
                format: 'csv'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    const selectedLogDetails = logsData?.data?.find((log: SecurityLog) => log._id === selectedLog);

    return (
        <div className="space-y-4">
            {/* Modal de Detalles */}
            {showDetails && selectedLogDetails && (
                <IPDetailsModal log={selectedLogDetails} onClose={() => setShowDetails(false)} />
            )}

            {/* Filtros */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-3">
                    {/* Búsqueda por IP */}
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por IP o Visitor ID..."
                            value={filters.ip}
                            onChange={(e) => handleFilterChange('ip', e.target.value)}
                            className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Estado */}
                    <select
                        value={filters.visitorState}
                        onChange={(e) => handleFilterChange('visitorState', e.target.value)}
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Todos los Estados</option>
                        <option value="NORMAL">Normal</option>
                        <option value="BOT">Bot</option>
                        <option value="SCRAPER">Scraper</option>
                        <option value="SUSPICIOUS">Sospechoso</option>
                        <option value="MALICIOUS">Malicioso</option>
                        <option value="IP_BLOCKED">IP Bloqueada</option>
                    </select>

                    {/* Tipo de Evento */}
                    <select
                        value={filters.eventType}
                        onChange={(e) => handleFilterChange('eventType', e.target.value)}
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Todos los Eventos</option>
                        <option value="LOGIN_SUCCESS">Login Exitoso</option>
                        <option value="LOGIN_FAILED">Login Fallido</option>
                        <option value="PAGE_VIEW">Vista de Página</option>

                        <option value="SUSPICIOUS_ACTION">Acción Sospechosa</option>
                    </select>

                    {/* Fecha Desde */}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Exportar */}
                    <button
                        onClick={handleExport}
                        className="h-10 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2 text-sm font-medium"
                    >
                        <Download className="h-4 w-4" />
                        Exportar
                    </button>
                </div>
            </Card>

            {/* Timeline de Logs */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Lista de Logs */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="border-b p-4 bg-muted/30">
                            <h3 className="font-semibold">Registro de Eventos en Vivo</h3>
                            <p className="text-sm text-muted-foreground">
                                {logsData?.pagination?.total || 0} eventos registrados
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="p-12 flex justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            </div>
                        ) : (
                            <div className="divide-y max-h-150 overflow-y-auto">
                                {logsData?.data?.map((log: SecurityLog) => {
                                    const stateColor = getStateColor(log.visitorState);
                                    const riskLevel = getRiskLevel(log.riskScore);
                                    const isSelected = selectedLog === log._id;

                                    return (
                                        <div
                                            key={log._id}
                                            onClick={() => setSelectedLog(log._id)}
                                            className={cn(
                                                "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                                                isSelected && "bg-primary/5 border-l-4 border-primary"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", stateColor.bg, stateColor.text)}>
                                                            {getVisitorStateLabel(log.visitorState)}
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {getEventTypeLabel(log.eventType)}
                                                        </span>
                                                        {log.riskScore > 0 && (
                                                            <span className={cn("text-xs font-bold", riskLevel.color)}>
                                                                Riesgo: {log.riskScore}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1 font-semibold text-foreground/80">
                                                            <Globe className="h-3 w-3" />
                                                            <span className="font-mono">{log.ip}</span>
                                                        </span>
                                                        {log.ipInfo?.country && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {log.ipInfo.city && `${log.ipInfo.city}, `}{log.ipInfo.country}
                                                            </span>
                                                        )}
                                                        {log.userId && (
                                                            <span>Usuario: {log.userId.name}</span>
                                                        )}
                                                        <span>{new Date(log.createdAt).toLocaleString('es')}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLog(log._id);
                                                    }}
                                                    className="p-2 hover:bg-background rounded"
                                                >
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Paginación */}
                        {logsData?.pagination && logsData.pagination.totalPages > 1 && (
                            <div className="border-t p-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Página {page} de {logsData.pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="px-3 py-1.5 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        disabled={page === logsData.pagination.totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-3 py-1.5 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Detalles del Log Seleccionado */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <div className="border-b p-4 bg-muted/30">
                            <h3 className="font-semibold">Detalles del Evento</h3>
                        </div>
                        {selectedLogDetails ? (
                            <div className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Estado</p>
                                    <span className={cn("px-2 py-1 rounded text-xs font-medium", getStateColor(selectedLogDetails.visitorState).bg, getStateColor(selectedLogDetails.visitorState).text)}>
                                        {getVisitorStateLabel(selectedLogDetails.visitorState)}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                                    <p className="font-mono text-sm">{selectedLogDetails.ip}</p>
                                    {selectedLogDetails.ipInfo?.isp && (
                                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                            {selectedLogDetails.ipInfo.isp}
                                        </p>
                                    )}
                                </div>

                                {selectedLogDetails.visitorId && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Visitor ID (Token largo)</p>
                                        <p className="font-mono text-[10px] break-all bg-muted p-1 rounded">
                                            {selectedLogDetails.visitorId}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Evento</p>
                                    <p className="text-sm">{getEventTypeLabel(selectedLogDetails.eventType)}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Nivel de Riesgo</p>
                                    <p className={cn("text-sm font-bold", getRiskLevel(selectedLogDetails.riskScore).color)}>
                                        {getRiskLevel(selectedLogDetails.riskScore).label} ({selectedLogDetails.riskScore})
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Fecha/Hora</p>
                                    <p className="text-sm">{new Date(selectedLogDetails.createdAt).toLocaleString('es')}</p>
                                </div>

                                {selectedLogDetails.metadata && Object.keys(selectedLogDetails.metadata).length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Metadata</p>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                                            {JSON.stringify(selectedLogDetails.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                <div className="pt-4 border-t space-y-2">
                                    <button
                                        onClick={() => setShowDetails(true)}
                                        className="w-full py-2 px-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Ver Detalles de IP
                                    </button>
                                    <button className="w-full py-2 px-3 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 flex items-center justify-center gap-2 text-sm">
                                        <Ban className="h-4 w-4" />
                                        Bloquear IP
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <Eye className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Selecciona un evento para ver detalles</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
