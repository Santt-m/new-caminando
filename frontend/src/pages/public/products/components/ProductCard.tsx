import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Product } from '@/types/ecommerce';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from '../traduccion';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { t } = useLanguage();

    const getName = (name: any): string => {
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            return name.es || name.en || name.pt || '';
        }
        return '';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: product.currency || 'USD',
        }).format(price);
    };

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
        : 0;

    return (
        <Card className="group relative flex flex-col overflow-hidden h-full border-muted/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {hasDiscount && (
                    <Badge variant="destructive" className="font-bold">
                        -{discountPercentage}%
                    </Badge>
                )}
                {product.featured && (
                    <Badge variant="warning" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {t(traducciones, 'featured')}
                    </Badge>
                )}
            </div>

            {/* Image */}
            <Link to={`/productos/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
                <img
                    src={product.images[0] || '/placeholder-product.png'}
                    alt={getName(product.name)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-4">
                        <Badge variant="outline" className="text-sm font-semibold py-1 px-3">
                            {t(traducciones, 'outOfStock')}
                        </Badge>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 pt-5">
                <div className="mb-2">
                    {product.brand && typeof product.brand === 'object' && (
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            {product.brand.name}
                        </span>
                    )}
                </div>

                <Link
                    to={`/productos/${product.slug}`}
                    className="block group-hover:text-primary transition-colors mb-3"
                >
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3rem]">
                        {getName(product.name)}
                    </h3>
                </Link>

                <div className="mt-auto space-y-4">
                    <div className="flex flex-col">
                        {hasDiscount ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-primary">
                                    {formatPrice(product.discountPrice!)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                                    {formatPrice(product.price)}
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-black text-foreground">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            variant="default"
                            size="lg"
                            asChild
                            className="w-full font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all gap-2"
                        >
                            <Link to={`/productos/${product.slug}`}>
                                <Info className="h-5 w-5" />
                                {t(traducciones, 'details')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
