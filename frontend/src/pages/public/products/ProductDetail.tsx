import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    MessageCircle,
    Heart,
    Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PublicProductsService } from '@/services/publicProducts.service';
import type { ProductVariant, ProductOption } from '@/types/ecommerce';
import { PublicLayout } from '@/components/layout/PublicLayout/PublicLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/shared/Breadcrumbs';
import { cn } from '@/utils/cn';

import { ProductDetailSkeleton } from './components/ProductSkeleton';

export const ProductDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [mainImage, setMainImage] = useState<string>('');

    const { data: productResponse, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => PublicProductsService.getBySlug(slug!),
        enabled: !!slug,
    });

    const product = productResponse?.data;

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

    const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
        if (!product) return [];
        const items: BreadcrumbItem[] = [
            { label: t(traducciones, 'home'), href: '/' },
            { label: t(traducciones, 'allProducts'), href: '/productos' }
        ];

        if (product.category && typeof product.category === 'object') {
            items.push({
                label: getName(product.category.name),
                href: `/productos?category=${product.category.slug}`
            });
        }

        items.push({ label: getName(product.name), active: true });
        return items;
    }, [product, t]);

    if (isLoading) {
        return (
            <PublicLayout>
                <div className="container mx-auto px-4 py-8">
                    <ProductDetailSkeleton />
                </div>
            </PublicLayout>
        );
    }

    if (!product) {
        return (
            <PublicLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
                    <div className="bg-muted rounded-full p-6">
                        <RotateCcw className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Producto no encontrado</h1>
                        <p className="text-muted-foreground max-w-md">
                            Lo sentimos, el producto que buscas no existe o ha sido retirado de nuestra tienda.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/productos')} size="lg" className="rounded-full px-8">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {t(traducciones, 'back')}
                    </Button>
                </div>
            </PublicLayout>
        );
    }

    const currentPrice = selectedVariant?.price ?? product.price;
    const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
    const currentSku = selectedVariant?.sku ?? product.sku;
    const isAvailable = selectedVariant ? (selectedVariant.available !== false) : product.available;
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;

    const allImages = [
        ...(product.images || []),
        ...(selectedVariant?.images || [])
    ].filter((img, idx, arr) => arr.indexOf(img) === idx);

    return (
        <PublicLayout>
            <div className="animate-in fade-in duration-700">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="grid lg:grid-cols-12 gap-10 xl:gap-16">
                    {/* Left: Images */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative group">
                            <Card className="overflow-hidden aspect-square border-none shadow-2xl bg-muted/30">
                                <img
                                    src={mainImage || 'https://placehold.co/800x800?text=No+Image'}
                                    alt={getName(product.name)}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={cn(
                                            "flex-shrink-0 w-24 h-24 rounded-2xl border-2 overflow-hidden transition-all duration-300 transform active:scale-95 shadow-sm",
                                            mainImage === img ? "border-primary ring-4 ring-primary/10" : "border-transparent grayscale hover:grayscale-0 hover:border-primary/40"
                                        )}
                                    >
                                        <img src={img} alt={`${getName(product.name)} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Desktop Description */}
                        <div className="hidden lg:block space-y-4 pt-8">
                            <h3 className="text-xl font-bold border-b pb-2">Descripción Completa</h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                                {getDescription(product.description)}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="space-y-4">
                            {product.brand && (
                                <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary/80 bg-primary/5">
                                    {typeof product.brand === 'object' ? product.brand.name : 'Marca'}
                                </Badge>
                            )}
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] text-foreground">
                                {getName(product.name)}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                    <span className="ml-2 text-sm text-muted-foreground font-medium">(4.8 / 120 reseñas)</span>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-3 pt-4">
                                <span className="text-5xl font-black text-primary tracking-tighter">
                                    ${currentPrice?.toLocaleString('es-AR')}
                                </span>
                                <span className="text-xl text-muted-foreground font-medium">{product.currency || 'USD'}</span>
                            </div>

                            {currentSku && (
                                <p className="text-xs font-mono text-muted-foreground uppercase opacity-60">SKU: {currentSku}</p>
                            )}
                        </div>

                        <Separator />

                        {/* Options */}
                        {product.options && product.options.length > 0 && (
                            <div className="space-y-6">
                                {product.options.map((option: ProductOption) => (
                                    <div key={option.key} className="space-y-3">
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
                                                            "min-w-[60px] h-11 rounded-xl font-bold transition-all shadow-sm active:scale-95",
                                                            isSelected ? "shadow-lg shadow-primary/20 scale-105" : "hover:border-primary/50"
                                                        )}
                                                        onClick={() => handleOptionSelect(option.key, value)}
                                                    >
                                                        {value}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Stock & Quantity */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isAvailable && currentStock > 0 ? (
                                        <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
                                            <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                                            {currentStock} disponibles
                                        </div>
                                    ) : (
                                        <Badge variant="destructive" className="font-bold">Sin stock</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    size="lg"
                                    className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 active:scale-[0.98] transition-all bg-green-600 hover:bg-green-700 text-white"
                                    asChild
                                >
                                    <a
                                        href={`https://wa.me/5491112345678?text=${encodeURIComponent(
                                            `Hola! Me interesa este producto: ${getName(product.name)} (SKU: ${product.sku})`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="h-6 w-6 mr-3" />
                                        {language === 'es' ? 'Consulte por este producto' : language === 'en' ? 'Inquire about this product' : 'Consulte sobre este produto'}
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <Card className="p-4 flex items-center gap-3 bg-muted/20 border-none shadow-none rounded-2xl">
                                <Truck className="h-5 w-5 text-primary" />
                                <div className="text-[10px] leading-tight font-bold uppercase tracking-tighter">
                                    <p className="text-foreground">Envío Rápido</p>
                                    <p className="text-muted-foreground font-normal">En 24/48 horas</p>
                                </div>
                            </Card>
                            <Card className="p-4 flex items-center gap-3 bg-muted/20 border-none shadow-none rounded-2xl">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <div className="text-[10px] leading-tight font-bold uppercase tracking-tighter">
                                    <p className="text-foreground">Pago Seguro</p>
                                    <p className="text-muted-foreground font-normal">Encriptación SSL</p>
                                </div>
                            </Card>
                        </div>

                        {/* Social & Wishlist */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-muted-foreground/20 hover:bg-muted/30">
                                <Heart className="h-5 w-5 mr-2" />
                                {t(traducciones, 'home') === 'Home' ? 'Wishlist' : 'Favoritos'}
                            </Button>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-muted-foreground/20 hover:bg-muted/30">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Mobile Description */}
                        <div className="lg:hidden space-y-4 pt-8">
                            <h3 className="text-xl font-bold border-b pb-2">Descripción</h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                {getDescription(product.description)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};
