import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicProductsService } from '@/services/publicProducts.service';
import { PublicLayout } from '@/components/layout/PublicLayout/PublicLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/shared/Breadcrumbs';
import { ProductDetailSkeleton } from './components/ProductSkeleton';
import { ProductDetailContent } from './components/ProductDetailContent';

export const ProductDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const { data: productResponse, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => PublicProductsService.getBySlug(slug!),
        enabled: !!slug,
    });

    const product = productResponse?.data;

    const getName = (name: any): string => {
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            return name.es || name.en || name.pt || '';
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

    return (
        <PublicLayout>
            <div className="animate-in fade-in duration-700">
                <Breadcrumbs items={breadcrumbItems} />
                <ProductDetailContent product={product} />
            </div>
        </PublicLayout>
    );
};
