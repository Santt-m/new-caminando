import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminRedisService } from '@/services/admin/redis.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';

export const KeyExplorer = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [pattern, setPattern] = useState('*');
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const { data: keysData } = useQuery({
        queryKey: ['redis-keys', pattern],
        queryFn: () => AdminRedisService.getKeys(pattern),
        refetchInterval: 60000 // 1 minute
    });

    const { data: keyDetails } = useQuery({
        queryKey: ['redis-key', selectedKey],
        queryFn: () => AdminRedisService.getKey(selectedKey!),
        enabled: !!selectedKey
    });

    const deleteMutation = useMutation({
        mutationFn: (key: string) => AdminRedisService.deleteKey(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['redis-keys'] });
            setSelectedKey(null);
        }
    });

    const handleDelete = async (key: string) => {
        if (confirm(`Delete key "${key}"?`)) {
            await deleteMutation.mutateAsync(key);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/panel/database/redis')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{t(traducciones, 'title')}</h1>
                        <p className="text-muted-foreground">{keysData?.total.toLocaleString()} {t(traducciones, 'subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={t(traducciones, 'searchPlaceholder')}
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Keys List */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t(traducciones, 'sectionKeys')} ({keysData?.keys.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 max-h-[600px] overflow-y-auto">
                            {keysData?.keys.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedKey(key)}
                                    className={`w-full text-left p-2 rounded hover:bg-muted font-mono text-sm ${selectedKey === key ? 'bg-muted' : ''
                                        }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Key Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t(traducciones, 'sectionDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {keyDetails ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t(traducciones, 'labelKey')}</p>
                                    <p className="font-mono text-sm break-all">{keyDetails.key}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t(traducciones, 'labelType')}</p>
                                    <p className="font-medium">{keyDetails.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {t(traducciones, 'labelTTL')}
                                    </p>
                                    <p className="font-medium">
                                        {keyDetails.ttl === -1 ? t(traducciones, 'ttlNoExpiration') :
                                            keyDetails.ttl === -2 ? t(traducciones, 'ttlNotExists') :
                                                `${keyDetails.ttl} ${t(traducciones, 'ttlSeconds')}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t(traducciones, 'labelValue')}</p>
                                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
                                        {JSON.stringify(keyDetails.value, null, 2)}
                                    </pre>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(keyDetails.key)}
                                    className="w-full"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t(traducciones, 'buttonDelete')}
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-12">
                                {t(traducciones, 'selectKeyPrompt')}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
