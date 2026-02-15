import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { AdminTicketsService, TicketStatus, TicketPriority } from '@/services/admin/tickets.service';
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionTickets } from './traduccion';

export const TicketList = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<TicketStatus | ''>('');
    const [priority, setPriority] = useState<TicketPriority | ''>('');
    const { language } = useLanguage();
    const text = traduccionTickets[language];

    const getDateLocale = () => {
        if (language === 'pt') return ptBR;
        if (language === 'en') return enUS;
        return es;
    };

    const { data, isLoading } = useQuery({
        queryKey: ['admin-tickets', page, status, priority],
        queryFn: () => AdminTicketsService.getAll({
            page,
            status: status || undefined,
            priority: priority || undefined,
            limit: 10
        }),
        placeholderData: (prev) => prev,
    });

    const getStatusBadge = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.OPEN:
                return <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">{text.statusOpen}</span>;
            case TicketStatus.IN_PROGRESS:
                return <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">{text.statusInProgress}</span>;
            case TicketStatus.RESOLVED:
                return <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">{text.statusResolved}</span>;
            case TicketStatus.CLOSED:
                return <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800/50 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">{text.statusClosed}</span>;
            default:
                return status;
        }
    };

    const getPriorityIcon = (priority: TicketPriority) => {
        switch (priority) {
            case TicketPriority.CRITICAL:
                return <span title={text.priorityCritical}><AlertCircle className="h-4 w-4 text-destructive" /></span>;
            case TicketPriority.HIGH:
                return <span title={text.priorityHigh}><AlertCircle className="h-4 w-4 text-orange-500" /></span>;
            case TicketPriority.MEDIUM:
                return <span title={text.priorityMedium}><Clock className="h-4 w-4 text-yellow-500" /></span>;
            case TicketPriority.LOW:
                return <span title={text.priorityLow}><CheckCircle2 className="h-4 w-4 text-success" /></span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{text.title}</h1>
                    <p className="text-muted-foreground">{text.subtitle}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{text.statusLabel}</span>
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TicketStatus)}
                    >
                        <option value="">{text.allStatuses}</option>
                        <option value={TicketStatus.OPEN}>{text.statusOpen}</option>
                        <option value={TicketStatus.IN_PROGRESS}>{text.statusInProgress}</option>
                        <option value={TicketStatus.RESOLVED}>{text.statusResolved}</option>
                        <option value={TicketStatus.CLOSED}>{text.statusClosed}</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{text.priorityLabel}</span>
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    >
                        <option value="">{text.allPriorities}</option>
                        <option value={TicketPriority.CRITICAL}>{text.priorityCritical}</option>
                        <option value={TicketPriority.HIGH}>{text.priorityHigh}</option>
                        <option value={TicketPriority.MEDIUM}>{text.priorityMedium}</option>
                        <option value={TicketPriority.LOW}>{text.priorityLow}</option>
                    </select>
                </div>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]">{text.colPriority}</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">{text.colSubject}</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">{text.colUser}</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">{text.colStatus}</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">{text.colLastUpdate}</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">{text.colAction}</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                    </td>
                                </tr>
                            ) : data?.tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                                        {text.noTickets}
                                    </td>
                                </tr>
                            ) : (
                                data?.tickets.map((ticket) => (
                                    <tr key={ticket.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="flex justify-center">
                                                {getPriorityIcon(ticket.priority)}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <Link to={`/panel/tickets/${ticket.id}`} className="font-medium hover:underline text-foreground">
                                                    {ticket.subject}
                                                </Link>
                                                <span className="text-xs text-muted-foreground">#{ticket.ticketId} • {ticket.category}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col text-sm">
                                                <span className="text-foreground">{ticket.userName || text.userDefaultName}</span>
                                                <span className="text-xs text-muted-foreground">{ticket.userEmail}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {format(new Date(ticket.updatedAt), 'dd MMM HH:mm', { locale: getDateLocale() })}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Link
                                                to={`/panel/tickets/${ticket.id}`}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                                            >
                                                {text.btnView}
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación Simple */}
            {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <button
                        className="h-9 px-4 py-2 border rounded-md text-sm disabled:opacity-50 bg-background text-foreground hover:bg-accent"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        {text.previous}
                    </button>
                    <span className="text-sm text-muted-foreground">
                        {page} de {data.pagination.totalPages}
                    </span>
                    <button
                        className="h-9 px-4 py-2 border rounded-md text-sm disabled:opacity-50 bg-background text-foreground hover:bg-accent"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page === data.pagination.totalPages}
                    >
                        {text.next}
                    </button>
                </div>
            )}
        </div>
    );
};
