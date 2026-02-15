import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminTicketsService, TicketStatus } from '@/services/admin/tickets.service';
import { useToast } from '@/contexts/ToastContext';
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { Loader2, ArrowLeft, Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionTickets } from './traduccion';

export const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const queryClient = useQueryClient();
    const { language } = useLanguage();
    const text = traduccionTickets[language];

    const getDateLocale = () => {
        if (language === 'pt') return ptBR;
        if (language === 'en') return enUS;
        return es;
    };

    const [replyContent, setReplyContent] = useState('');

    const { data: ticket, isLoading } = useQuery({
        queryKey: ['admin-ticket', id],
        queryFn: () => AdminTicketsService.getById(id!),
        enabled: !!id,
    });

    const replyMutation = useMutation({
        mutationFn: (content: string) => AdminTicketsService.reply(id!, content),
        onSuccess: () => {
            setReplyContent('');
            queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] });
            toast.success(text.successReply);
        },
        onError: () => toast.error(text.errorReply),
    });

    const statusMutation = useMutation({
        mutationFn: (status: TicketStatus) => AdminTicketsService.updateStatus(id!, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] });
            toast.success(text.successStatus);
        },
        onError: () => toast.error(text.errorStatus),
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!ticket) return <div>{text.ticketNotFound}</div>;

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        replyMutation.mutate(replyContent);
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/panel/tickets')}
                    className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{ticket.ticketId}</span>
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                            ticket.priority === 'CRITICAL' ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" :
                                ticket.priority === 'HIGH' ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" :
                                    "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        )}>
                            {ticket.priority}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">• {ticket.category}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
                </div>

                <div className="flex items-center gap-2">
                    {ticket.status !== TicketStatus.CLOSED && (
                        <button
                            onClick={() => statusMutation.mutate(TicketStatus.CLOSED)}
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground shadow-sm"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            {text.btnCloseTicket}
                        </button>
                    )}
                    {ticket.status === TicketStatus.OPEN && (
                        <button
                            onClick={() => statusMutation.mutate(TicketStatus.IN_PROGRESS)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {text.btnTakeTicket}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Thread */}
                    <div className="space-y-4">
                        {ticket.messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-4 p-4 rounded-lg border",
                                    msg.senderType === 'admin'
                                        ? "bg-primary/5 dark:bg-primary/10 border-primary/20 ml-8"
                                        : "bg-card border-border mr-8"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                    msg.senderType === 'admin'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {msg.senderType === 'admin' ? 'A' : 'U'}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-foreground">
                                            {msg.senderType === 'admin' ? (msg.senderName || text.agentName) : (ticket.userName || text.userDefaultName)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(msg.createdAt), 'dd MMM HH:mm', { locale: getDateLocale() })}
                                        </span>
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Box */}
                    {ticket.status !== TicketStatus.CLOSED && (
                        <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
                            <form onSubmit={handleSubmitReply}>
                                <label className="text-sm font-medium mb-2 block">{text.replyLabel}</label>
                                <textarea
                                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2 resize-y placeholder:text-muted-foreground"
                                    placeholder={text.replyPlaceholder}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={replyMutation.isPending || !replyContent.trim()}
                                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {replyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        {text.btnSendReply}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {ticket.status === TicketStatus.CLOSED && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 p-4 text-center text-sm text-yellow-800 dark:text-yellow-200 flex items-center justify-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {text.ticketClosedMessage}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm space-y-4">
                        <h3 className="font-semibold text-sm">{text.userInfoTitle}</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs">{text.nameLabel}</span>
                                <div className="text-foreground">{ticket.userName}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">{text.emailLabel}</span>
                                <div className="truncate text-foreground" title={ticket.userEmail}>{ticket.userEmail}</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm space-y-4">
                        <h3 className="font-semibold text-sm">{text.ticketDetailsTitle}</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{text.createdLabel}</span>
                                <span className="text-foreground">{format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: getDateLocale() })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{text.colStatus}</span>
                                <span className="font-medium text-foreground">{ticket.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
