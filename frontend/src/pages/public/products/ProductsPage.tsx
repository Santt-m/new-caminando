import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    RotateCcw
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout/PublicLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';
import { ProductCard } from './components/ProductCard';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductSkeleton, SidebarSkeleton } from './components/ProductSkeleton';
import { PublicProductsService } from '@/services/publicProducts.service';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProductDetailContent } from './components/ProductDetailContent';
import type { Product } from '@/types/ecommerce';

export const ProductsPage: React.FC = () => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Derived State from URL
    const activeFilters = useMemo(() => {
        const brands = searchParams.get('brand')?.split(',').filter(Boolean);
        const attrsParam = searchParams.get('attributes');
        let attributes = undefined;
        try { if (attrsParam) attributes = JSON.parse(attrsParam); } catch (e) { }

        return {
            category: searchParams.get('category') || undefined,
            subcategory: searchParams.get('subcategory') || undefined,
            brand: brands,
            minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
            maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
            attributes,
            sort: searchParams.get('sort') || '-createdAt',
            page: parseInt(searchParams.get('page') || '1'),
            search: searchParams.get('search') || undefined,
        };
    }, [searchParams]);

    // Data Fetching: Main Filters Info
    const { data: filtersData } = useQuery({
        queryKey: ['public-filters'], // KEY IS NOW STABLE
        queryFn: () => PublicProductsService.getFilters({
            // No category/subcategory here to load all categories upfront
            search: activeFilters.search
        }),
        placeholderData: (p) => p,
    });

    // Separate query for Brands to handle pagination
    const {
        data: brandsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['public-brands', activeFilters.search], // STABLE KEY
        queryFn: ({ pageParam = 1 }) => PublicProductsService.getFilters({
            brandsPage: pageParam,
            search: activeFilters.search
        }),
        getNextPageParam: (lastPage) => {
            if (lastPage.data.brands.hasMore) {
                return lastPage.data.brands.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    // Merge brands from infinite query into filtersData for Sidebar
    const mergedFilters = useMemo(() => {
        if (!filtersData?.data) return null;

        const allBrands = brandsData?.pages.flatMap(page => page.data.brands.items) || filtersData.data.brands.items;
        const uniqueBrands = Array.from(new Map(allBrands.map((item: any) => [item._id, item])).values());

        return {
            ...filtersData.data,
            brands: {
                ...filtersData.data.brands,
                items: uniqueBrands,
                hasMore: hasNextPage
            }
        };
    }, [filtersData, brandsData, hasNextPage]);

    // Products Fetching
    const { data: productsResult, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['public-products', activeFilters],
        queryFn: () => PublicProductsService.getAll({
            ...activeFilters,
            brand: activeFilters.brand?.join(','),
            attributes: activeFilters.attributes ? JSON.stringify(activeFilters.attributes) : undefined
        }),
        placeholderData: (prev) => prev,
    });

    const handleFilterChange = (newFilters: any) => {
        const params: any = {};
        if (newFilters.category) params.category = newFilters.category;
        if (newFilters.subcategory) params.subcategory = newFilters.subcategory;
        if (newFilters.brand?.length) params.brand = newFilters.brand.join(',');
        if (newFilters.minPrice) params.minPrice = newFilters.minPrice;
        if (newFilters.maxPrice) params.maxPrice = newFilters.maxPrice;
        if (newFilters.attributes) params.attributes = JSON.stringify(newFilters.attributes);
        if (newFilters.sort) params.sort = newFilters.sort;
        if (newFilters.search) params.search = newFilters.search;

        params.page = '1';
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setSearchParams({});
    };

    const handleProductClick = (e: React.MouseEvent, product: Product) => {
        // Prevent default link behavior if we want to open modal
        e.preventDefault();
        setSelectedProduct(product);
        setIsModalOpen(true);
        // Update URL partially without navigation? No, keep it simple for now. 
        // User requested "modal" so they don't leave the page.
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (activeFilters.category) count++;
        if (activeFilters.subcategory) count++;
        if (activeFilters.brand?.length) count++;
        if (activeFilters.minPrice || activeFilters.maxPrice) count++;
        if (activeFilters.attributes) count += Object.keys(activeFilters.attributes).length;
        if (activeFilters.search) count++;
        return count;
    }, [activeFilters]);

    return (
        <PublicLayout fullWidth>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
                {/* Desktop Sidebar - Left */}
                <aside className="hidden md:flex flex-col w-72 lg:w-80 border-r border-muted/50 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex-1 overflow-y-auto py-6 px-6 no-scrollbar">
                        {!mergedFilters ? (
                            <SidebarSkeleton />
                        ) : (
                            <FilterSidebar
                                filters={mergedFilters}
                                activeFilters={activeFilters}
                                onFilterChange={handleFilterChange}
                                onClear={handleClearFilters}
                                onLoadMoreBrands={() => fetchNextPage()}
                                isLoadingBrands={isFetchingNextPage}
                            />
                        )}
                    </div>
                    <div className="p-4 bg-muted/5 border-t border-muted/20">
                        <Button
                            variant="outline"
                            className="w-full rounded-2xl font-bold opacity-60 hover:opacity-100"
                            onClick={handleClearFilters}
                            disabled={activeFilterCount === 0}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reiniciar filtros
                        </Button>
                    </div>
                </aside>

                {/* Main Content Area - Right */}
                <main className="flex-1 flex flex-col min-w-0 bg-muted/10 overflow-hidden">
                    <div className="h-20 flex items-center justify-between px-6 bg-background border-b border-muted/30 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl lg:text-2xl font-black tracking-tight flex items-center gap-3">
                                {t(traducciones, 'title')}
                                {activeFilterCount > 0 && (
                                    <Badge className="bg-primary/10 text-primary border-none font-black rounded-full px-3">
                                        {activeFilterCount} {activeFilterCount === 1 ? 'filtro' : 'filtros'}
                                    </Badge>
                                )}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select
                                value={activeFilters.sort}
                                onValueChange={(val) => handleFilterChange({ ...activeFilters, sort: val })}
                            >
                                <SelectTrigger className="w-[160px] lg:w-[200px] h-11 bg-muted/30 border-none rounded-2xl font-bold text-sm focus:ring-primary shadow-inner">
                                    <SelectValue placeholder={t(traducciones, 'sort')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                    <SelectItem className="rounded-xl" value="-createdAt">{t(traducciones, 'sortNewest')}</SelectItem>
                                    <SelectItem className="rounded-xl" value="price">{t(traducciones, 'sortPriceAsc')}</SelectItem>
                                    <SelectItem className="rounded-xl" value="-price">{t(traducciones, 'sortPriceDesc')}</SelectItem>
                                    <SelectItem className="rounded-xl" value="name">{t(traducciones, 'sortName')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="md:hidden h-11 rounded-2xl gap-2 border-primary/20 bg-primary/5 text-primary font-bold">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        {t(traducciones, 'filters')}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[85%] sm:w-[400px] p-0 border-none">
                                    <SheetHeader className="p-6 border-b">
                                        <SheetTitle className="text-2xl font-black">{t(traducciones, 'filters')}</SheetTitle>
                                    </SheetHeader>
                                    <div className="h-[calc(100vh-100px)] overflow-y-auto p-6">
                                        {!mergedFilters ? (
                                            <SidebarSkeleton />
                                        ) : (
                                            <FilterSidebar
                                                filters={mergedFilters}
                                                activeFilters={activeFilters}
                                                onFilterChange={(f) => {
                                                    handleFilterChange(f);
                                                    if (window.innerWidth < 768) setIsMobileFiltersOpen(false);
                                                }}
                                                onClear={handleClearFilters}
                                                onLoadMoreBrands={() => fetchNextPage()}
                                                isLoadingBrands={isFetchingNextPage}
                                            />
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                        {isLoadingProducts && !productsResult ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : !productsResult?.data?.products || productsResult.data.products.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                                    <ShoppingBag className="h-12 w-12 text-primary opacity-30" />
                                </div>
                                <h3 className="text-3xl font-black mb-3">{t(traducciones, 'noResults')}</h3>
                                <p className="text-muted-foreground mb-10 max-w-sm font-medium">
                                    No pudimos encontrar lo que buscas. Intenta cambiar los filtros o realizar una búsqueda diferente.
                                </p>
                                <Button onClick={handleClearFilters} variant="default" className="rounded-2xl px-10 h-14 text-lg font-black shadow-xl shadow-primary/20 transition-all">
                                    <RotateCcw className="h-5 w-5 mr-3" />
                                    {t(traducciones, 'clearFilters')}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-12 pb-20">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in zoom-in-95 duration-700">
                                    {productsResult.data.products.map((product: Product) => (
                                        <div key={product._id}>
                                            <ProductCard product={product} onClick={(e) => handleProductClick(e, product)} />
                                        </div>
                                    ))}
                                </div>

                                {productsResult.data.pagination && productsResult.data.pagination.totalPages > 1 && (
                                    <div className="flex flex-col items-center gap-6 pt-12 border-t border-muted/30">
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                            {t(traducciones, 'showing')
                                                .replace('{{count}}', productsResult.data.products.length.toString())
                                                .replace('{{total}}', productsResult.data.pagination.total.toString())}
                                        </p>
                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                disabled={activeFilters.page === 1}
                                                onClick={() => handleFilterChange({ ...activeFilters, page: activeFilters.page - 1 })}
                                                className="h-14 w-14 rounded-2xl border-none bg-background shadow-lg hover:shadow-xl active:scale-90 transition-all"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </Button>
                                            <div className="bg-primary text-primary-foreground rounded-2xl px-8 h-14 flex items-center font-black text-xl shadow-xl shadow-primary/20">
                                                {activeFilters.page}
                                            </div>
                                            <Button
                                                variant="outline"
                                                disabled={activeFilters.page >= productsResult.data.pagination.totalPages}
                                                onClick={() => handleFilterChange({ ...activeFilters, page: activeFilters.page + 1 })}
                                                className="h-14 w-14 rounded-2xl border-none bg-background shadow-lg hover:shadow-xl active:scale-90 transition-all"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Product Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl p-0 rounded-3xl overflow-hidden max-h-[95vh] flex flex-col">
                    {selectedProduct && (
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <ProductDetailContent product={selectedProduct} isModal={true} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
};
