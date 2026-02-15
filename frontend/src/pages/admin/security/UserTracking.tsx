import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSecurityService, type SecurityLog } from '@/services/admin/security.service';
import { Search, User, MapPin, Clock, Activity, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getEventTypeLabel, getStateColor, getRiskLevel } from '@/constants/security';
import { cn } from '@/lib/utils';

export const UserTracking = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const { data: userActivity } = useQuery({
        queryKey: ['admin-user-activity', selectedUserId],
        queryFn: () => selectedUserId ? AdminSecurityService.getUserActivity(selectedUserId) : null,
        enabled: !!selectedUserId,
    });

    const { data: logsData } = useQuery({
        queryKey: ['admin-security-logs-users', searchTerm],
        queryFn: () => AdminSecurityService.getLogs({ limit: 100 }),
    });

    // Extraer usuarios únicos de los logs
    type UserInfo = { _id: string; name: string; email: string };
    const users: (UserInfo | undefined)[] = logsData?.data?.filter((log: SecurityLog) => log.userId)
        .reduce((acc: SecurityLog[], log: SecurityLog) => {
            if (!acc.find(u => u.userId?._id === log.userId?._id)) {
                acc.push(log);
            }
            return acc;
        }, [])
        .map((log: SecurityLog) => log.userId) || [];

    const filteredUsers = searchTerm
        ? users.filter((u): u is UserInfo => 
            !!u && (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : users.filter((u): u is UserInfo => !!u);

    return (
        <div className="space-y-6">
            {/* Búsqueda de Usuarios */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar usuario por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Lista de Usuarios */}
                <div className="lg:col-span-1">
                    <Card className="overflow-hidden">
                        <div className="border-b p-4 bg-muted/30">
                            <h3 className="font-semibold">Usuarios Activos</h3>
                            <p className="text-sm text-muted-foreground">{filteredUsers.length} usuarios</p>
                        </div>
                        <div className="divide-y max-h-150 overflow-y-auto">
                            {filteredUsers.map((user: UserInfo) => (
                                <button
                                    key={user._id}
                                    onClick={() => setSelectedUserId(user._id)}
                                    className={cn(
                                        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                                        selectedUserId === user._id && "bg-primary/5 border-l-4 border-primary"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </button>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">
                                    <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No se encontraron usuarios</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Detalles de Actividad del Usuario */}
                <div className="lg:col-span-2">
                    {userActivity ? (
                        <div className="space-y-6">
                            {/* Resumen del Usuario */}
                            <Card className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-xl mb-1">{userActivity.userName}</h3>
                                        <p className="text-sm text-muted-foreground">{userActivity.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Nivel de Riesgo</p>
                                        <p className={cn("text-2xl font-bold", getRiskLevel(userActivity.riskScore).color)}>
                                            {getRiskLevel(userActivity.riskScore).label}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Eventos</p>
                                        <p className="text-2xl font-bold">{userActivity.totalEvents}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sesiones</p>
                                        <p className="text-2xl font-bold">{userActivity.sessions.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Risk Score</p>
                                        <p className="text-2xl font-bold">{userActivity.riskScore}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Timeline de Sesiones */}
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">Historial de Sesiones</h3>
                                <div className="space-y-4">
                                    {userActivity.sessions.map((session, i) => (
                                        <div key={i} className="border rounded-lg p-4 bg-muted/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-primary" />
                                                    <span className="font-medium">Sesión #{i + 1}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(session.startTime).toLocaleString('es')}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mb-3 text-sm">
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    IP: <span className="font-mono">{session.ip}</span>
                                                </span>
                                                {session.country && (
                                                    <span className="text-muted-foreground">{session.country}</span>
                                                )}
                                                <span className="ml-auto text-muted-foreground">
                                                    {session.events.length} eventos
                                                </span>
                                            </div>

                                            {/* Timeline de Eventos de la Sesión */}
                                            <div className="space-y-2 mt-4 pl-4 border-l-2 border-primary/20">
                                                {session.events.slice(0, 5).map((event, j) => (
                                                    <div key={j} className="flex items-start gap-3 pb-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full mt-1.5",
                                                            getStateColor(event.visitorState).badge
                                                        )} />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{getEventTypeLabel(event.eventType)}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(event.createdAt).toLocaleTimeString('es')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {session.events.length > 5 && (
                                                    <p className="text-xs text-muted-foreground italic pl-5">
                                                        + {session.events.length - 5} eventos más
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <h3 className="font-semibold text-lg mb-2">Selecciona un Usuario</h3>
                            <p className="text-sm text-muted-foreground">
                                Elige un usuario de la lista para ver su actividad detallada
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
