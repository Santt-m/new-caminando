import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ScraperJob } from '@/services/admin/scraper.service';
import { Clock, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface ScraperQueueProps {
    jobs: ScraperJob[];
    isLoading: boolean;
    onCancelJob?: (jobId: string) => void;
}

export const ScraperQueue = ({ jobs, isLoading, onCancelJob }: ScraperQueueProps) => {
    const getStatusIcon = (status: ScraperJob['status']) => {
        switch (status) {
            case 'active': return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
            case 'waiting': return <Clock className="h-4 w-4 text-yellow-500" />;
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getStatusVariant = (status: ScraperJob['status']) => {
        switch (status) {
            case 'active': return 'default';
            case 'completed': return 'secondary';
            case 'failed': return 'destructive';
            case 'waiting': return 'outline';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center border rounded-lg bg-muted/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Objetivo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Intentos</TableHead>
                        <TableHead>Iniciado</TableHead>
                        <TableHead className="text-right w-[80px]">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                No hay trabajos en cola actualmente.
                            </TableCell>
                        </TableRow>
                    ) : (
                        jobs.map((job) => (
                            <TableRow key={job.id} className="hover:bg-muted/20 transition-colors">
                                <TableCell className="font-mono text-[10px] text-muted-foreground">
                                    #{job.id.substring(0, 8)}
                                </TableCell>
                                <TableCell className="font-medium capitalize text-sm">
                                    {job.type.replace('-', ' ')}
                                </TableCell>
                                <TableCell className="text-sm">{job.target}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(job.status)}
                                        <Badge variant={getStatusVariant(job.status)} className="capitalize px-2 py-0 h-5 text-[10px]">
                                            {job.status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{job.attempts}</TableCell>
                                <TableCell className="text-muted-foreground text-[11px]">
                                    {new Date(job.timestamp).toLocaleTimeString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {onCancelJob && job.status !== 'completed' && job.status !== 'failed' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => onCancelJob(job.id)}
                                            title="Cancelar trabajo"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
