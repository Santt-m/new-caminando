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
} from 'lucide-react';
import { AdminAttributesService } from '@/services/admin/attributes.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionAttributes } from './traduccion';
import { AttributeFormModal } from './AttributeFormModal';
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
import type { AttributeDefinition } from '@/types/ecommerce';

interface AttributeListProps {
    className?: string;
    limit?: number;
}

export const AttributeList = ({ className, limit = 50 }: AttributeListProps) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<AttributeDefinition | null>(null);
    const [deletingAttributeId, setDeletingAttributeId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-attributes', page, search, limit],
        queryFn: () => AdminAttributesService.getAll({
            page,
            search: search || undefined,
            limit
        }),
        placeholderData: (prev) => prev,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => AdminAttributesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            toast.success(t(traduccionAttributes, 'deleteSuccess'));
            setDeletingAttributeId(null);
        },
        onError: () => {
            toast.error('Error al eliminar el atributo');
        },
    });

    const handleCreate = () => {
        setEditingAttribute(null);
        setIsFormOpen(true);
    };

    const handleEdit = (attribute: AttributeDefinition) => {
        setEditingAttribute(attribute);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeletingAttributeId(id);
    };

    const confirmDelete = () => {
        if (deletingAttributeId) {
            deleteMutation.mutate(deletingAttributeId);
        }
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            select: 'default',
            text: 'secondary',
            number: 'outline',
        };
        return variants[type] || 'secondary';
    };

    const getTypeName = (name: any): string => {
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            return name.es || name.en || name.pt || '';
        }
        return '';
    };

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t(traduccionAttributes, 'title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t(traduccionAttributes, 'subtitle')}
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t(traduccionAttributes, 'createAttribute')}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t(traduccionAttributes, 'searchPlaceholder')}
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
                            <TableHead>{t(traduccionAttributes, 'tableName')}</TableHead>
                            <TableHead>{t(traduccionAttributes, 'tableKey')}</TableHead>
                            <TableHead>{t(traduccionAttributes, 'tableType')}</TableHead>
                            <TableHead>{t(traduccionAttributes, 'tableValues')}</TableHead>
                            <TableHead>{t(traduccionAttributes, 'tableStatus')}</TableHead>
                            <TableHead className="text-right">{t(traduccionAttributes, 'tableActions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">
                                            {t(traduccionAttributes, 'loading')}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.attributes?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t(traduccionAttributes, 'noAttributes')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.attributes?.map((attribute: AttributeDefinition) => (
                                <TableRow key={attribute._id}>
                                    <TableCell>
                                        <span className="font-medium text-foreground">
                                            {getTypeName(attribute.name)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {attribute.key}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getTypeBadge(attribute.type)} className="text-xs">
                                            {t(traduccionAttributes, `type${attribute.type.charAt(0).toUpperCase() + attribute.type.slice(1)}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {attribute.type === 'select' && attribute.values ? (
                                            <div className="flex gap-1 flex-wrap max-w-xs">
                                                {attribute.values.slice(0, 3).map((val, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {val}
                                                    </Badge>
                                                ))}
                                                {attribute.values.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{attribute.values.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : attribute.type === 'number' && attribute.unit ? (
                                            <span className="text-xs text-muted-foreground">
                                                Unidad: {attribute.unit}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {attribute.active ? (
                                            <Badge variant="success" className="h-5 px-1.5 text-[10px]">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                {t(traduccionAttributes, 'statusActive')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                                <XCircle className="mr-1 h-3 w-3" />
                                                {t(traduccionAttributes, 'statusInactive')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(attribute)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(attribute._id)}
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
                        {t(traduccionAttributes, 'previous')}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {t(traduccionAttributes, 'pageInfo')
                            .replace('{{page}}', String(page))
                            .replace('{{total}}', String(data.pagination.totalPages))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page === data.pagination.totalPages}
                    >
                        {t(traduccionAttributes, 'next')}
                    </Button>
                </div>
            )}

            {/* Form Modal */}
            <AttributeFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingAttribute(null);
                }}
                attribute={editingAttribute}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingAttributeId} onOpenChange={() => setDeletingAttributeId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t(traduccionAttributes, 'deleteAttribute')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(traduccionAttributes, 'deleteConfirm')}
                            <br />
                            <span className="text-destructive font-medium">
                                {t(traduccionAttributes, 'deleteWarning')}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t(traduccionAttributes, 'cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t(traduccionAttributes, 'deleteAttribute')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
