import React, { useState } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { traducciones } from './traduccion';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { BellOff, Check, Trash2, Info, AlertCircle, Settings } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    type: 'system' | 'alert' | 'info';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

export const Notificaciones: React.FC = () => {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(a => !a.read);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(a => a.id === id ? { ...a, read: true } : a));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(a => ({ ...a, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(a => a.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'info': return <Info className="h-5 w-5 text-info" />;
            case 'system': return <Settings className="h-5 w-5 text-muted-foreground" />;
            default: return <AlertCircle className="h-5 w-5 text-warning" />;
        }
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const alertDate = new Date(date);
        const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) return `${diffInMinutes}m ${t(traducciones, 'ago')} `;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ${t(traducciones, 'ago')} `;
        return alertDate.toLocaleDateString();
    };

    const getNotificationTitle = (notification: any) => {
        return notification.title || 'Notificación del Sistema';
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {t(traducciones, 'title')}
                    </h1>
                    <p className="text-muted-foreground">
                        Gestiona tus notificaciones del sistema
                    </p>
                </div>
            </div>

            {/* Notification Filters */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2 p-1 bg-muted/30 rounded-lg w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            filter === 'all' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t(traducciones, 'all')}
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            filter === 'unread' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t(traducciones, 'unread')}
                    </button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={!notifications.some(a => !a.read)}
                >
                    <Check className="h-4 w-4 mr-2" />
                    {t(traducciones, 'markAllAsRead')}
                </Button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "group relative p-4 rounded-xl border transition-all hover:shadow-md",
                                    notification.read
                                        ? "bg-background border-border"
                                        : "bg-primary/5 border-primary/20 shadow-sm"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-2 rounded-lg shrink-0",
                                        notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                                    )}>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {getIcon((notification as any).type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={cn(
                                                "font-semibold truncate",
                                                notification.read ? "text-foreground/80" : "text-foreground"
                                            )}>
                                                {getNotificationTitle(notification)}
                                            </h3>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {getTimeAgo(notification.date)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteNotification(notification.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {!notification.read && (
                                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <Card className="p-12 text-center text-muted-foreground">
                            <BellOff className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>{t(traducciones, 'emptyState')}</p>
                        </Card>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Notificaciones;
