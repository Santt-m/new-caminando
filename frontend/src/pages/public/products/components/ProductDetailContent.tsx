import React, { useState, useEffect } from 'react';
import {
    Star,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Product, ProductVariant, ProductOption } from '@/types/ecommerce';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils/cn';
import { PriceComparisonTable } from './PriceComparisonTable';
import { traducciones } from '../traduccion';

interface ProductDetailContentProps {
    product: Product;
    isModal?: boolean;
}

export const ProductDetailContent: React.FC<ProductDetailContentProps> = ({ product, isModal = false }) => {
    const { t } = useLanguage();
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [mainImage, setMainImage] = useState<string>('');

    // Initialize selected variant and image
    useEffect(() => {
        if (product) {
            setMainImage(product.imageUrl || product.images?.[0] || '');

            // If has variants, select first available one
            if (product.variants && product.variants.length > 0) {
                const firstAvailable = product.variants.find((v: ProductVariant) => v.available !== false);
                if (firstAvailable) {
                    setSelectedVariant(firstAvailable);
                    setSelectedAttributes(firstAvailable.attributes || {});
                    if (firstAvailable.images && firstAvailable.images.length > 0) {
                        setMainImage(firstAvailable.images[0]);
                    }
                }
            }
        }
    }, [product]);

    // Handle option selection
    const handleOptionSelect = (optionKey: string, value: string) => {
        const newAttributes = { ...selectedAttributes, [optionKey]: value };
        setSelectedAttributes(newAttributes);

        // Find matching variant
        if (product?.variants) {
            const matchingVariant = product.variants.find((variant: ProductVariant) => {
                const attrs = variant.attributes || {};
                return Object.keys(newAttributes).every(key => attrs[key] === newAttributes[key]);
            });

            if (matchingVariant) {
                setSelectedVariant(matchingVariant);
                // Update image if variant has specific images
                if (matchingVariant.images && matchingVariant.images.length > 0) {
                    setMainImage(matchingVariant.images[0]);
                } else if (product.imageUrl) {
                    setMainImage(product.imageUrl);
                }
            }
        }
    };

    const getName = (name: any): string => {
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            return name.es || name.en || name.pt || '';
        }
        return '';
    };

    const getDescription = (desc: any): string => {
        if (typeof desc === 'string') return desc;
        if (typeof desc === 'object' && desc !== null) {
            return desc.es || desc.en || desc.pt || '';
        }
        return '';
    };

    const currentPrice = selectedVariant?.price ?? product.price;
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;

    const allImages = [
        ...(product.images || []),
        ...(selectedVariant?.images || [])
    ].filter((img, idx, arr) => arr.indexOf(img) === idx);

    // If no images found, use placeholder or imageUrl if available
    if (allImages.length === 0 && product.imageUrl) {
        allImages.push(product.imageUrl);
    }

    // Ensure at least one image/placeholder exists for main view
    const displayImage = mainImage || product.imageUrl || '/placeholder-product.png';

    return (
        <div className={cn("grid gap-8 pb-8", isModal ? "lg:grid-cols-2" : "lg:grid-cols-12 lg:gap-10 xl:gap-16")}>
            {/* Left: Images */}
            <div className={cn("space-y-6", isModal ? "" : "lg:col-span-7")}>
                <div className="relative group">
                    <Card className="overflow-hidden aspect-square border-none shadow-2xl bg-white">
                        <img
                            src={displayImage}
                            alt={getName(product.name)}
                            className="w-full h-full object-contain p-4 transition-transform duration-700"
                        />
                    </Card>
                    {hasDiscount && (
                        <Badge variant="destructive" className="absolute top-6 left-6 scale-125 font-black shadow-lg">
                            -{Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)}%
                        </Badge>
                    )}
                    {product.featured && (
                        <Badge variant="warning" className="absolute top-6 right-6 scale-110 shadow-lg px-3 py-1 gap-1.5">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {t(traducciones, 'featured')}
                        </Badge>
                    )}
                </div>

                {allImages.length > 1 && (
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 mb-4 custom-scrollbar snap-x flex-nowrap min-w-full">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMainImage(img)}
                                className={cn(
                                    "snap-start flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl border-2 overflow-hidden transition-all duration-300 transform active:scale-95 shadow-sm bg-white",
                                    mainImage === img ? "border-primary ring-4 ring-primary/10" : "border-transparent opacity-70 hover:opacity-100 hover:border-primary/40"
                                )}
                            >
                                <img src={img} alt={`${getName(product.name)} ${idx + 1}`} className="w-full h-full object-contain p-1" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Desktop Description - Only on full page or if space permits */}
                {!isModal && (
                    <div className="hidden lg:block space-y-4 pt-8">
                        <h3 className="text-xl font-bold border-b pb-2">Descripción Completa</h3>
                        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                            {getDescription(product.description)}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Details */}
            <div className={cn("space-y-6", isModal ? "px-1" : "lg:col-span-5 lg:space-y-8")}>
                <div className="space-y-3">
                    {product.brand && (
                        <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary/80 bg-primary/5">
                            {typeof product.brand === 'object' ? product.brand.name : 'Marca'}
                        </Badge>
                    )}
                    <h1 className={cn("font-black tracking-tighter leading-[0.9] text-foreground", isModal ? "text-2xl md:text-3xl lg:text-3xl" : "text-4xl md:text-5xl")}>
                        {getName(product.name)}
                    </h1>

                    <div className="flex items-baseline gap-3 pt-2">
                        <span className="text-4xl lg:text-5xl font-black text-primary tracking-tighter">
                            ${currentPrice?.toLocaleString('es-AR')}
                        </span>
                        <span className="text-xl text-muted-foreground font-medium">{product.currency || 'USD'}</span>
                    </div>

                </div>

                <Separator />

                {/* Price Comparison Table */}
                {product.sources && product.sources.length > 0 && (
                    <div className="py-2">
                        <PriceComparisonTable sources={product.sources} currentPrice={product.price} />
                    </div>
                )}

                {/* Options */}
                {product.options && product.options.length > 0 && (
                    <div className="space-y-4">
                        {product.options.map((option: ProductOption) => (
                            <div key={option.key} className="space-y-2.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-muted-foreground uppercase tracking-wider">{option.name}</span>
                                    <span className="font-medium text-foreground">{selectedAttributes[option.key] || 'Seleccione'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {option.values.map((value: string) => {
                                        const isSelected = selectedAttributes[option.key] === value;
                                        return (
                                            <Button
                                                key={value}
                                                variant={isSelected ? 'default' : 'outline'}
                                                className={cn(
                                                    "min-w-[50px] h-9 rounded-lg font-bold transition-all shadow-sm active:scale-95",
                                                    isSelected ? "shadow-lg shadow-primary/20 scale-105" : "hover:border-primary/50"
                                                )}
                                                onClick={() => handleOptionSelect(option.key, value)}
                                            >
                                                {value}
                                                {isSelected && <Check className="ml-2 h-3 w-3" />}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}



                {/* Mobile Description (in Modal too if needed) */}
                <div className={cn("block space-y-4 pt-6 border-t", isModal ? "lg:hidden" : "lg:hidden")}>
                    <h3 className="text-lg font-bold">Descripción</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                        {getDescription(product.description)}
                    </div>
                </div>
            </div>
        </div>
    );
};
