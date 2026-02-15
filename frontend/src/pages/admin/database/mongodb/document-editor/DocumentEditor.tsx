import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminMongoDBService } from '@/services/admin/mongodb.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';

export const DocumentEditor = () => {
    const { t } = useLanguage();
    const { collection, id } = useParams<{ collection: string; id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [jsonContent, setJsonContent] = useState('');
    const [error, setError] = useState('');

    const isNew = id === 'new';

    const { data: document } = useQuery({
        queryKey: ['mongodb-document', collection, id],
        queryFn: () => AdminMongoDBService.getDocument(collection!, id!),
        enabled: !!collection && !!id && !isNew
    });

    useEffect(() => {
        if (document && !jsonContent) {
            setJsonContent(JSON.stringify(document, null, 2));
        } else if (isNew && !jsonContent) {
            setJsonContent('{\n  \n}');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [document, isNew]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            try {
                const parsed = JSON.parse(jsonContent);
                if (isNew) {
                    return await AdminMongoDBService.createDocument(collection!, parsed);
                } else {
                    return await AdminMongoDBService.updateDocument(collection!, id!, parsed);
                }
            } catch {
                throw new Error('Invalid JSON');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mongodb-documents', collection] });
            navigate(`/panel/database/mongodb/${collection}`);
        },
        onError: (err: Error) => {
            setError(err.message || 'Failed to save document');
        }
    });

    const handleSave = () => {
        setError('');
        saveMutation.mutate();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(`/panel/database/mongodb/${collection}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isNew ? t(traducciones, 'titleNew') : t(traducciones, 'titleEdit')}
                        </h1>
                        <p className="text-muted-foreground">{collection}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {t(traducciones, 'buttonSave')}
                </Button>
            </div>

            {/* Editor */}
            <Card>
                <CardHeader>
                    <CardTitle>{t(traducciones, 'subtitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg">
                            {error}
                        </div>
                    )}
                    <textarea
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                        className="w-full h-[600px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        spellCheck={false}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        {t(traducciones, 'editorHelp')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
