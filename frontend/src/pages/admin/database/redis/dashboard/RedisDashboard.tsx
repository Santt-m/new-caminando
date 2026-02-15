import { useQuery } from '@tanstack/react-query';
import { AdminSystemService, AdminRedisService } from '@/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Activity, Database, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';

export const RedisDashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const { data: redisAnalysis } = useQuery({
        queryKey: ['redis-analysis'],
        queryFn: AdminSystemService.getRedisAnalysis,
        refetchInterval: 120000 // 2 minutes
    });

    const { data: slowLog } = useQuery({
        queryKey: ['redis-slowlog'],
        queryFn: () => AdminRedisService.getSlowLog(5),
        refetchInterval: 300000 // 5 minutes
    });

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Server className="h-8 w-8 text-destructive" />
                        {t(traducciones, 'title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t(traducciones, 'subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/panel/database/redis/keys')}>
                        {t(traducciones, 'buttonKeyExplorer')}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/panel/database/redis/tools')}>
                        {t(traducciones, 'buttonTools')}
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(traducciones, 'metricMemory')}</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {redisAnalysis ? formatBytes(redisAnalysis.totalMemory) : '...'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(traducciones, 'metricHitRate')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {redisAnalysis ? `${(redisAnalysis.hitRate * 100).toFixed(1)}%` : '...'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(traducciones, 'metricEvicted')}</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {redisAnalysis?.evictedKeys.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(traducciones, 'metricExpired')}</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {redisAnalysis?.expiredKeys.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Memory by Pattern */}
            {redisAnalysis && redisAnalysis.keysByPattern.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t(traducciones, 'sectionMemoryByPattern')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {redisAnalysis.keysByPattern.map((pattern) => (
                                <div key={pattern.pattern} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-mono text-sm">{pattern.pattern}</p>
                                        <p className="text-xs text-muted-foreground">{pattern.count} {t(traducciones, 'tableHeaderKeys')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatBytes(pattern.memoryUsage)}</p>
                                        {pattern.avgTTL > 0 && (
                                            <p className="text-xs text-muted-foreground">TTL: {pattern.avgTTL}s</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Slow Log */}
            {slowLog && slowLog.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t(traducciones, 'sectionSlowLog')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {slowLog.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-mono text-sm">{entry.command.join(' ')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(entry.timestamp * 1000).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-destructive">{entry.duration}μs</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
