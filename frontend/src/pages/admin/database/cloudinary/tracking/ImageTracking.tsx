import { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  TrendingUp,
  Eye,
  Download,
  AlertTriangle,
  Activity,
  Globe,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/utils/api.config';

interface GlobalStats {
  totalImages: number;
  totalRequests: number;
  uniqueIPs: number;
  blockedImages: number;
  activeImagesLastHour: number;
}

interface TopImage {
  publicId: string;
  url: string;
  views: number;
  downloads: number;
  proxyRequests: number;
  uniqueIPs: string[];
  lastAccessedAt: string;
  cacheHits: number;
  cacheMisses: number;
}

export const ImageTracking = () => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [topImages, setTopImages] = useState<TopImage[]>([]);
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week' | 'all'>('day');
  const [loading, setLoading] = useState(true);
  const API_URL = API_BASE_URL;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, topImagesRes] = await Promise.all([
        fetch(`${API_URL}/panel/cloudinary/proxy/stats`, {
          credentials: 'include'
        }),
        fetch(`${API_URL}/panel/cloudinary/proxy/top-images?timeframe=${timeframe}&limit=10`, {
          credentials: 'include'
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (topImagesRes.ok) {
        const topData = await topImagesRes.json();
        setTopImages(topData.data);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, [loadData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCacheHitRatio = (hits: number, misses: number) => {
    const total = hits + misses;
    if (total === 0) return 0;
    return Math.round((hits / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo en tiempo real de accesos a imágenes
          </p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <Activity className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['hour', 'day', 'week', 'all'] as const).map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe(tf)}
          >
            {tf === 'hour' && 'Última Hora'}
            {tf === 'day' && 'Último Día'}
            {tf === 'week' && 'Última Semana'}
            {tf === 'all' && 'Todo'}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imágenes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalImages || 0)}</div>
            <p className="text-xs text-muted-foreground">Siendo rastreadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalRequests || 0)}</div>
            <p className="text-xs text-muted-foreground">A través del proxy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Únicas</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.uniqueIPs || 0)}</div>
            <p className="text-xs text-muted-foreground">Visitantes diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas (1h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.activeImagesLastHour || 0)}</div>
            <p className="text-xs text-muted-foreground">Con actividad reciente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.blockedImages || 0}</div>
            <p className="text-xs text-muted-foreground">Por abuso</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Images */}
      <Card>
        <CardHeader>
          <CardTitle>Top Imágenes Más Accedidas</CardTitle>
          <CardDescription>
            Imágenes con más tráfico en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topImages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay datos de tracking disponibles</p>
              <p className="text-sm mt-1">Las imágenes comenzarán a aparecer cuando se acceda a través del proxy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topImages.map((image, index) => {
                const cacheRatio = getCacheHitRatio(image.cacheHits, image.cacheMisses);

                return (
                  <div
                    key={image.publicId}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    {/* Ranking */}
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">#{index + 1}</span>
                    </div>

                    {/* Image Preview */}
                    <div className="w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                      <img
                        src={image.url}
                        alt={image.publicId}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{image.publicId}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(image.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {formatNumber(image.downloads)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {formatNumber(image.proxyRequests)} requests
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {image.uniqueIPs.length} IPs
                        </span>
                      </div>
                    </div>

                    {/* Cache Stats */}
                    <div className="text-right shrink-0">
                      <Badge variant={cacheRatio >= 70 ? 'default' : cacheRatio >= 40 ? 'secondary' : 'destructive'}>
                        Cache {cacheRatio}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(image.lastAccessedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900 dark:text-blue-100">Sobre el Tracking</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>
            El sistema de tracking monitorea cada acceso a las imágenes a través del proxy,
            proporcionando métricas detalladas y protección contra abuso.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Rate limiting automático por IP</li>
            <li>Detección de patrones sospechosos</li>
            <li>Auto-bloqueo de IPs abusivas</li>
            <li>Cache inteligente con Redis</li>
            <li>Métricas en tiempo real</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
