import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminUsersService } from '@/services/admin/users.service';
import { AdminAnalyticsService } from '@/services/admin/analytics.service';
import { RecentActivityList } from '@/components/admin/dashboard/RecentActivityList';
import {
    ArrowLeft,
    Mail,
    Calendar,
    Shield,
    ShoppingCart,
    Bell,
    Loader2,
    UserCheck,
    UserX
} from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionAdminUsers } from './traduccion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const text = traduccionAdminUsers[language];

    const getDateLocale = () => {
        if (language === 'pt') return ptBR;
        if (language === 'en') return enUS;
        return es;
    };

    const { data: user, isLoading: loadingUser } = useQuery({
        queryKey: ['admin-user', id],
        queryFn: () => AdminUsersService.getById(id!),
        enabled: !!id,
    });

    const { data: logs, isLoading: loadingLogs } = useQuery({
        queryKey: ['admin-user-logs', id],
        queryFn: () => AdminAnalyticsService.getRecentLogs({ userId: id }),
        enabled: !!id,
    });

    if (loadingUser || loadingLogs) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return <div>{text.userNotFound}</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/panel/users')}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {user.name}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" /> {user.email}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    {user.isActive ? (
                        <Badge variant="success" className="gap-1">
                            <UserCheck className="h-3 w-3" /> {text.statusActive}
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="gap-1">
                            <UserX className="h-3 w-3" /> {text.statusInactive}
                        </Badge>
                    )}
                    <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" /> {user.role === 'admin' ? text.roleAdmin : text.roleUser}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Columna Izquierda: Detalles */}
                <div className="space-y-6">
                    {/* Tarjeta de Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{text.personalInfo}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground">{text.registered}</span>
                                <span className="text-sm flex items-center gap-1 font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: getDateLocale() })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-muted-foreground">{text.clientId}</span>
                                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{user.id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tarjeta Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{text.usageStats}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-secondary/30 p-4 rounded-lg text-center border border-border/50">
                                    <ShoppingCart className="h-5 w-5 mx-auto mb-2 text-primary opacity-80" />
                                    <div className="text-2xl font-bold">{user.stats?.cartsCount || 0}</div>
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{text.carts}</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg text-center border border-border/50">
                                    <Bell className="h-5 w-5 mx-auto mb-2 text-primary opacity-80" />
                                    <div className="text-2xl font-bold">{user.stats?.alertsCount || 0}</div>
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{text.alerts}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Historial de Seguridad */}
                <div className="md:col-span-2 h-[500px]">
                    {logs && logs.data && (
                        <RecentActivityList
                            logs={logs.data}
                            title={text.historyTitle}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
