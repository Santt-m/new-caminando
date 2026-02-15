import { useState, useMemo } from 'react';
import { Sparkles, Eye, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { AttributeDefinition, ProductVariant } from '@/types/ecommerce';
import {
    cartesianProduct,
    generateVariantName,
    generateVariantSku,
    getVariantAttributes,
    attributesToCartesianFormat,
    getAttributeName,
    countCombinations
} from '@/utils/variantHelpers';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionProducts } from '../traduccion';

interface VariantConfiguratorProps {
    attributes: AttributeDefinition[];
    baseSku: string;
    basePrice: number;
    baseStock: number;
    onGenerate: (variants: Partial<ProductVariant>[]) => void;
}

export const VariantConfigurator = ({
    attributes,
    baseSku,
    basePrice,
    baseStock,
    onGenerate
}: VariantConfiguratorProps) => {
    const { t, language } = useLanguage();
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    // Filtrar solo atributos de tipo 'select' con valores
    const variantAttributes = useMemo(
        () => getVariantAttributes(attributes),
        [attributes]
    );

    // Generar combinaciones en base a atributos seleccionados
    const combinations = useMemo(() => {
        if (selectedAttributes.length === 0) return [];

        const attributeValues = attributesToCartesianFormat(
            selectedAttributes,
            variantAttributes
        );

        return cartesianProduct(attributeValues);
    }, [selectedAttributes, variantAttributes]);

    const combinationCount = useMemo(
        () => countCombinations(
            attributesToCartesianFormat(selectedAttributes, variantAttributes)
        ),
        [selectedAttributes, variantAttributes]
    );

    const handleAttributeToggle = (attrKey: string) => {
        setSelectedAttributes(prev =>
            prev.includes(attrKey)
                ? prev.filter(k => k !== attrKey)
                : [...prev, attrKey]
        );
    };

    const handleGenerate = () => {
        if (combinations.length === 0) {
            return;
        }

        const newVariants: Partial<ProductVariant>[] = combinations.map(combo => {
            const variantName = generateVariantName(combo);
            const variantSku = generateVariantSku(combo);

            return {
                name: variantName,
                sku: `${baseSku}-${variantSku}`,
                price: basePrice,
                stock: baseStock,
                images: [],
                attributes: combo,
                available: true
            };
        });

        onGenerate(newVariants);
    };

    return (
        <Card className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {t(traduccionProducts, 'autoVariants')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t(traduccionProducts, 'selectVariantAttributes')}
                    </p>
                </div>

                {/* No attributes available */}
                {variantAttributes.length === 0 && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium">No hay atributos disponibles</p>
                            <p className="text-muted-foreground mt-1">
                                Crea atributos de tipo "Selección" con valores en la sección de Atributos para poder generar variantes automáticamente.
                            </p>
                        </div>
                    </div>
                )}

                {/* Attribute selection */}
                {variantAttributes.length > 0 && (
                    <>
                        <div className="space-y-3">
                            {variantAttributes.map((attr) => {
                                const isSelected = selectedAttributes.includes(attr.key);
                                const attrName = getAttributeName(attr, language);

                                return (
                                    <div
                                        key={attr._id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-transparent bg-muted/30 hover:bg-muted/50'
                                            }`}
                                    >
                                        <Checkbox
                                            id={`attr-${attr.key}`}
                                            checked={isSelected}
                                            onCheckedChange={() => handleAttributeToggle(attr.key)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={`attr-${attr.key}`}
                                                className="font-medium cursor-pointer"
                                            >
                                                {attrName}
                                            </Label>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {attr.values?.map((value) => (
                                                    <Badge
                                                        key={value}
                                                        variant={isSelected ? 'default' : 'outline'}
                                                        className="text-xs"
                                                    >
                                                        {value}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Preview section */}
                        {selectedAttributes.length > 0 && (
                            <div className="space-y-3 pt-4 border-t">
                                {/* Combination count */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {t(traduccionProducts, 'preview')}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t(traduccionProducts, 'combinationsCount').replace(
                                                '{{count}}',
                                                String(combinationCount)
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPreview(!showPreview)}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        {showPreview ? 'Ocultar' : 'Ver'}
                                    </Button>
                                </div>

                                {/* Preview grid */}
                                {showPreview && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 bg-muted/30 rounded-lg max-h-60 overflow-y-auto">
                                        {combinations.slice(0, 50).map((combo, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="justify-center text-xs py-1"
                                            >
                                                {generateVariantName(combo)}
                                            </Badge>
                                        ))}
                                        {combinations.length > 50 && (
                                            <Badge variant="outline" className="justify-center text-xs">
                                                +{combinations.length - 50} más
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Warning for many variants */}
                                {combinationCount > 50 && (
                                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <Info className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-600">
                                            Se generarán {combinationCount} variantes. Considera reducir opciones si es necesario.
                                        </p>
                                    </div>
                                )}

                                {/* Generate button */}
                                <Button
                                    type="button"
                                    onClick={handleGenerate}
                                    className="w-full"
                                    size="lg"
                                    disabled={combinationCount === 0 || combinationCount > 100}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {t(traduccionProducts, 'generateCombinations')}
                                </Button>

                                {combinationCount > 100 && (
                                    <p className="text-xs text-center text-destructive">
                                        Máximo 100 variantes permitidas. Reduce las opciones seleccionadas.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* No attributes selected message */}
                        {selectedAttributes.length === 0 && (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                                {t(traduccionProducts, 'noAttributesSelected')}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};
