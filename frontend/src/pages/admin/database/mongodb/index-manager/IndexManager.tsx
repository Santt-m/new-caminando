import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminMongoDBService } from '@/services/admin/mongodb.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';

export const IndexManager = () => {
    const { t } = useLanguage();
    const { collection } = useParams<{ collection: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [newIndexField, setNewIndexField] = useState('');
    const [newIndexOrder, setNewIndexOrder] = useState<1 | -1>(1);
    const [unique, setUnique] = useState(false);

    const { data: indexes, isLoading } = useQuery({
        queryKey: ['mongodb-indexes', collection],
        queryFn: () => AdminMongoDBService.getIndexes(collection!),
        enabled: !!collection
    });

    const createMutation = useMutation({
        mutationFn: () => AdminMongoDBService.createIndex(
            collection!,
            { [newIndexField]: newIndexOrder },
            { unique }
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mongodb-indexes', collection] });
            setShowCreate(false);
            setNewIndexField('');
            setUnique(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (indexName: string) => AdminMongoDBService.dropIndex(collection!, indexName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mongodb-indexes', collection] });
        }
    });

    const handleDelete = async (indexName: string) => {
        if (indexName === '_id_') {
            alert(t(traducciones, 'errorProtected'));
            return;
        }
        if (confirm(`${t(traducciones, 'confirmDelete')} "${indexName}"?`)) {
            await deleteMutation.mutateAsync(indexName);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">{t(traducciones, 'loading')}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(`/panel/database/mongodb/${collection}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{t(traducciones, 'title')}</h1>
                        <p className="text-muted-foreground">{collection}</p>
                    </div>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t(traducciones, 'buttonCreateIndex')}
                </Button>
            </div>

            {/* Create Index Form */}
            {showCreate && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t(traducciones, 'formTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">{t(traducciones, 'formFieldName')}</label>
                                <input
                                    type="text"
                                    value={newIndexField}
                                    onChange={(e) => setNewIndexField(e.target.value)}
                                    placeholder={t(traducciones, 'formFieldPlaceholder')}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">{t(traducciones, 'formFieldOrder')}</label>
                                <select
                                    value={newIndexOrder}
                                    onChange={(e) => setNewIndexOrder(Number(e.target.value) as 1 | -1)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value={1}>{t(traducciones, 'formOrderAsc')}</option>
                                    <option value={-1}>{t(traducciones, 'formOrderDesc')}</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="unique"
                                    checked={unique}
                                    onChange={(e) => setUnique(e.target.checked)}
                                />
                                <label htmlFor="unique" className="text-sm">{t(traducciones, 'formUnique')}</label>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => createMutation.mutate()} disabled={!newIndexField}>
                                    {t(traducciones, 'buttonCreate')}
                                </Button>
                                <Button variant="outline" onClick={() => setShowCreate(false)}>
                                    {t(traducciones, 'buttonCancel')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Indexes List */}
            <Card>
                <CardHeader>
                    <CardTitle>{t(traducciones, 'tableTitle')} ({indexes?.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {indexes?.map((index: any) => (
                            <div
                                key={index.name}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">{index.name}</p>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        {JSON.stringify(index.key)}
                                    </p>
                                    {index.unique && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mt-1 inline-block">
                                            {t(traducciones, 'badgeUnique')}
                                        </span>
                                    )}
                                </div>
                                {index.name !== '_id_' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(index.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
