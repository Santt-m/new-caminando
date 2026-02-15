import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ScraperJob } from '@/services/admin/scraper.service';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ScraperQueueProps {
    jobs: ScraperJob[];
    isLoading: boolean;
}

export const ScraperQueue = ({ jobs, isLoading }: ScraperQueueProps) => {
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
                        <TableHead className="text-right">Iniciado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No hay trabajos en cola actualmente.
                            </TableCell>
                        </TableRow>
                    ) : (
                        jobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    #{job.id.substring(0, 8)}
                                </TableCell>
                                <TableCell className="font-medium capitalize">
                                    {job.type.replace('-', ' ')}
                                </TableCell>
                                <TableCell>{job.target}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(job.status)}
                                        <Badge variant={getStatusVariant(job.status)} className="capitalize px-2 py-0 h-5 text-[10px]">
                                            {job.status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>{job.attempts}</TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">
                                    {new Date(job.timestamp).toLocaleTimeString()}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
