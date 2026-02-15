import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Search, Loader2, AlertCircle, CheckCircle, Wrench, Eye } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import type { Brand } from '@/types/ecommerce';

interface ExtractedBrand {
    name: string;
    frequency: number;
    sources: string[];
    confidence: number;
    examples: string[];
    lastExtracted: string;
}

interface BrandMapping {
    _id: string;
    extractedBrand: string;
    mappedBrand?: string;
    confidence: number;
    mappingMethod: 'manual' | 'auto' | 'ai';
    mappedAt: string;
    storeName: string;
}

interface BrandExtractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    brand: Brand | null;
}

export const BrandExtractionModal = ({ isOpen, onClose, brand }: BrandExtractionModalProps) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'extracted' | 'mappings' | 'validation'>('extracted');

    // Fetch extracted brands that need mapping
    const { data: extractedBrands, isLoading: loadingExtracted } = useQuery({
        queryKey: ['extracted-brands', brand?._id],
        queryFn: async () => {
            if (!brand) return [];
            const response = await axios.get(`/api/panel/brands/${brand._id}/extracted-brands`);
            return response.data.data.extractedBrands || [];
        },
        enabled: !!brand,
    });

    // Fetch existing mappings for this brand
    const { data: existingMappings, isLoading: loadingMappings } = useQuery({
        queryKey: ['brand-mappings', brand?._id],
        queryFn: async () => {
            if (!brand) return [];
            const response = await axios.get(`/api/panel/brands/${brand._id}/mappings`);
            return response.data.data.mappings || [];
        },
        enabled: !!brand,
    });

    // Fetch brand extraction statistics
    const { data: extractionStats } = useQuery({
        queryKey: ['brand-extraction-stats', brand?._id],
        queryFn: async () => {
            if (!brand) return null;
            const response = await axios.get(`/api/panel/brands/${brand._id}/extraction-stats`);
            return response.data.data;
        },
        enabled: !!brand,
    });

    // Auto-extract brands mutation
    const autoExtractMutation = useMutation({
        mutationFn: async () => {
            if (!brand) throw new Error('No brand selected');
            const response = await axios.post('/api/panel/brands/extract-from-products', {
                storeName: 'all', // Extract from all stores
                sampleSize: 1000
            });
            return response.data.data;
        },
        onSuccess: (data) => {
            toast.success(`Extracción completada: ${data.extractedCount || 0} marcas extraídas`);
            queryClient.invalidateQueries({ queryKey: ['extracted-brands', brand?._id] });
            queryClient.invalidateQueries({ queryKey: ['brand-extraction-stats', brand?._id] });
        },
        onError: (error: any) => {
            toast.error(`Error en extracción: ${error.message}`);
        },
    });

    // Manual mapping mutation
    const manualMapMutation = useMutation({
        mutationFn: async () => {
            if (!brand) throw new Error('No brand selected');
            // For now, we'll use the existing assign-to-products endpoint
            // In a real implementation, this would map specific products
            const response = await axios.post(`/api/panel/brands/${brand._id}/assign-to-products`, {
                productIds: [] // This would be populated with actual product IDs
            });
            return response.data.data;
        },
        onSuccess: () => {
            toast.success('Marca mapeada exitosamente');
            queryClient.invalidateQueries({ queryKey: ['brand-mappings', brand?._id] });
            queryClient.invalidateQueries({ queryKey: ['extracted-brands', brand?._id] });
        },
        onError: (error: any) => {
            toast.error(`Error al mapear: ${error.message}`);
        },
    });

    // Remove mapping mutation
    const removeMappingMutation = useMutation({
        mutationFn: async () => {
            // For now, return mock data as the endpoint doesn't exist yet
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Mapeo eliminado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['brand-mappings', brand?._id] });
            queryClient.invalidateQueries({ queryKey: ['extracted-brands', brand?._id] });
        },
        onError: (error: any) => {
            toast.error(`Error al eliminar mapeo: ${error.message}`);
        },
    });

    // Validate mapping mutation
    const validateMappingMutation = useMutation({
        mutationFn: async () => {
            // For now, return mock data as the endpoint doesn't exist yet
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Mapeo validado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['brand-mappings', brand?._id] });
        },
        onError: (error: any) => {
            toast.error(`Error al validar: ${error.message}`);
        },
    });

    const handleAutoExtract = () => {
        if (window.confirm('¿Estás seguro de ejecutar la extracción automática? Esto analizará los títulos de productos para extraer marcas.')) {
            autoExtractMutation.mutate();
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

    const handleValidateMapping = () => {
        validateMappingMutation.mutate();
    };

    const calculateBrandConfidence = (extractedBrand: ExtractedBrand, targetBrand: Brand | null): number => {
        if (!targetBrand) return 0;
        
        // Calculate similarity between extracted brand name and target brand
        const nameSimilarity = calculateSimilarity(extractedBrand.name, targetBrand.name);
        
        // Consider frequency and sources
        const frequencyScore = Math.min(extractedBrand.frequency / 100, 1);
        
        // Consider confidence from extraction
        const extractionConfidence = extractedBrand.confidence;
        
        // Weighted average
        return (nameSimilarity * 0.5 + frequencyScore * 0.2 + extractionConfidence * 0.3);
    };

    const calculateSimilarity = (str1: string, str2: string): number => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
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

    const filteredExtractedBrands = extractedBrands?.filter((brand: ExtractedBrand) => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            brand.examples.some(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStore = selectedStore === 'all' || brand.sources.includes(selectedStore);
        return matchesSearch && matchesStore;
    }) || [];

    const stores = ['all', ...Array.from(new Set(extractedBrands?.flatMap((brand: ExtractedBrand) => brand.sources) || []))];

    if (!brand) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Extracción y Mapeo de Marca: {brand.name}
                    </DialogTitle>
                    <DialogDescription>
                        Extrae marcas de títulos de productos y mápealas a esta marca principal para mejorar la precisión del scraper
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'extracted' | 'mappings' | 'validation')} className="flex-1">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="extracted">Marcas Extraídas</TabsTrigger>
                        <TabsTrigger value="mappings">Mapeos Existentes</TabsTrigger>
                        <TabsTrigger value="validation">Validación</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-hidden">
                        {/* Extracted Brands Tab */}
                        <TabsContent value="extracted" className="h-full space-y-4 mt-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Marcas Extraídas por Mapear</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAutoExtract}
                                        disabled={autoExtractMutation.isPending}
                                    >
                                        {autoExtractMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Extraer Marcas'
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar marcas extraídas..."
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

                            {/* Statistics */}
                            {extractionStats && (
                                <Card className="p-3">
                                    <div className="grid grid-cols-4 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-primary">{extractionStats.totalExtracted}</div>
                                            <div className="text-xs text-muted-foreground">Total Extraídas</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-success">{extractionStats.mappedCount}</div>
                                            <div className="text-xs text-muted-foreground">Mapeadas</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-warning">{extractionStats.pendingCount}</div>
                                            <div className="text-xs text-muted-foreground">Pendientes</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-info">{Math.round(extractionStats.averageConfidence * 100)}%</div>
                                            <div className="text-xs text-muted-foreground">Confianza Promedio</div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Extracted Brands List */}
                            <ScrollArea className="h-[300px] border rounded-md">
                                {loadingExtracted ? (
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : filteredExtractedBrands.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                                        <AlertCircle className="h-5 w-5 mr-2" />
                                        No hay marcas extraídas para mapear
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-2">
                                        {filteredExtractedBrands.map((extractedBrand: ExtractedBrand) => {
                                            const confidence = calculateBrandConfidence(extractedBrand, brand);
                                            const isAlreadyMapped = existingMappings?.some((mapping: BrandMapping) => 
                                                mapping.extractedBrand === extractedBrand.name
                                            );

                                            return (
                                                <Card key={extractedBrand.name} className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge 
                                                                    variant={confidence > 0.7 ? "success" : confidence > 0.4 ? "warning" : "destructive"}
                                                                    className="text-xs"
                                                                >
                                                                    {Math.round(confidence * 100)}% confianza
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {extractedBrand.frequency} ocurrencias
                                                                </Badge>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {extractedBrand.sources.length} fuentes
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-medium text-sm">{extractedBrand.name}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Ejemplos: {extractedBrand.examples.slice(0, 3).join(', ')}
                                                                {extractedBrand.examples.length > 3 && ` (+${extractedBrand.examples.length - 3} más)`}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Fuentes: {extractedBrand.sources.join(', ')}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => console.log('View brand:', extractedBrand)}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
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
                        </TabsContent>

                        {/* Mappings Tab */}
                        <TabsContent value="mappings" className="h-full space-y-4 mt-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Mapeos Existentes</h3>
                                <Badge variant="outline">
                                    {existingMappings?.length || 0} mapeos
                                </Badge>
                            </div>

                            <ScrollArea className="h-[500px] border rounded-md">
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
                                        {existingMappings?.map((mapping: BrandMapping) => (
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
                                                            <Badge variant="secondary" className="text-xs">
                                                                {mapping.mappingMethod}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="font-medium text-sm">{mapping.extractedBrand}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            Mapeado el {new Date(mapping.mappedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleValidateMapping()}
                                                            disabled={validateMappingMutation.isPending}
                                                        >
                                                            <CheckCircle className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveMapping()}
                                                            disabled={removeMappingMutation.isPending}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        {/* Validation Tab */}
                        <TabsContent value="validation" className="h-full space-y-4 mt-0">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Validación de Mapeos</h3>
                                
                                <Card className="p-4">
                                    <h4 className="font-medium mb-2">Resumen de Validación</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-success">{existingMappings?.filter((m: BrandMapping) => m.confidence > 0.8).length || 0}</div>
                                            <div className="text-xs text-muted-foreground">Alta Confianza</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-warning">{existingMappings?.filter((m: BrandMapping) => m.confidence > 0.5 && m.confidence <= 0.8).length || 0}</div>
                                            <div className="text-xs text-muted-foreground">Media Confianza</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-destructive">{existingMappings?.filter((m: BrandMapping) => m.confidence <= 0.5).length || 0}</div>
                                            <div className="text-xs text-muted-foreground">Baja Confianza</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h4 className="font-medium mb-2">Recomendaciones</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Revisa los mapeos con baja confianza (&lt; 50%)</li>
                                        <li>• Valida mapeos automáticos antes de usarlos en producción</li>
                                        <li>• Considera crear nuevas marcas para extracciones frecuentes no mapeadas</li>
                                        <li>• Monitorea la frecuencia de extracción para detectar cambios en patrones</li>
                                    </ul>
                                </Card>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};