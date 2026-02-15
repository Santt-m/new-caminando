import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Upload, Loader2, Trash2, Check, Ban } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { ProductVariant } from '@/types/ecommerce';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionProducts } from '../traduccion';
import { toast } from 'sonner';

interface VariantEditorProps {
    variant: Partial<ProductVariant>;
    index: number;
    onUpdate: (index: number, field: keyof ProductVariant, value: any) => void;
    onRemove: (index: number) => void;
    onImageUpload: (index: number, images: string[]) => void;
}

export const VariantEditor = ({
    variant,
    index,
    onUpdate,
    onRemove,
    onImageUpload
}: VariantEditorProps) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(index === 0); // Primer item expandido por defecto
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    const isEnabled = variant.available !== false;
    const variantImages = variant.images || [];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const currentImageCount = variantImages.length;
        const maxImages = 4;

        if (currentImageCount + files.length > maxImages) {
            toast.error(`Máximo ${maxImages} imágenes por variante`);
            return;
        }

        setIsUploadingImages(true);

        const uploadPromises = files.map(async (file) => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} no es una imagen`);
                return null;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} supera 5MB`);
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'products_images');

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    { method: 'POST', body: formData }
                );
                const data = await response.json();
                return data.secure_url;
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Error al subir ${file.name}`);
                return null;
            }
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter((url): url is string => url !== null);

        if (validUrls.length > 0) {
            onImageUpload(index, [...variantImages, ...validUrls]);
            toast.success(`${validUrls.length} imagen(es) subida(s)`);
        }

        setIsUploadingImages(false);
    };

    const removeImage = (imageIndex: number) => {
        const newImages = variantImages.filter((_, i) => i !== imageIndex);
        onImageUpload(index, newImages);
    };

    const toggleEnabled = () => {
        onUpdate(index, 'available', !isEnabled);
    };

    return (
        <Card className={`overflow-hidden transition-all ${!isEnabled ? 'opacity-60' : ''}`}>
            {/* Header - Siempre visible */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 flex-1">
                    {/* Enable/Disable indicator */}
                    <div className={`flex-shrink-0 ${isEnabled ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {isEnabled ? (
                            <Check className="h-5 w-5" />
                        ) : (
                            <Ban className="h-5 w-5" />
                        )}
                    </div>

                    {/* Variant name and status */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                            {variant.name || `Variante #${index + 1}`}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                                SKU: {variant.sku || 'Sin definir'}
                            </Badge>
                            {variant.price && (
                                <span className="text-xs text-muted-foreground">
                                    ${variant.price.toFixed(2)}
                                </span>
                            )}
                            {typeof variant.stock === 'number' && (
                                <span className="text-xs text-muted-foreground">
                                    Stock: {variant.stock}
                                </span>
                            )}
                            {variantImages.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {variantImages.length} {variantImages.length === 1 ? 'imagen' : 'imágenes'}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Expand/Collapse icon */}
                    <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className="border-t p-4 space-y-4 bg-muted/20">
                    {/* Basic fields */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <Label className="text-xs">SKU *</Label>
                            <Input
                                value={variant.sku || ''}
                                onChange={(e) => onUpdate(index, 'sku', e.target.value)}
                                placeholder="VAR-001"
                                className="h-8 text-sm"
                                disabled={!isEnabled}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">EAN</Label>
                            <Input
                                value={variant.ean || ''}
                                onChange={(e) => onUpdate(index, 'ean', e.target.value)}
                                placeholder="Opcional"
                                className="h-8 text-sm"
                                disabled={!isEnabled}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">{t(traduccionProducts, 'variantPrice')} *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={variant.price || ''}
                                onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                                disabled={!isEnabled}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">{t(traduccionProducts, 'variantStock')} *</Label>
                            <Input
                                type="number"
                                value={variant.stock || ''}
                                onChange={(e) => onUpdate(index, 'stock', parseInt(e.target.value) || 0)}
                                className="h-8 text-sm"
                                disabled={!isEnabled}
                            />
                        </div>
                    </div>

                    {/* Discount price */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">{t(traduccionProducts, 'discountPrice')}</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={variant.discountPrice || ''}
                                onChange={(e) => onUpdate(index, 'discountPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="Opcional"
                                className="h-8 text-sm"
                                disabled={!isEnabled}
                            />
                        </div>
                    </div>

                    {/* Attributes display */}
                    {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                        <div>
                            <Label className="text-xs mb-2 block">{t(traduccionProducts, 'variantAttributes')}</Label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(variant.attributes).map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="text-xs">
                                        {key}: {value}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Images section */}
                    <div>
                        <Label className="text-xs mb-2 block">{t(traduccionProducts, 'variantImages')}</Label>

                        {/* Image grid */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {variantImages.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group aspect-square">
                                    <img
                                        src={img}
                                        alt={`Variant ${imgIdx + 1}`}
                                        className="w-full h-full object-cover rounded border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(imgIdx)}
                                        disabled={!isEnabled}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}

                            {/* Upload button */}
                            {variantImages.length < 4 && (
                                <label
                                    className={`aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors ${!isEnabled || isUploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isUploadingImages ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Subir</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={!isEnabled || isUploadingImages}
                                    />
                                </label>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {variantImages.length}/4 imágenes • Máximo 5MB por imagen
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                        <Button
                            type="button"
                            variant={isEnabled ? 'outline' : 'default'}
                            size="sm"
                            onClick={toggleEnabled}
                        >
                            {isEnabled ? (
                                <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    {t(traduccionProducts, 'disableVariant')}
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    {t(traduccionProducts, 'enableVariant')}
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t(traduccionProducts, 'removeVariant')}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};
