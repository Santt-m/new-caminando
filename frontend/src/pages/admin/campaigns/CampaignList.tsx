import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { campaignsService } from '@/services/admin/campaigns';
import { Plus, BarChart2, Copy, Link as LinkIcon, Check, QrCode } from 'lucide-react';
import QRCode from "react-qr-code";
import type { Campaign } from '@/services/admin/campaigns';

export const CampaignList = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Link Generator State
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [targetPath, setTargetPath] = useState('/');
    const [copied, setCopied] = useState(false);

    // Form state
    const [newCode, setNewCode] = useState('');
    const [newDest, setNewDest] = useState('');

    const generatedUrl = useMemo(() => {
        if (!selectedCampaign) return 'Selecciona una campaña...';
        // Clean path
        let path = targetPath.trim();
        if (!path.startsWith('/')) path = '/' + path;

        const origin = window.location.origin;
        return `${origin}${path}?ref=${selectedCampaign}`;
    }, [selectedCampaign, targetPath]);

    const copyToClipboard = () => {
        if (!selectedCampaign) return;
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setCopied(false), 2000);
    };

    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: campaignsService.getAll
    });

    const createMutation = useMutation({
        mutationFn: campaignsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            setIsCreateOpen(false);
            setNewCode('');
            setNewDest('');
            toast.success('Campaña creada');
        },
        onError: () => toast.error('Error al crear')
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => campaignsService.toggleStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Estado actualizado');
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ code: newCode, destinationUrl: newDest });
    };

    if (isLoading) return <div className="p-8">Cargando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Campañas de Marketing</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Nueva Campaña</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear nueva campaña</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Código (Slug)</label>
                                <Input
                                    placeholder="ej: instagram_verano"
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Será usado en la URL: ?ref=CODIGO</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">URL Destino (Opcional)</label>
                                <Input
                                    placeholder="https://..."
                                    value={newDest}
                                    onChange={e => setNewDest(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Creando...' : 'Crear'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Link Generator Section */}
            <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Generador de Enlaces
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">1. Página Destino</label>
                            <Input
                                placeholder="Ej: / o /productos"
                                value={targetPath}
                                onChange={(e) => setTargetPath(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">2. Selecciona Campaña</label>
                            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {campaigns?.filter((c: Campaign) => c.isActive).map((c: Campaign) => (
                                        <SelectItem key={c._id} value={c.code}>{c.code}</SelectItem>
                                    ))}
                                    {(!campaigns || campaigns.filter((c: Campaign) => c.isActive).length === 0) && (
                                        <SelectItem value="none" disabled>No hay campañas activas</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">3. Tu Enlace Personalizado</label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={generatedUrl}
                                    className="bg-background font-mono text-sm"
                                />
                                <Button size="icon" variant="outline" onClick={copyToClipboard} title="Copiar enlace">
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="outline" title="Ver código QR" disabled={!selectedCampaign}>
                                            <QrCode className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-8">
                                        <DialogHeader>
                                            <DialogTitle>Código QR de Campaña</DialogTitle>
                                        </DialogHeader>
                                        <div className="p-4 bg-white rounded-lg shadow-sm border mt-4">
                                            <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                                                <QRCode
                                                    size={256}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                    value={generatedUrl}
                                                    viewBox={`0 0 256 256`}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-center text-muted-foreground mt-4 break-all max-w-[80%]">
                                            {generatedUrl}
                                        </p>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Campañas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estado</TableHead>
                                <TableHead>Código</TableHead>
                                <TableHead>Visitas</TableHead>
                                <TableHead>Conversiones</TableHead>
                                <TableHead>Ratio</TableHead>
                                <TableHead>Creada</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns?.map((campaign: Campaign) => {
                                const ratio = campaign.metrics.visits > 0
                                    ? ((campaign.metrics.conversions / campaign.metrics.visits) * 100).toFixed(1)
                                    : '0.0';

                                return (
                                    <TableRow key={campaign._id}>
                                        <TableCell>
                                            <Switch
                                                checked={campaign.isActive}
                                                onCheckedChange={(checked) => toggleMutation.mutate({ id: campaign._id, isActive: checked })}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono font-medium">{campaign.code}</TableCell>
                                        <TableCell>{campaign.metrics.visits}</TableCell>
                                        <TableCell>{campaign.metrics.conversions}</TableCell>
                                        <TableCell>{ratio}%</TableCell>
                                        <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/panel/campaigns/${campaign._id}`}>
                                                    <BarChart2 className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {(!campaigns || campaigns.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No hay campañas activas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
