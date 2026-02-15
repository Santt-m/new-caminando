import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Home,
    ArrowLeft,
    TrendingUp,
    Image as ImageIcon,
    Folder,
    FolderOpen,
    Activity,
    BarChart3,
    Clock
} from 'lucide-react';
import { API_BASE_URL } from '@/utils/api.config';

interface AnalyticsData {
    totalStats: {
        totalImages: number;
        totalBytes: number;
        formats: Record<string, number>;
        averageSize: number;
    };
    folderStats: {
        name: string;
        count: number;
        bytes: number;
    }[];
    recentUploads: {
        publicId: string;
        url: string;
        folder: string;
        format: string;
        bytes: number;
        width: number;
        height: number;
        createdAt: string;
    }[];
    largestImages: {
        publicId: string;
        url: string;
        folder: string;
        format: string;
        bytes: number;
        width: number;
        height: number;
    }[];
}

export default function CloudinaryAnalytics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = API_BASE_URL;
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const response = await fetch(`${API_URL}/panel/cloudinary/metrics/analytics`, { headers });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cargar analytics');
            }

            setAnalytics(data.data);
        } catch (err) {
            console.error('Error loading analytics:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar las métricas');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics</h1>
                        <p className="text-muted-foreground">Estadísticas de uso de imágenes</p>
                    </div>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Cargando métricas...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={loadAnalytics}>Reintentar</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con Breadcrumbs */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link to="/panel" className="hover:text-foreground transition-colors">
                        <Home className="h-4 w-4" />
                    </Link>
                    <span>/</span>
                    <Link to="/panel/database" className="hover:text-foreground transition-colors">
                        Database
                    </Link>
                    <span>/</span>
                    <Link to="/panel/database/cloudinary" className="hover:text-foreground transition-colors">
                        Cloudinary
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Analytics</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-8 w-8 text-primary" />
                            Analytics
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Estadísticas detalladas de uso de imágenes
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.location.href = '/panel/database/cloudinary'}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                        <Button onClick={loadAnalytics}>
                            Actualizar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overall Stats */}
            {analytics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Imágenes</CardTitle>
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalStats.totalImages}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatBytes(analytics.totalStats.totalBytes)} en total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tamaño Promedio</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatBytes(analytics.totalStats.averageSize)}</div>
                            <p className="text-xs text-muted-foreground">
                                Por imagen
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Formatos</CardTitle>
                            <Folder className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(analytics.totalStats.formats).length}</div>
                            <p className="text-xs text-muted-foreground">
                                {Object.entries(analytics.totalStats.formats).map(([format, count]) => (
                                    `${format.toUpperCase()}: ${count}`
                                )).join(', ').substring(0, 30)}...
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Carpetas</CardTitle>
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.folderStats.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Organizadas
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Top Images */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top by Size */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Top 5 - Más Grandes
                        </CardTitle>
                        <CardDescription>Imágenes que ocupan más espacio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!analytics || analytics.largestImages.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No hay datos aún
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {analytics.largestImages.map((img, index) => (
                                    <div key={img.publicId} className="flex items-center gap-3">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {index + 1}
                                        </div>
                                        <img
                                            src={img.url}
                                            alt={img.publicId}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {img.publicId.split('/').pop()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {img.folder || 'Sin carpeta'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{formatBytes(img.bytes)}</div>
                                            <div className="text-xs text-muted-foreground">{img.width}x{img.height}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Uploads */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Subidas Recientes
                        </CardTitle>
                        <CardDescription>Últimas 5 imágenes cargadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!analytics || analytics.recentUploads.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No hay datos aún
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {analytics.recentUploads.slice(0, 5).map((img) => (
                                    <div key={img.publicId} className="flex items-center gap-3">
                                        <img
                                            src={img.url}
                                            alt={img.publicId}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {img.publicId.split('/').pop()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {img.folder || 'Sin carpeta'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(img.createdAt)}
                                            </div>
                                            <Badge variant="outline">{img.format.toUpperCase()}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Folder Stats */}
            {analytics && analytics.folderStats.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Folder className="h-5 w-5" />
                            Estadísticas por Carpeta
                        </CardTitle>
                        <CardDescription>Métricas agrupadas por carpeta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.folderStats.map((folder) => (
                                <div key={folder.name} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <Folder className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{folder.name || 'Sin carpeta'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {folder.count} imágenes • {formatBytes(folder.bytes)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Formato Distribution */}
            {analytics && Object.keys(analytics.totalStats.formats).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Distribución de Formatos
                        </CardTitle>
                        <CardDescription>Tipos de archivo en Cloudinary</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(analytics.totalStats.formats)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .map(([format, count]) => (
                                    <div key={format} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{format.toUpperCase()}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {count} imagen{count !== 1 ? 'es' : ''}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
