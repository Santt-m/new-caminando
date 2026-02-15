import { useNavigate } from 'react-router-dom';
import { Database, Server, Activity, TrendingUp, AlertCircle, Trash2, AlertTriangle, Loader2, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminSystemService } from '@/services/admin/system.service';
import { useToast } from '@/hooks/useToast';
import { adminApi } from '@/services/admin/auth.service';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const DatabaseOverview = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['admin-system-metrics'],
    queryFn: AdminSystemService.getMetrics,
    refetchInterval: 60000 // 1 min
  });

  const isAllConnected = metrics?.database &&
    metrics.database.mongodb.status === 'connected' &&
    metrics.database.redis.status === 'connected' &&
    metrics.database.cloudinary.status === 'connected';

  const connectedCount = [
    metrics?.database?.mongodb.status === 'connected',
    metrics?.database?.redis.status === 'connected',
    metrics?.database?.cloudinary.status === 'connected'
  ].filter(Boolean).length;

  const handleReset = async () => {
    if (confirmText !== 'BORRAR TODO') return;

    setResetting(true);
    try {
      const response = await adminApi.delete('/seeds/reset');
      const data = response.data; // adminApi returns response object, data property holds the body (axios)
      // Actually adminApi is axios instance.
      // Backend returns { success: true, ... } wrapped in ok().
      // Let's check response structure. adminApi returns axios response.
      // response.data will comprise the JSON sent by backend.

      if (data.success) {
        toast.success(
          data.message || 'Base de datos restaurada',
          'Base de datos restaurada'
        );
        setModalOpen(false);
        setConfirmText('');
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error resetting database:', error);
      toast.error(
        error.response?.data?.message || 'No se pudo resetear la base de datos.',
        'Error'
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Infraestructura & Datos</h1>
        <p className="text-muted-foreground mt-2">
          Monitorización en tiempo real de servicios distribuidos y runtime serverless.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Críticos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}/3</div>
            <p className="text-xs text-muted-foreground">MongoDB, Redis y Cloudinary</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Global</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              isAllConnected ? "text-emerald-600" : "text-amber-600"
            )}>
              {isAllConnected ? "Operativo" : loadingMetrics ? "Sincronizando..." : "Atención Requerida"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAllConnected ? "Todos los servicios en línea" : "Verifica conexiones individuales"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latencia Runtime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.eventLoop?.lag ? `${metrics.eventLoop.lag.toFixed(2)}ms` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">Lag del Event Loop (Node.js)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso de Memoria</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.memory?.usagePercentage ? `${metrics.memory.usagePercentage.toFixed(1)}%` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">Carga del proceso actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Database Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* MongoDB Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>MongoDB</CardTitle>
                  <CardDescription>Base de datos principal</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  metrics?.database?.mongodb.status === 'connected' ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}></div>
                <span className={cn(
                  "text-xs font-medium",
                  metrics?.database?.mongodb.status === 'connected' ? "text-green-600" : "text-red-600"
                )}>
                  {metrics?.database?.mongodb.status === 'connected' ? "Conectada" : "Desconectada"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documentos:</span>
                <span className="font-medium">{metrics?.database?.mongodb.objects.toLocaleString() || '--'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Colecciones:</span>
                <span className="font-medium">{metrics?.database?.mongodb.collections || '--'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tamaño de Datos:</span>
                <span className="font-medium">
                  {metrics?.database?.mongodb.dataSize
                    ? `${(metrics.database.mongodb.dataSize / (1024 * 1024)).toFixed(2)} MB`
                    : '--'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Acciones</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Analizar colecciones e índices</li>
                <li>• Gestión CRUD de documentos</li>
                <li>• Monitorización de almacenamiento</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/panel/database/mongodb')}
              className="w-full"
              size="lg"
            >
              Administrar MongoDB
            </Button>
          </CardContent>
        </Card>

        {/* Redis Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Server className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Redis</CardTitle>
                  <CardDescription>Estado Global & Caché</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  metrics?.database?.redis.status === 'connected' ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}></div>
                <span className={cn(
                  "text-xs font-medium",
                  metrics?.database?.redis.status === 'connected' ? "text-green-600" : "text-red-600"
                )}>
                  {metrics?.database?.redis.status === 'connected' ? "Conectada" : "Desconectada"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Memoria en Uso:</span>
                <span className="font-medium">{metrics?.database?.redis.usedMemory || '--'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clientes Activos:</span>
                <span className="font-medium">{metrics?.database?.redis.connectedClients || '--'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Versión Engine:</span>
                <span className="font-medium">{metrics?.database?.redis.version || '--'}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Acciones</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Limpieza de caché (Flush)</li>
                <li>• Análisis de patrones de claves</li>
                <li>• Monitor de rendimiento</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/panel/database/redis')}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              Administrar Redis
            </Button>
          </CardContent>
        </Card>

        {/* Cloudinary Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cloud className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Cloudinary</CardTitle>
                  <CardDescription>Gestión de Medios</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  metrics?.database?.cloudinary.status === 'connected' ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}></div>
                <span className={cn(
                  "text-xs font-medium",
                  metrics?.database?.cloudinary.status === 'connected' ? "text-green-600" : "text-red-600"
                )}>
                  {metrics?.database?.cloudinary.status === 'connected' ? "Conectada" : "Desconectada"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">Cloud Storage - CDN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Formato:</span>
                <span className="font-medium">Optimización Automática</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entrega:</span>
                <span className="font-medium">Edge Computing (Vercel)</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Acciones</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Biblioteca de medios</li>
                <li>• Optimización de Assets</li>
                <li>• Transformaciones on-the-fly</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/panel/database/cloudinary')}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Administrar Cloudinary
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900 dark:text-blue-100">Información del Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-semibold min-w-30">MongoDB:</span>
              <span className="text-blue-800 dark:text-blue-200">
                Almacena usuarios, configuraciones, colecciones, sesiones y actividades de la plataforma.
                Permite realizar operaciones CRUD completas con soporte para agregaciones y consultas complejas.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-semibold min-w-30">Redis:</span>
              <span className="text-blue-800 dark:text-blue-200">
                Gestiona caché de datos, sesiones de usuarios y estados temporales.
                Proporciona acceso ultrarrápido con TTL automático para optimizar el rendimiento.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-semibold min-w-30">Cloudinary:</span>
              <span className="text-blue-800 dark:text-blue-200">
                Servicio en la nube para almacenamiento, optimización y transformación de imágenes.
                CDN global con formatos modernos (WebP, AVIF) y compresión inteligente.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-semibold min-w-30">Seguridad:</span>
              <span className="text-blue-800 dark:text-blue-200">
                Todos los servicios están protegidos con autenticación y solo son accesibles desde el servidor backend.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Operaciones comunes de administración</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/panel/database/mongodb')}
            >
              Ver Colecciones
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/panel/database/redis')}
            >
              Monitor Redis
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/panel/database/redis/keys')}
            >
              Explorar Claves
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/panel/database/cloudinary')}
            >
              Cloudinary
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/panel/database/cloudinary/upload')}
            >
              Subir Imágenes
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/panel/database/cloudinary/gallery')}
            >
              Ver Galería
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="flex flex-row items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <div className="flex flex-col">
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            <CardDescription className="text-destructive/80">Acciones destructivas e irreversibles</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-destructive">Restablecer Base de Datos</h4>
              <p className="text-sm text-destructive/80 mt-1">
                Esto eliminará PERMANENTEMENTE todos los datos de las colecciones dinámicas y configuraciones asociadas.
                Los usuarios Admin no serán eliminados.
              </p>
            </div>
            <Button
              variant="destructive"
              className="w-full md:w-auto shrink-0"
              onClick={() => {
                setModalOpen(true);
                setConfirmText('');
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Borrar Todo el Catálogo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md border-2 border-destructive/20">
          <DialogHeader>
            <div className="flex items-center gap-4 text-destructive mb-2">
              <AlertTriangle className="h-8 w-8" />
              <DialogTitle className="text-xl font-bold">¡Acción Destructiva!</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Estás a punto de eliminar todo el contenido dinámico del sistema (Colecciones y Configuraciones).
              <br /><br />
              Esta acción <strong>no se puede deshacer</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-destructive">
                Escribe "BORRAR TODO" para confirmar:
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="border-destructive/30 focus:ring-destructive focus:border-destructive"
                placeholder="BORRAR TODO"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={resetting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={confirmText !== 'BORRAR TODO' || resetting}
              className="gap-2"
            >
              {resetting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Borrado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
