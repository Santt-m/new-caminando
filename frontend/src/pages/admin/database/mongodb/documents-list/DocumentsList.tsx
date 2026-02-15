import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminMongoDBService } from '@/services/admin/mongodb.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { SafetyConfirmationModal } from '@/components/admin/SafetyConfirmationModal';
import { traducciones } from './traduccion';

export const DocumentsList = () => {
    const { t } = useLanguage();
    const { collection } = useParams<{ collection: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['mongodb-documents', collection, page],
        queryFn: () => AdminMongoDBService.getDocuments(collection!, {
            limit,
            skip: (page - 1) * limit
        }),
        enabled: !!collection
    });

    const deleteMutation = useMutation({
        mutationFn: ({ docId, password }: { docId: string; password: string }) =>
            AdminMongoDBService.deleteDocument(collection!, docId, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mongodb-documents', collection] });
            setDeleteDocId(null);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Error deleting document');
        }
    });

    const handleDelete = async (docId: string) => {
        setDeleteDocId(docId);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">{t(traducciones, 'loading')}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/panel/database/mongodb')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{collection}</h1>
                        <p className="text-muted-foreground">
                            {data?.total.toLocaleString()} {t(traducciones, 'subtitle')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate(`/panel/database/mongodb/${collection}/indexes`)}>
                        {t(traducciones, 'buttonIndexes')}
                    </Button>
                    <Button onClick={() => navigate(`/panel/database/mongodb/${collection}/document/new`)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t(traducciones, 'buttonNewDocument')}
                    </Button>
                </div>
            </div>

            {/* Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {data?.documents.map((doc) => (
                            <div
                                key={String(doc._id)}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                            >
                                <div className="flex-1 font-mono text-sm overflow-hidden">
                                    <pre className="truncate">{JSON.stringify(doc, null, 2).substring(0, 200)}...</pre>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate(`/panel/database/mongodb/${collection}/document/${String(doc._id)}`)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(String(doc._id))}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-muted-foreground">
                            {t(traducciones, 'paginationPage')} {data?.page} {t(traducciones, 'paginationOf')} {data?.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === data?.totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmación de Borrado */}
            <SafetyConfirmationModal
                isOpen={!!deleteDocId}
                onClose={() => setDeleteDocId(null)}
                onConfirm={(password) => deleteDocId && deleteMutation.mutate({ docId: deleteDocId, password })}
                title={t(traducciones, 'deleteModalTitle')}
                description={t(traducciones, 'deleteModalDescription')}
                confirmValue="DELETE"
                confirmLabel={t(traducciones, 'deleteConfirmLabel').replace('{confirm}', 'DELETE')}
                confirmPlaceholder={t(traducciones, 'deletePlaceholder')}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
};
