import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminUsersService } from '@/services/admin/users.service';
import { AdminAnalyticsService } from '@/services/admin/analytics.service';
import { RecentActivityList } from '@/components/admin/dashboard/RecentActivityList';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/contexts/ToastContext';
import { Loader2, Shield, Smartphone, Globe, Clock, Trash2, AlertTriangle, Save, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Controller } from 'react-hook-form';

// Schema for Profile Edit
const profileSchema = z.object({
    name: z.string().min(2, 'Nombre muy corto'),
    email: z.string().email('Email inválido'),
    role: z.enum(['user', 'admin', 'super_admin', 'driver']),
    isActive: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserDetailModalProps {
    userId: string | null;
    onClose: () => void;
}

export const UserDetailModal = ({ userId, onClose }: UserDetailModalProps) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const isOpen = !!userId;

    // Queries
    const { data: user, isLoading: loadingUser } = useQuery({
        queryKey: ['admin-user', userId],
        queryFn: () => AdminUsersService.getById(userId!),
        enabled: !!userId,
    });

    const { data: sessions, isLoading: loadingSessions, refetch: refetchSessions } = useQuery({
        queryKey: ['admin-user-sessions', userId],
        queryFn: () => AdminUsersService.getSessions(userId!),
        enabled: !!userId,
    });

    const { data: logs, isLoading: loadingLogs } = useQuery({
        queryKey: ['admin-user-logs', userId],
        queryFn: () => AdminAnalyticsService.getRecentLogs(userId ? { userId } : {}),
        enabled: !!userId,
    });

    // Form
    const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                role: user.role as ProfileFormData['role'], // Casting seguro
                isActive: user.isActive,
            });
        }
    }, [user, reset]);

    // Mutations
    const updateMutation = useMutation({
        mutationFn: (data: ProfileFormData) => AdminUsersService.update(userId!, data),
        onSuccess: () => {
            toast.success('Perfil actualizado correctamente');
            queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] }); // Refresh list
        },
        onError: () => toast.error('Error al actualizar perfil'),
    });

    const revokeSessionMutation = useMutation({
        mutationFn: (sessionId: string) => AdminUsersService.revokeSession(userId!, sessionId),
        onSuccess: () => {
            toast.success('Sesión revocada');
            refetchSessions();
        },
        onError: () => toast.error('Error al revocar sesión'),
    });

    const revokeAllMutation = useMutation({
        mutationFn: () => AdminUsersService.revokeAllSessions(userId!),
        onSuccess: () => {
            toast.success('Todas las sesiones revocadas');
            refetchSessions();
        },
        onError: () => toast.error('Error al revocar sesiones'),
    });

    const onSubmit = (data: ProfileFormData) => {
        updateMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{user ? `Gestión de Usuario: ${user.name}` : 'Cargando...'}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden flex flex-col">
                    {loadingUser ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                                <div className="px-6 pt-4 border-b bg-muted/30 shrink-0">
                                    <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-4">
                                        <TabsTrigger value="profile">Perfil y Estado</TabsTrigger>
                                        <TabsTrigger value="sessions">Sesiones ({sessions?.length || 0})</TabsTrigger>
                                        <TabsTrigger value="tracking">Auditoría</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-hidden relative">
                                    {/* TAB: PROFILE */}
                                    <TabsContent value="profile" className="h-full overflow-y-auto p-6 mt-0 space-y-6">
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            {/* ... form content ... */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Info Básica */}
                                                <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                                                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                        <Shield className="h-4 w-4" /> Información de Cuenta
                                                    </h3>

                                                    <div className="space-y-2">
                                                        <Label>Nombre</Label>
                                                        <Input {...register('name')} placeholder="Nombre completo" />
                                                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input {...register('email')} type="email" placeholder="correo@ejemplo.com" />
                                                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Rol del Sistema</Label>
                                                        <Controller
                                                            control={control}
                                                            name="role"
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seleccionar rol" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="user">Usuario</SelectItem>
                                                                        <SelectItem value="driver">Conductor (Driver)</SelectItem>
                                                                        <SelectItem value="admin">Administrador</SelectItem>
                                                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Estado y Seguridad */}
                                                <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                                                    <h3 className="font-semibold flex items-center gap-2 text-amber-500">
                                                        <AlertTriangle className="h-4 w-4" /> Zona de Control
                                                    </h3>

                                                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                                                        <div className="space-y-0.5">
                                                            <Label>Estado de la cuenta</Label>
                                                            <p className="text-xs text-muted-foreground">Desactivar para banear acceso</p>
                                                        </div>
                                                        <Controller
                                                            control={control}
                                                            name="isActive"
                                                            render={({ field }) => (
                                                                <div className="flex items-center gap-2">
                                                                    <Switch
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                    <Badge variant={field.value ? "success" : "destructive"} className="w-20 justify-center">
                                                                        {field.value ? "ACTIVO" : "INACTIVO"}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="p-4 border rounded-md bg-muted/20 space-y-3">
                                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                                            <KeyRound className="h-4 w-4" /> Credenciales
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => toast.info('Funcionalidad de envío de email de recuperación próximamente')}
                                                            className="w-full"
                                                        >
                                                            Enviar Email de Recuperación
                                                        </Button>
                                                    </div>

                                                    <div className="p-4 border rounded-md bg-destructive/5 border-destructive/20 space-y-3">
                                                        <h4 className="text-sm font-bold text-destructive">Seguridad Crítica</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            Estas acciones son irreversibles o pueden causar interrupción inmediata.
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (window.confirm('¿Estás seguro de cerrar todas las sesiones del usuario?')) {
                                                                    revokeAllMutation.mutate();
                                                                }
                                                            }}
                                                            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
                                                        >
                                                            Cerrar Todas las Sesiones
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4 border-t sticky bottom-0 bg-background/95 backdrop-blur py-4 -mb-6 px-6 border-t-border/50">
                                                <Button
                                                    type="submit"
                                                    disabled={!isDirty || updateMutation.isPending}
                                                    className="px-8 gap-2 shadow-lg shadow-primary/20"
                                                >
                                                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    Guardar Cambios
                                                </Button>
                                            </div>
                                        </form>
                                    </TabsContent>

                                    {/* TAB: SESSIONS */}
                                    <TabsContent value="sessions" className="h-full overflow-y-auto p-6 mt-0">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
                                                <h3 className="text-lg font-semibold">Sesiones Activas</h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => revokeAllMutation.mutate()}
                                                    disabled={revokeAllMutation.isPending}
                                                    className="h-8 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                                                >
                                                    Revocar Todas
                                                </Button>
                                            </div>

                                            {loadingSessions ? (
                                                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                            ) : sessions?.length === 0 ? (
                                                <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-xl border border-dashed flex flex-col items-center gap-2">
                                                    <Smartphone className="h-8 w-8 opacity-20" />
                                                    <p>No hay sesiones activas</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4">
                                                    {sessions?.map((session) => (
                                                        <div key={session.id} className="flex items-start justify-between p-4 border rounded-xl bg-card hover:bg-accent/5 transition-all hover:shadow-md group">
                                                            <div className="flex gap-4">
                                                                <div className="p-3 bg-secondary/50 rounded-2xl h-fit group-hover:bg-primary/10 transition-colors">
                                                                    <Smartphone className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="font-bold text-sm">
                                                                        {session.deviceInfo.browser} en {session.deviceInfo.os}
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                                                                            <Globe className="h-3 w-3" />
                                                                            {session.ipInfo.city || 'Ciudad desconocida'}, {session.ipInfo.country || 'País desconocido'}
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                                                                            <Clock className="h-3 w-3" />
                                                                            {format(new Date(session.lastUsedAt), "dd MMM HH:mm", { locale: es })}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                                                                        IP: {session.ipInfo.ip} | ID: {session.id.substring(0, 8)}...
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => revokeSessionMutation.mutate(session.id)}
                                                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                title="Revocar sesión"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* TAB: TRACKING */}
                                    <TabsContent value="tracking" className="h-full overflow-hidden p-6 mt-0">
                                        <div className="h-full flex flex-col">
                                            {loadingLogs ? (
                                                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                            ) : logs ? (
                                                <RecentActivityList logs={logs.data} title="Historial Completo de Actividad" />
                                            ) : (
                                                <div className="text-center py-10 text-muted-foreground">No hay registros de actividad</div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
