import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Server, Activity, HardDrive, PieChart as PieChartIcon } from 'lucide-react';
import type { SystemMetrics } from "@/services/admin/system.service";
import { AdminSystemService } from "@/services/admin/system.service";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DatabaseHealthProps {
    data: SystemMetrics['database'];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export const DatabaseHealth = ({ data }: DatabaseHealthProps) => {
    // Fetch detailed MongoDB collections
    const { data: mongoCollections } = useQuery({
        queryKey: ['mongodb-collections'],
        queryFn: AdminSystemService.getMongoDBCollections,
        refetchInterval: 60000, // Refresh every minute
        enabled: data?.mongodb?.status === 'connected'
    });

    // Fetch Redis analysis
    const { data: redisAnalysis } = useQuery({
        queryKey: ['redis-analysis'],
        queryFn: AdminSystemService.getRedisAnalysis,
        refetchInterval: 60000,
        enabled: data?.redis?.status === 'connected'
    });

    if (!data) return null;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Prepare pie chart data (top 5 collections)
    const pieData = mongoCollections?.collections
        .slice(0, 5)
        .map(col => ({
            name: col.name,
            value: col.count
        })) || [];

    return (
        <div className="space-y-4">
            {/* MongoDB Stats */}
            <Card className="border-l-4 border-l-success">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col space-y-1">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Database className="h-4 w-4 text-success" />
                            MongoDB
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            <span className={cn(
                                "flex h-2 w-2 rounded-full",
                                data.mongodb.status === 'connected' ? "bg-success" : "bg-destructive"
                            )} />
                            {data.mongodb.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div className="space-y-1">
                            <p className="text-muted-foreground flex items-center gap-1">
                                <HardDrive className="h-3 w-3" /> Data Size
                            </p>
                            <p className="font-medium">{formatBytes(data.mongodb.dataSize)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Storage</p>
                            <p className="font-medium">{formatBytes(data.mongodb.storageSize)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Collections</p>
                            <p className="font-medium">{data.mongodb.collections}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Documents</p>
                            <p className="font-medium">{data.mongodb.objects.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Collection Distribution */}
                    {mongoCollections && mongoCollections.collections.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <PieChartIcon className="h-4 w-4" />
                                Distribución de Documentos
                            </div>

                            {/* Pie Chart */}
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Top Collections Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-2">Colección</th>
                                            <th className="text-right p-2">Docs</th>
                                            <th className="text-right p-2">Tamaño</th>
                                            <th className="text-right p-2">Índices</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mongoCollections.collections.slice(0, 5).map((col, idx) => (
                                            <tr key={col.name} className="border-t">
                                                <td className="p-2 flex items-center gap-1">
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    {col.name}
                                                </td>
                                                <td className="text-right p-2">{col.count.toLocaleString()}</td>
                                                <td className="text-right p-2">{formatBytes(col.totalSize)}</td>
                                                <td className="text-right p-2">{col.indexes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Redis Stats */}
            <Card className="border-l-4 border-l-destructive">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col space-y-1">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Server className="h-4 w-4 text-destructive" />
                            Global State & Distributed Cache
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            <span className={cn(
                                "flex h-2 w-2 rounded-full",
                                data.redis.status === 'connected' ? "bg-success" : "bg-destructive"
                            )} />
                            {data.redis.status === 'connected' ? 'Conectado' : 'Desconectado'}
                            <span className="text-xs ml-1 opacity-70">v{data.redis.version}</span>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div className="space-y-1">
                            <p className="text-muted-foreground flex items-center gap-1">
                                <Activity className="h-3 w-3" /> Memory
                            </p>
                            <p className="font-medium">{data.redis.usedMemory}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Clients</p>
                            <p className="font-medium">{data.redis.connectedClients}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Keys Cached</p>
                            <p className="font-medium">{data.redis.totalKeys.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Uptime</p>
                            <p className="font-medium">{data.redis.uptimeDays} days</p>
                        </div>
                    </div>

                    {/* Redis Analysis */}
                    {redisAnalysis && (
                        <div className="mt-6 space-y-3">
                            {/* Hit Rate & Critical Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Hit Rate (Eficiencia)</span>
                                    <span className={cn(
                                        "text-3xl font-bold italic",
                                        redisAnalysis.hitRate >= 0.8 ? "text-success" :
                                            redisAnalysis.hitRate >= 0.6 ? "text-warning" : "text-destructive"
                                    )}>
                                        {(redisAnalysis.hitRate * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/50">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Evicted Keys</span>
                                    <span className={cn(
                                        "text-3xl font-bold italic",
                                        redisAnalysis.evictedKeys === 0 ? "text-success" : "text-warning"
                                    )}>
                                        {redisAnalysis.evictedKeys}
                                    </span>
                                </div>
                            </div>

                            {/* Pattern Breakdown */}
                            {redisAnalysis.keysByPattern.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-2">Patrón</th>
                                                <th className="text-right p-2">Keys</th>
                                                <th className="text-right p-2">Memoria</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {redisAnalysis.keysByPattern.map((pattern) => (
                                                <tr key={pattern.pattern} className="border-t">
                                                    <td className="p-2 font-mono">{pattern.pattern}</td>
                                                    <td className="text-right p-2">{pattern.count.toLocaleString()}</td>
                                                    <td className="text-right p-2">{formatBytes(pattern.memoryUsage)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Alerts */}
                            {(redisAnalysis.evictedKeys > 0 || redisAnalysis.hitRate < 0.7) && (
                                <div className="space-y-2">
                                    {redisAnalysis.evictedKeys > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-warning">
                                            <span className="font-bold">⚠️</span>
                                            {redisAnalysis.evictedKeys} keys evicted
                                        </div>
                                    )}
                                    {redisAnalysis.hitRate < 0.7 && (
                                        <div className="flex items-center gap-2 text-xs text-destructive">
                                            <span className="font-bold">🔴</span>
                                            Hit rate bajo (&lt; 70%)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
