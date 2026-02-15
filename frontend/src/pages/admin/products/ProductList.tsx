import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Loader2,
    Plus,
    Pencil,
    Trash2,
    Eye,
    Star,
} from 'lucide-react';
import { AdminProductsService } from '@/services/admin/products.service';
import { AdminCategoriesService } from '@/services/admin/categories.service';
import { AdminBrandsService } from '@/services/admin/brands.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionProducts } from './traduccion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import type { Product } from '@/types/ecommerce';

interface ProductListProps {
    className?: string;
    limit?: number;
}

export const ProductList = ({ className, limit = 20 }: ProductListProps) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

    // Fetch products
    const { data, isLoading } = useQuery({
        queryKey: ['admin-products', page, search, categoryFilter, brandFilter, limit],
        queryFn: () => AdminProductsService.getAll({
            page,
            search: search || undefined,
            category: categoryFilter || undefined,
            brand: brandFilter || undefined,
            limit
        }),
        placeholderData: (prev) => prev,
    });

    // Fetch categories for filter
    const { data: categoriesData } = useQuery({
        queryKey: ['admin-categories-filter'],
        queryFn: () => AdminCategoriesService.getAll({}),
    });

    // Fetch brands for filter
    const { data: brandsData } = useQuery({
        queryKey: ['admin-brands-filter'],
        queryFn: () => AdminBrandsService.getAll({}),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => AdminProductsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast.success(t(traduccionProducts, 'deleteSuccess'));
            setDeletingProductId(null);
        },
        onError: () => {
            toast.error('Error al eliminar el producto');
        },
    });

    const handleCreate = () => {
        navigate('/panel/products/new');
    };

    const handleEdit = (id: string) => {
        navigate(`/panel/products/edit/${id}`);
    };

    const handleView = (id: string) => {
        navigate(`/panel/products/${id}`);
    };

    const handleDelete = (id: string) => {
        setDeletingProductId(id);
    };

    const confirmDelete = () => {
        if (deletingProductId) {
            deleteMutation.mutate(deletingProductId);
        }
    };

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
            currency: 'USD',
        }).format(price);
    };

    const getStockBadge = (stock: number) => {
        if (stock === 0) {
            return (
                <Badge variant="destructive" className="text-xs">
                    {t(traduccionProducts, 'statusOutOfStock')}
                </Badge>
            );
        } else if (stock < 10) {
            return (
                <Badge variant="warning" className="text-xs">
                    {t(traduccionProducts, 'statusLowStock')} ({stock})
                </Badge>
            );
        } else {
            return (
                <Badge variant="success" className="text-xs">
                    {t(traduccionProducts, 'statusInStock')} ({stock})
                </Badge>
            );
        }
    };

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t(traduccionProducts, 'title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t(traduccionProducts, 'subtitle')}
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t(traduccionProducts, 'createProduct')}
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t(traduccionProducts, 'searchPlaceholder')}
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <Select value={categoryFilter || 'all'} onValueChange={(value) => {
                    setCategoryFilter(value === 'all' ? '' : value);
                    setPage(1);
                }}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={t(traduccionProducts, 'filterByCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t(traduccionProducts, 'allCategories')}</SelectItem>
                        {categoriesData?.categories?.map((cat: any) => (
                            <SelectItem key={cat._id} value={cat._id}>
                                {getName(cat.name)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={brandFilter || 'all'} onValueChange={(value) => {
                    setBrandFilter(value === 'all' ? '' : value);
                    setPage(1);
                }}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={t(traduccionProducts, 'filterByBrand')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t(traduccionProducts, 'allBrands')}</SelectItem>
                        {brandsData?.brands?.map((brand: any) => (
                            <SelectItem key={brand._id} value={brand._id}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{t(traduccionProducts, 'tableImage')}</TableHead>
                            <TableHead>{t(traduccionProducts, 'tableName')}</TableHead>
                            <TableHead>{t(traduccionProducts, 'tableSKU')}</TableHead>
                            <TableHead>{t(traduccionProducts, 'tablePrice')}</TableHead>
                            <TableHead>{t(traduccionProducts, 'tableStock')}</TableHead>
                            <TableHead>{t(traduccionProducts, 'tableCategory')}</TableHead>
                            <TableHead className="text-right">{t(traduccionProducts, 'tableActions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">
                                            {t(traduccionProducts, 'loading')}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.products?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    {t(traduccionProducts, 'noProducts')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.products?.map((product: Product) => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={getName(product.name)}
                                                className="h-12 w-12 rounded object-cover bg-muted"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                Sin imagen
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">
                                                {getName(product.name)}
                                            </span>
                                            {product.featured && (
                                                <Badge variant="warning" className="w-fit mt-1 h-5 px-1.5 text-[10px]">
                                                    <Star className="mr-1 h-3 w-3 fill-current" />
                                                    {t(traduccionProducts, 'statusFeatured')}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {product.sku}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {product.discountPrice ? (
                                                <>
                                                    <span className="font-semibold text-foreground">
                                                        {formatPrice(product.discountPrice)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground line-through">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="font-semibold text-foreground">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStockBadge(product.stock)}
                                    </TableCell>
                                    <TableCell>
                                        {product.category && typeof product.category === 'object' ? (
                                            <span className="text-sm text-muted-foreground">
                                                {getName((product.category as any).name)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(product._id)}
                                                title={t(traduccionProducts, 'viewDetails')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(product._id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Pagination */}
            {data && data.pagination?.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {t(traduccionProducts, 'showing')
                            .replace('{{from}}', String((page - 1) * limit + 1))
                            .replace('{{to}}', String(Math.min(page * limit, data.pagination.total)))
                            .replace('{{total}}', String(data.pagination.total))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            {t(traduccionProducts, 'previous')}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {t(traduccionProducts, 'pageInfo')
                                .replace('{{page}}', String(page))
                                .replace('{{total}}', String(data.pagination.totalPages))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                            disabled={page === data.pagination.totalPages}
                        >
                            {t(traduccionProducts, 'next')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingProductId} onOpenChange={() => setDeletingProductId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(traduccionProducts, 'deleteProduct')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(traduccionProducts, 'deleteConfirm')}
                            <br />
                            <span className="text-destructive font-medium">
                                {t(traduccionProducts, 'deleteWarning')}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t(traduccionProducts, 'cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t(traduccionProducts, 'deleteProduct')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
