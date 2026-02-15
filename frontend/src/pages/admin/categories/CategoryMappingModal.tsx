import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link2, Unlink, Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import type { Category } from '@/types/ecommerce';

interface CategoryMapping {
    _id: string;
    sourceCategory: string;
    targetCategory: string;
    storeName: string;
    confidence: number;
    mappedAt: string;
    autoMapped: boolean;
}

interface CategoryMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

interface StoreCategory {
    name: string;
    path: string[];
    store: string;
    productCount: number;
    lastScraped: string;
}

export const CategoryMappingModal = ({ isOpen, onClose, category }: CategoryMappingModalProps) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState<string>('all');

    // Fetch store categories that need mapping
    const { data: storeCategories, isLoading: loadingStoreCategories } = useQuery({
        queryKey: ['store-categories-needing-mapping', category?._id],
        queryFn: async () => {
            if (!category) return [];
            const response = await axios.get(`/api/panel/categories/${category._id}/store-categories-needing-mapping`);
            return response.data.data.storeCategories || [];
        },
        enabled: !!category,
    });

    // Fetch existing mappings for this category
    const { data: existingMappings, isLoading: loadingMappings } = useQuery({
        queryKey: ['category-mappings', category?._id],
        queryFn: async () => {
            if (!category) return [];
            const response = await axios.get(`/api/panel/categories/${category._id}/mappings`);
            return response.data.data.mappings || [];
        },
        enabled: !!category,
    });

    // Auto-mapping mutation
    const autoMapMutation = useMutation({
        mutationFn: async () => {
            if (!category) throw new Error('No category selected');
            const response = await axios.post(`/api/panel/categories/${category._id}/auto-map`);
            return response.data.data;
        },
        onSuccess: (data) => {
            toast.success(`Auto-mapeo completado: ${data.mappedCount || 0} categorías mapeadas`);
            queryClient.invalidateQueries({ queryKey: ['category-mappings', category?._id] });
            queryClient.invalidateQueries({ queryKey: ['store-categories-needing-mapping', category?._id] });
        },
        onError: (error: any) => {
            toast.error(`Error en auto-mapeo: ${error.message}`);
        },
    });

    // Manual mapping mutation
    const manualMapMutation = useMutation({
        mutationFn: async () => {
            if (!category) throw new Error('No category selected');
            // For now, we'll create a mapping using the existing endpoint
            // In a real implementation, this would map specific store categories
            const response = await axios.post(`/api/panel/categories/${category._id}/mappings`, {
                storeName: 'all',
                storeCategoryId: 'manual',
                storeCategoryName: 'Manual mapping',
                storeCategoryPath: [],
                confidence: 0.9
            });
            return response.data.data;
        },
        onSuccess: () => {
            toast.success('Categoría mapeada exitosamente');
            queryClient.invalidateQueries({ queryKey: ['category-mappings', category?._id] });
            queryClient.invalidateQueries({ queryKey: ['store-categories-needing-mapping', category?._id] });
        },
        onError: (error: any) => {
            toast.error(`Error al mapear: ${error.message}`);
        },
    });

    // Remove mapping mutation
    const removeMappingMutation = useMutation({
        mutationFn: async () => {
            if (!category) throw new Error('No category selected');
            // For now, we'll remove the mapping using the existing endpoint
            // In a real implementation, this would remove specific store category mappings
            const response = await axios.delete(`/api/panel/categories/${category._id}/mappings`);
            return response.data.data;
        },
        onSuccess: () => {
            toast.success('Mapeo eliminado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['category-mappings', category?._id] });
            queryClient.invalidateQueries({ queryKey: ['store-categories-needing-mapping', category?._id] });
        },
        onError: (error: any) => {
            toast.error(`Error al eliminar mapeo: ${error.message}`);
        },
    });

    const handleAutoMap = () => {
        if (window.confirm('¿Estás seguro de ejecutar el auto-mapeo? Esto sobrescribirá mapeos existentes con baja confianza.')) {
            autoMapMutation.mutate();
        }
    };

    const handleManualMap = () => {
        manualMapMutation.mutate();
    };

    const handleRemoveMapping = () => {
        if (window.confirm('¿Estás seguro de eliminar este mapeo?')) {
            removeMappingMutation.mutate();
        }
    };

    const calculateSimilarity = (str1: string, str2: string): number => {
        // Simple similarity calculation (can be enhanced with more sophisticated algorithms)
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    };

    const levenshteinDistance = (str1: string, str2: string): number => {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    };

    const filteredStoreCategories = storeCategories?.filter((cat: StoreCategory) => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cat.path.some(path => path.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStore = selectedStore === 'all' || cat.store === selectedStore;
        return matchesSearch && matchesStore;
    }) || [];

    const stores = ['all', ...Array.from(new Set(storeCategories?.map((cat: StoreCategory) => cat.store) || []))];

    if (!category) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Mapeo de Categoría: {typeof category.name === 'object' ? category.name.es : category.name}
                    </DialogTitle>
                    <DialogDescription>
                        Mapea categorías de supermercados a esta categoría principal para mantener consistencia entre tiendas
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        {/* Left Panel: Store Categories to Map */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Categorías por Mapear</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAutoMap}
                                        disabled={autoMapMutation.isPending}
                                    >
                                        {autoMapMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Auto-Mapear'
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar categorías..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-3 py-2 border rounded-md text-sm"
                                    value={selectedStore}
                                    onChange={(e) => setSelectedStore(e.target.value)}
                                >
                                    {stores.map(store => (
                                        <option key={store as string} value={store as string}>
                                            {store === 'all' ? 'Todas las tiendas' : store as string}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Store Categories List */}
                            <ScrollArea className="h-[400px] border rounded-md">
                                {loadingStoreCategories ? (
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : filteredStoreCategories.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                                        <AlertCircle className="h-5 w-5 mr-2" />
                                        No hay categorías para mapear
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-2">
                                        {filteredStoreCategories.map((storeCat: StoreCategory) => {
                                            const confidence = calculateSimilarity(storeCat.name, typeof category.name === 'object' ? category.name.es : category.name);
                                            const isAlreadyMapped = existingMappings?.some((mapping: CategoryMapping) => 
                                                mapping.sourceCategory === storeCat.name && mapping.storeName === storeCat.store
                                            );

                                            return (
                                                <Card key={`${storeCat.store}-${storeCat.name}`} className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {storeCat.store}
                                                                </Badge>
                                                                <Badge 
                                                                    variant={confidence > 0.7 ? "success" : confidence > 0.4 ? "warning" : "destructive"}
                                                                    className="text-xs"
                                                                >
                                                                    {Math.round(confidence * 100)}% similitud
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-medium text-sm">{storeCat.name}</h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                {storeCat.path.join(' > ')}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {storeCat.productCount} productos • Última extracción: {new Date(storeCat.lastScraped).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {isAlreadyMapped ? (
                                                                <Badge variant="success" className="text-xs">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Mapeado
                                                                </Badge>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleManualMap()}
                                                                    disabled={manualMapMutation.isPending}
                                                                >
                                                                    Mapear
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Right Panel: Existing Mappings */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Mapeos Existentes</h3>
                                <Badge variant="outline">
                                    {existingMappings?.length || 0} mapeos
                                </Badge>
                            </div>

                            <ScrollArea className="h-[460px] border rounded-md">
                                {loadingMappings ? (
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : existingMappings?.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                                        <AlertCircle className="h-5 w-5 mr-2" />
                                        No hay mapeos existentes
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-2">
                                        {existingMappings?.map((mapping: CategoryMapping) => (
                                            <Card key={mapping._id} className="p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {mapping.storeName}
                                                            </Badge>
                                                            <Badge 
                                                                variant={mapping.confidence > 0.7 ? "success" : mapping.confidence > 0.4 ? "warning" : "destructive"}
                                                                className="text-xs"
                                                            >
                                                                {Math.round(mapping.confidence * 100)}% confianza
                                                            </Badge>
                                                            {mapping.autoMapped && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Auto
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h4 className="font-medium text-sm">{mapping.sourceCategory}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            Mapeado el {new Date(mapping.mappedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRemoveMapping()}
                                                        disabled={removeMappingMutation.isPending}
                                                    >
                                                        <Unlink className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};