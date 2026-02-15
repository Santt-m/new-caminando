import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Info
} from 'lucide-react';
import { adminEmailService } from '@/services/admin/emailService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const EmailLogs = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 20;

    const { data, isLoading } = useQuery({
        queryKey: ['admin-email-logs', page, search],
        queryFn: () => adminEmailService.getLogs(page, limit, search),
        placeholderData: (prev) => prev,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por destinatario..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <Card className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Destinatario</TableHead>
                            <TableHead>Tipo (Plantilla)</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Detalles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">Cargando registros...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No se encontraron registros de correos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.logs.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {log.recipient}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {log.templateName}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {log.status === 'success' ? (
                                            <Badge variant="success" className="gap-1 px-2">
                                                <CheckCircle2 className="h-3 w-3" /> Enviado
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="gap-1 px-2">
                                                <XCircle className="h-3 w-3" /> Fallido
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {log.error || log.metadata ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left" className="max-w-xs">
                                                        <div className="space-y-2">
                                                            {log.error && (
                                                                <p className="text-xs text-destructive font-mono">Error: {log.error}</p>
                                                            )}
                                                            {log.metadata && (
                                                                <div className="text-[10px] font-mono bg-muted p-1 rounded overflow-hidden truncate">
                                                                    Data: {JSON.stringify(log.metadata)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Sin info</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Paginación */}
            {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" /> Anterior
                    </Button>
                    <div className="text-sm text-muted-foreground px-4">
                        Página {page} de {data.pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page === data.pagination.totalPages}
                        className="gap-1"
                    >
                        Siguiente <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
