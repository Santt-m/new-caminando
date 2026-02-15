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
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    Link2,
} from 'lucide-react';
import { AdminCategoriesService } from '@/services/admin/categories.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionCategories } from './traduccion';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryMappingModal } from './CategoryMappingModal';
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
import type { Category } from '@/types/ecommerce';

interface CategoryListProps {
    className?: string;
}

interface CategoryTreeItemProps {
    category: Category;
    level: number;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    onCreateSubcategory: (parentId: string) => void;
    onMapCategory: (category: Category) => void;
    subcategories: Category[];
}

const CategoryTreeItem = ({
    category,
    level,
    onEdit,
    onDelete,
    onCreateSubcategory,
    onMapCategory,
    subcategories,
}: CategoryTreeItemProps) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(true);
    const hasSubcategories = subcategories.length > 0;

    const getName = (name: any): string => {
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            return name.es || name.en || name.pt || '';
        }
        return '';
    };

    return (
        <>
            <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                        {hasSubcategories ? (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-muted rounded"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                        ) : (
                            <div className="w-6" />
                        )}
                        {isExpanded ? (
                            <FolderOpen className="h-4 w-4 text-primary" />
                        ) : (
                            <Folder className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-foreground">
                            {getName(category.name)}
                        </span>
                    </div>
                </td>
                <td className="py-3 px-4">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {category.slug}
                    </code>
                </td>
                <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                        {hasSubcategories ? subcategories.length : '-'}
                    </span>
                </td>
                <td className="py-3 px-4">
                    {category.active ? (
                        <Badge variant="success" className="h-5 px-1.5 text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {t(traduccionCategories, 'statusActive')}
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                            <XCircle className="mr-1 h-3 w-3" />
                            {t(traduccionCategories, 'statusInactive')}
                        </Badge>
                    )}
                </td>
                <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMapCategory(category)}
                            title="Mapear categoría"
                        >
                            <Link2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCreateSubcategory(category._id)}
                            title={t(traduccionCategories, 'createSubcategory')}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(category)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(category._id)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </td>
            </tr>

            {/* Render subcategories when expanded */}
            {isExpanded && hasSubcategories && subcategories.map((subcat) => (
                <CategoryTreeItem
                    key={subcat._id}
                    category={subcat}
                    level={level + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCreateSubcategory={onCreateSubcategory}
                    onMapCategory={onMapCategory}
                    subcategories={[]}
                />
            ))}
        </>
    );
};

export const CategoryList = ({ className }: CategoryListProps) => {
    const [search, setSearch] = useState('');
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
    const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
    const [mappingCategory, setMappingCategory] = useState<Category | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-categories', search],
        queryFn: () => AdminCategoriesService.getAll({
            search: search || undefined,
        }),
        placeholderData: (prev) => prev,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => AdminCategoriesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            toast.success(t(traduccionCategories, 'deleteSuccess'));
            setDeletingCategoryId(null);
        },
        onError: () => {
            toast.error('Error al eliminar la categoría');
        },
    });

    const handleCreate = () => {
        setEditingCategory(null);
        setParentCategoryId(null);
        setIsFormOpen(true);
    };

    const handleCreateSubcategory = (parentId: string) => {
        setEditingCategory(null);
        setParentCategoryId(parentId);
        setIsFormOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setParentCategoryId(null);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeletingCategoryId(id);
    };

    const handleMapCategory = (category: Category) => {
        setMappingCategory(category);
    };

    const confirmDelete = () => {
        if (deletingCategoryId) {
            deleteMutation.mutate(deletingCategoryId);
        }
    };

    // Organize categories into tree structure
    const rootCategories = data?.categories?.filter((cat: Category) => !cat.parentCategory) || [];
    const getSubcategories = (parentId: string) =>
        data?.categories?.filter((cat: Category) => cat.parentCategory === parentId) || [];

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t(traduccionCategories, 'title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t(traduccionCategories, 'subtitle')}
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t(traduccionCategories, 'createCategory')}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t(traduccionCategories, 'searchPlaceholder')}
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tree View */}
            <Card className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                                    {t(traduccionCategories, 'tableName')}
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                                    {t(traduccionCategories, 'tableSlug')}
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                                    {t(traduccionCategories, 'tableSubcategories')}
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                                    {t(traduccionCategories, 'tableStatus')}
                                </th>
                                <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                                    {t(traduccionCategories, 'tableActions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="text-muted-foreground">
                                                {t(traduccionCategories, 'loading')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rootCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                        {t(traduccionCategories, 'noCategories')}
                                    </td>
                                </tr>
                            ) : (
                                rootCategories.map((category: Category) => (
                                    <CategoryTreeItem
                                        key={category._id}
                                        category={category}
                                        level={0}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onCreateSubcategory={handleCreateSubcategory}
                                        onMapCategory={handleMapCategory}
                                        subcategories={getSubcategories(category._id)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Form Modal */}
            <CategoryFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingCategory(null);
                    setParentCategoryId(null);
                }}
                category={editingCategory}
                parentCategoryId={parentCategoryId}
                categories={data?.categories || []}
            />

            {/* Mapping Modal */}
            <CategoryMappingModal
                isOpen={!!mappingCategory}
                onClose={() => setMappingCategory(null)}
                category={mappingCategory}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingCategoryId} onOpenChange={() => setDeletingCategoryId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(traduccionCategories, 'deleteCategory')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(traduccionCategories, 'deleteConfirm')}
                            <br />
                            <span className="text-destructive font-medium">
                                {t(traduccionCategories, 'deleteWarning')}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t(traduccionCategories, 'cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t(traduccionCategories, 'deleteCategory')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
