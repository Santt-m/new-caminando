import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminSecurityService, type IPRule } from '@/services/admin/security.service';
import { Plus, Trash2, Shield, Ban, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/contexts/ToastContext';

export const SecuritySettings = () => {
    const [newRule, setNewRule] = useState({ ip: '', type: 'blacklist' as 'whitelist' | 'blacklist', reason: '' });
    const toast = useToast();
    const queryClient = useQueryClient();

    const { data: ipRules = [], isLoading } = useQuery<IPRule[]>({
        queryKey: ['admin-ip-rules'],
        queryFn: AdminSecurityService.getIPRules,
    });

    const addRuleMutation = useMutation({
        mutationFn: AdminSecurityService.addIPRule,
        onSuccess: () => {
            toast.success('Regla agregada correctamente');
            queryClient.invalidateQueries({ queryKey: ['admin-ip-rules'] });
            setNewRule({ ip: '', type: 'blacklist', reason: '' });
        },
        onError: () => toast.error('Error al agregar regla'),
    });

    const removeRuleMutation = useMutation({
        mutationFn: AdminSecurityService.removeIPRule,
        onSuccess: () => {
            toast.success('Regla eliminada');
            queryClient.invalidateQueries({ queryKey: ['admin-ip-rules'] });
        },
        onError: () => toast.error('Error al eliminar regla'),
    });

    const handleAddRule = () => {
        if (!newRule.ip) {
            toast.error('La dirección IP es requerida');
            return;
        }

        // Validación básica de IP
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(newRule.ip)) {
            toast.error('Formato de IP inválido');
            return;
        }

        addRuleMutation.mutate(newRule);
    };

    const whitelist = ipRules.filter(r => r.type === 'whitelist');
    const blacklist = ipRules.filter(r => r.type === 'blacklist');

    return (
        <div className="space-y-6">
            {/* Agregar Nueva Regla */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Agregar Nueva Regla de IP
                </h3>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium mb-2 block">Dirección IP</label>
                        <input
                            type="text"
                            placeholder="ej: 192.168.1.1"
                            value={newRule.ip}
                            onChange={(e) => setNewRule({ ...newRule, ip: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium mb-2 block">Tipo de Regla</label>
                        <select
                            value={newRule.type}
                            onChange={(e) => setNewRule({ ...newRule, type: e.target.value as 'whitelist' | 'blacklist' })}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="whitelist">Whitelist (Permitir)</option>
                            <option value="blacklist">Blacklist (Bloquear)</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium mb-2 block">Razón (Opcional)</label>
                        <input
                            type="text"
                            placeholder="ej: Bot malicioso"
                            value={newRule.reason}
                            onChange={(e) => setNewRule({ ...newRule, reason: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                        <button
                            onClick={handleAddRule}
                            disabled={addRuleMutation.isPending}
                            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            Agregar
                        </button>
                    </div>
                </div>
            </Card>

            {/* Gestión de Reglas */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Whitelist */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-lg">Whitelist</h3>
                        <span className="ml-auto text-sm text-muted-foreground">
                            {whitelist.length} IP{whitelist.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        IPs siempre permitidas, sin restricciones de seguridad
                    </p>
                    
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : whitelist.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No hay IPs en whitelist</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {whitelist.map((rule) => (
                                <div key={rule._id} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-mono font-semibold">{rule.ip}</p>
                                        {rule.reason && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{rule.reason}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Agregada: {new Date(rule.createdAt).toLocaleDateString('es')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿Eliminar esta IP de la whitelist?')) {
                                                removeRuleMutation.mutate(rule._id);
                                            }
                                        }}
                                        className="p-2 text-destructive hover:bg-destructive/10 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Blacklist */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Ban className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold text-lg">Blacklist</h3>
                        <span className="ml-auto text-sm text-muted-foreground">
                            {blacklist.length} IP{blacklist.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        IPs bloqueadas permanentemente por Sentinel
                    </p>
                    
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : blacklist.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No hay IPs bloqueadas</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {blacklist.map((rule) => (
                                <div key={rule._id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-mono font-semibold">{rule.ip}</p>
                                        {rule.reason && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{rule.reason}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Bloqueada: {new Date(rule.createdAt).toLocaleDateString('es')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿Desbloquear esta IP?')) {
                                                removeRuleMutation.mutate(rule._id);
                                            }
                                        }}
                                        className="p-2 text-destructive hover:bg-destructive/10 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Información Adicional */}
            <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <h4 className="font-semibold text-blue-900">Información sobre Reglas de IP</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>Whitelist:</strong> IPs en esta lista siempre tendrán acceso completo, sin restricciones de seguridad.</li>
                            <li>• <strong>Blacklist:</strong> IPs bloqueadas permanentemente. No podrán acceder al sitio.</li>
                            <li>• Las reglas se aplican inmediatamente a todas las solicitudes entrantes.</li>
                            <li>• Puedes usar direcciones IP individuales (ej: 192.168.1.1).</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};
