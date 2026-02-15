import { useState, useEffect } from 'react';
import {
    Sprout,
    Laptop,
    Shirt,
    Utensils,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/services/admin/auth.service';

interface SeedPreset {
    id: string;
    name: string;
    description: string;
    icon: string;
    stats: {
        categories: number;
        products: number;
    };
}

export const SeedsPage = () => {
    const toast = useToast();
    const [seeds, setSeeds] = useState<SeedPreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSeed, setSelectedSeed] = useState<SeedPreset | null>(null);
    const [clearDb, setClearDb] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        fetchSeeds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSeeds = async () => {
        try {
            // adminApi baseURL is /panel, so we request /seeds
            const response = await adminApi.get('/seeds');
            const data = response.data;
            if (data.success) {
                setSeeds(data.data);
            }
        } catch (error) {
            console.error('Error fetching seeds:', error);
            toast.error(
                'No se pudieron cargar los seeds disponibles.',
                'Error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (seed: SeedPreset) => {
        setSelectedSeed(seed);
        setModalOpen(true);
        setConfirmText('');
        setClearDb(false);
    };

    const handleConfirm = async () => {
        if (!selectedSeed) return;

        setApplying(selectedSeed.id);
        setModalOpen(false);

        try {
            const response = await adminApi.post(`/seeds/${selectedSeed.id}`, {
                clearDatabase: clearDb
            });

            const data = response.data;

            if (data.success) {
                toast.success(
                    data.message || 'Seed aplicado con éxito!',
                    '¡Seed aplicado con éxito!'
                );
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error applying seed:', error);
            toast.error(
                error.response?.data?.message || 'Ocurrió un error al intentar configurar la tienda.',
                'Error al aplicar seed'
            );
        } finally {
            setApplying(null);
            setSelectedSeed(null);
        }
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Laptop': return <Laptop className="h-8 w-8 text-blue-500" />;
            case 'Shirt': return <Shirt className="h-8 w-8 text-pink-500" />;
            case 'Utensils': return <Utensils className="h-8 w-8 text-orange-500" />;
            default: return <Sprout className="h-8 w-8 text-green-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Plantillas de Tienda</h1>
                <p className="text-muted-foreground">
                    Selecciona una plantilla base para poblar tu plataforma con categorías y datos de ejemplo.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {seeds.map((seed) => (
                    <div
                        key={seed.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    {getIcon(seed.icon)}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg">{seed.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {seed.description}
                                </p>
                            </div>

                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-foreground">{seed.stats.categories}</span> Categorías
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-foreground">{seed.stats.products}</span> Items
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => handleApplyClick(seed)}
                                disabled={!!applying}
                                className={cn(
                                    "w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                    "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                )}
                            >
                                {applying === seed.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Aplicando...
                                    </>
                                ) : (
                                    "Instalar Plantilla"
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Confirmación */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border-2 border-destructive/20 open-animation">
                        <div className="flex items-center gap-4 text-destructive mb-4">
                            <AlertTriangle className="h-8 w-8" />
                            <h2 className="text-lg font-bold">¡Acción Destructiva!</h2>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Estás a punto de instalar la plantilla <strong>{selectedSeed?.name}</strong>.
                        </p>

                        <div className="space-y-4 mb-6">
                            <label className="flex items-start gap-3 p-3 rounded-md border border-destructive/20 bg-destructive/5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-destructive focus:ring-destructive"
                                    checked={clearDb}
                                    onChange={(e) => setClearDb(e.target.checked)}
                                />
                                <div className="text-sm">
                                    <span className="font-medium text-destructive">Eliminar datos existentes</span>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        Si activas esto, se borrarán TODAS las categorías y datos actuales antes de instalar.
                                    </p>
                                </div>
                            </label>

                            {clearDb && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Escribe "CONFIRMAR" para continuar:
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="CONFIRMAR"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={clearDb && confirmText !== 'CONFIRMAR'}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                            >
                                Proceder
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
