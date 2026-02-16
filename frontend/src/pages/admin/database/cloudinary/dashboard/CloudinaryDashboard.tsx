import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  HardDrive,
  TrendingUp,
  Upload,
  FolderOpen,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Home,
  BarChart3,
  Clock,
  Folder
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cloudinaryService } from '@/services/adminMediaService';

interface CloudinaryStats {
  storage: {
    bytes_stored: number;
    max_bytes_allowed: number;
  };
  objects_count: number;
  requests: {
    active_requests: number;
    requests_this_month: number;
  };
}

interface FolderStats {
  name: string;
  count: number;
  bytes: number;
}

interface AnalyticsData {
  totalStats: {
    totalImages: number;
    totalBytes: number;
    formats: Record<string, number>;
    averageSize: number;
  };
  folderStats: Record<string, { count: number; bytes: number }>;
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

export const CloudinaryDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CloudinaryStats | null>(null);
  const [folders, setFolders] = useState<FolderStats[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel using cloudinaryService
      const [statsData, foldersData, analyticsData] = await Promise.all([
        cloudinaryService.getStats(),
        cloudinaryService.getFolders(),
        cloudinaryService.getAnalytics()
      ]);

      setStats(statsData);
      setFolders(foldersData || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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

  const storagePercentage = stats && stats.storage?.bytes_stored && stats.storage?.max_bytes_allowed
    ? Math.min((stats.storage.bytes_stored / stats.storage.max_bytes_allowed) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    const isConfigError = error.includes('no está configurado') || error.includes('variables de entorno');

    return (
      <div className="space-y-4">
        <Card className={`border-${isConfigError ? 'yellow' : 'red'}-200 bg-${isConfigError ? 'yellow' : 'red'}-50`}>
          <CardContent className="pt-6">
            <div className={`flex items-start space-x-3 text-${isConfigError ? 'yellow' : 'red'}-800`}>
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="font-semibold">{isConfigError ? 'Configuración Requerida' : 'Error al cargar estadísticas'}</p>
                <p className="text-sm">{error}</p>
                {isConfigError && (
                  <div className="mt-3 p-3 bg-white rounded-md border border-yellow-200">
                    <p className="text-xs font-mono text-gray-700">
                      # Agrega estas variables en <strong>backend/.env</strong>:<br />
                      CLOUDINARY_CLOUD_NAME=tu_cloud_name<br />
                      CLOUDINARY_API_KEY=tu_api_key<br />
                      CLOUDINARY_API_SECRET=tu_api_secret
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Obtén tus credenciales en: <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">cloudinary.com/console</a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {!isConfigError && (
          <Button onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/panel/database')}
          className="h-8 px-2"
        >
          <Home className="h-4 w-4 mr-1" />
          Base de Datos
        </Button>
        <span>/</span>
        <span className="font-medium text-foreground">Cloudinary</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cloudinary Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de imágenes y medios en la nube
          </p>
        </div>
        <Button onClick={loadStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-600">Cloudinary conectado</span>
        <Badge variant="outline" className="ml-2">En línea</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Almacenamiento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.storage?.bytes_stored ? formatBytes(stats.storage.bytes_stored) : '0 B'}
            </div>
            <p className="text-xs text-muted-foreground">
              de {stats?.storage?.max_bytes_allowed ? formatBytes(stats.storage.max_bytes_allowed) : '0 B'}
            </p>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {storagePercentage.toFixed(1)}% utilizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Imágenes</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.objects_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Archivos almacenados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes (Mes)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.requests.requests_this_month || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requests este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.requests.active_requests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En este momento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Operaciones comunes de gestión de imágenes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              onClick={() => navigate('/panel/database/cloudinary/upload')}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Imágenes
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/panel/database/cloudinary/gallery')}
              className="w-full"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Ver Galería
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/panel/database/cloudinary/optimizer')}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Optimizar Imágenes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Folders Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Carpetas</CardTitle>
          <CardDescription>Organización de imágenes por carpeta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {folders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay carpetas con imágenes aún</p>
                <p className="text-sm">Sube algunas imágenes para comenzar</p>
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/panel/database/cloudinary/gallery?folder=${folder.name}`)}
                >
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{folder.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {folder.count} archivos · {formatBytes(folder.bytes)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver →
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      {analytics && (
        <>
          {/* Recent Uploads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Imágenes Recientes</CardTitle>
                  <CardDescription>Últimas 10 imágenes subidas</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentUploads && analytics.recentUploads.length > 0 ? (
                  analytics.recentUploads.map((upload) => (
                    <div
                      key={upload.publicId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                          <img
                            src={upload.url}
                            alt={upload.publicId}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{upload.publicId.split('/').pop()}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(upload.createdAt)} · {formatBytes(upload.bytes)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground ml-2 shrink-0">
                        {upload.format?.toUpperCase()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay imágenes recientes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Largest Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Imágenes Más Grandes</CardTitle>
                  <CardDescription>Top 5 imágenes por tamaño</CardDescription>
                </div>
                <HardDrive className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.largestImages && analytics.largestImages.length > 0 ? (
                  analytics.largestImages.map((image, index) => (
                    <div
                      key={image.publicId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                          <img
                            src={image.url}
                            alt={image.publicId}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 w-5 h-5 bg-primary rounded-bl flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-foreground">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{image.publicId.split('/').pop()}</p>
                          <p className="text-sm text-muted-foreground">
                            {image.format?.toUpperCase()} · {image.width}x{image.height}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <p className="font-semibold">{formatBytes(image.bytes)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <HardDrive className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay datos disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Folder Distribution */}
          {analytics.folderStats && Object.keys(analytics.folderStats).length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Distribución por Carpeta</CardTitle>
                    <CardDescription>Imágenes organizadas por carpeta</CardDescription>
                  </div>
                  <Folder className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.folderStats)
                    .sort(([, a], [, b]) => b.count - a.count)
                    .slice(0, 5)
                    .map(([folder, stats]) => (
                      <div key={folder} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{folder || 'Root'}</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.count} archivos · {formatBytes(stats.bytes)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${(stats.count / analytics.totalStats.totalImages) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Format Distribution */}
          {analytics.totalStats?.formats &&
            Object.keys(analytics.totalStats.formats).length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Distribución por Formato</CardTitle>
                      <CardDescription>Tipos de archivo más utilizados</CardDescription>
                    </div>
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.totalStats.formats)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([format, count]) => (
                        <div key={format} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{format.toUpperCase()}</span>
                            <span className="text-sm text-muted-foreground">
                              {count as number} archivos ({Math.round(((count as number) / analytics.totalStats.totalImages) * 100)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{
                                width: `${((count as number) / analytics.totalStats.totalImages) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900 dark:text-blue-100">Sobre Cloudinary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>
            <strong>Cloudinary</strong> es un servicio en la nube para almacenamiento y optimización de medios.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Almacenamiento ilimitado de imágenes</li>
            <li>CDN global para entrega rápida</li>
            <li>Transformaciones automáticas (resize, crop, optimize)</li>
            <li>Formatos modernos (WebP, AVIF) automáticos</li>
            <li>Compresión inteligente sin pérdida de calidad</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
