import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Loader2,
    Plus,
    Pencil,
    Trash2,
    CheckCircle2,
    XCircle,
    Wrench,
} from 'lucide-react';
import { AdminBrandsService } from '@/services/admin/brands.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionBrands } from './traduccion';
import { BrandFormModal } from './BrandFormModal';
import { BrandExtractionModal } from './BrandExtractionModal';
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
import type { Brand } from '@/types/ecommerce';

interface BrandListProps {
    className?: string;
    limit?: number;
}

export const BrandList = ({ className, limit = 50 }: BrandListProps) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [extractingBrand, setExtractingBrand] = useState<Brand | null>(null);
    const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-brands', page, search, limit],
        queryFn: () => AdminBrandsService.getAll({
            page,
            search: search || undefined,
            limit
        }),
        placeholderData: (prev) => prev,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => AdminBrandsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
            toast.success(t(traduccionBrands, 'deleteSuccess'));
            setDeletingBrandId(null);
        },
        onError: () => {
            toast.error('Error al eliminar la marca');
        },
    });

    const handleCreate = () => {
        setEditingBrand(null);
        setIsFormOpen(true);
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeletingBrandId(id);
    };

    const confirmDelete = () => {
        if (deletingBrandId) {
            deleteMutation.mutate(deletingBrandId);
        }
    };

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t(traduccionBrands, 'title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t(traduccionBrands, 'subtitle')}
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t(traduccionBrands, 'createBrand')}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t(traduccionBrands, 'searchPlaceholder')}
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t(traduccionBrands, 'tableLogo')}</TableHead>
                            <TableHead>{t(traduccionBrands, 'tableName')}</TableHead>
                            <TableHead>{t(traduccionBrands, 'tableSlug')}</TableHead>
                            <TableHead>{t(traduccionBrands, 'tableStatus')}</TableHead>
                            <TableHead className="text-right">{t(traduccionBrands, 'tableActions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">
                                            {t(traduccionBrands, 'loading')}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.brands?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {t(traduccionBrands, 'noBrands')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.brands?.map((brand: Brand) => (
                                <TableRow key={brand._id}>
                                    <TableCell>
                                        {brand.logoUrl ? (
                                            <img
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                className="h-10 w-10 rounded object-contain bg-muted"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                Sin logo
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-foreground">
                                            {brand.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {brand.slug}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        {brand.active ? (
                                            <Badge variant="success" className="h-5 px-1.5 text-[10px]">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                {t(traduccionBrands, 'statusActive')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                                <XCircle className="mr-1 h-3 w-3" />
                                                {t(traduccionBrands, 'statusInactive')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setExtractingBrand(brand)}
                                                title="Extraer productos"
                                            >
                                                <Wrench className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(brand)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(brand._id)}
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
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        {t(traduccionBrands, 'previous')}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {t(traduccionBrands, 'pageInfo')
                            .replace('{{page}}', String(page))
                            .replace('{{total}}', String(data.pagination.totalPages))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page === data.pagination.totalPages}
                    >
                        {t(traduccionBrands, 'next')}
                    </Button>
                </div>
            )}

            {/* Form Modal */}
            <BrandFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingBrand(null);
                }}
                brand={editingBrand}
            />

            {/* Extraction Modal */}
            <BrandExtractionModal
                isOpen={!!extractingBrand}
                onClose={() => setExtractingBrand(null)}
                brand={extractingBrand}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingBrandId} onOpenChange={() => setDeletingBrandId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(traduccionBrands, 'deleteBrand')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(traduccionBrands, 'deleteConfirm')}
                            <br />
                            <span className="text-destructive font-medium">
                                {t(traduccionBrands, 'deleteWarning')}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t(traduccionBrands, 'cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t(traduccionBrands, 'deleteBrand')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
