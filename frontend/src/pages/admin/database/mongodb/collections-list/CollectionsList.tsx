import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminSystemService } from '@/services/admin/system.service';
import { AdminMongoDBService } from '@/services/admin/mongodb.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Search, FileJson, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { SafetyConfirmationModal } from '@/components/admin/SafetyConfirmationModal';
import { traducciones } from './traduccion';

export const CollectionsList = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteCollection, setDeleteCollection] = useState<string | null>(null);

    const { data: collections, isLoading } = useQuery({
        queryKey: ['mongodb-collections'],
        queryFn: AdminSystemService.getMongoDBCollections,
        refetchInterval: 120000 // 2 minutes
    });

    const deleteMutation = useMutation({
        mutationFn: ({ name, password }: { name: string; password: string }) =>
            AdminMongoDBService.deleteCollection(name, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mongodb-collections'] });
            setDeleteCollection(null);
            alert(t(traducciones, 'successDelete'));
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Error deleting collection');
        }
    });

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredCollections = collections?.collections.filter(col =>
        col.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">{t(traducciones, 'loading')}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Database className="h-8 w-8" />
                        {t(traducciones, 'title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {collections?.totalCollections} {t(traducciones, 'subtitle')} • {collections?.totalDocuments.toLocaleString()} {t(traducciones, 'subtitleDocuments')}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={t(traducciones, 'searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Collections Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{t(traducciones, 'subtitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="pb-3 font-medium">{t(traducciones, 'tableHeaderCollection')}</th>
                                    <th className="pb-3 font-medium text-right">{t(traducciones, 'tableHeaderDocuments')}</th>
                                    <th className="pb-3 font-medium text-right">{t(traducciones, 'tableHeaderSize')}</th>
                                    <th className="pb-3 font-medium text-right">{t(traducciones, 'tableHeaderAvgSize')}</th>
                                    <th className="pb-3 font-medium text-right">{t(traducciones, 'tableHeaderIndexes')}</th>
                                    <th className="pb-3 font-medium text-right">{t(traducciones, 'tableHeaderActions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCollections.map((collection) => (
                                    <tr key={collection.name} className="border-b hover:bg-muted/50">
                                        <td className="py-3">
                                            <button
                                                onClick={() => navigate(`/panel/database/mongodb/${collection.name}`)}
                                                className="flex items-center gap-2 text-primary hover:underline"
                                            >
                                                <FileJson className="h-4 w-4" />
                                                {collection.name}
                                            </button>
                                        </td>
                                        <td className="py-3 text-right">{collection.count.toLocaleString()}</td>
                                        <td className="py-3 text-right">{formatBytes(collection.totalSize)}</td>
                                        <td className="py-3 text-right">{formatBytes(collection.avgSize)}</td>
                                        <td className="py-3 text-right">
                                            <button
                                                onClick={() => navigate(`/panel/database/mongodb/${collection.name}/indexes`)}
                                                className="text-primary hover:underline"
                                            >
                                                {collection.indexes}
                                            </button>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/panel/database/mongodb/${collection.name}`)}
                                                >
                                                    {t(traducciones, 'buttonView')}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => setDeleteCollection(collection.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmación de Borrado */}
            <SafetyConfirmationModal
                isOpen={!!deleteCollection}
                onClose={() => setDeleteCollection(null)}
                onConfirm={(password) => deleteCollection && deleteMutation.mutate({ name: deleteCollection, password })}
                title={t(traducciones, 'deleteModalTitle')}
                description={t(traducciones, 'deleteModalDescription').replace('{name}', deleteCollection || '')}
                confirmValue={deleteCollection || ''}
                confirmLabel={t(traducciones, 'deleteConfirmLabel')}
                confirmPlaceholder={t(traducciones, 'deletePlaceholder')}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
};
