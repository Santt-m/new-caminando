import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, Trash2, Upload, RefreshCw, HardDrive, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/useToast';
import { API_BASE_URL } from '@/utils/api.config';

interface CloudinaryImage {
  public_id: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: string;
}

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

export const CloudinaryDashboard = () => {
  const { language } = useLanguage();
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [stats, setStats] = useState<CloudinaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('products');

  const API_URL = API_BASE_URL;

  const translations = {
    es: {
      title: 'Administrador de Medios - Cloudinary',
      stats: 'Estadísticas',
      storage: 'Almacenamiento',
      images: 'Imágenes',
      requests: 'Solicitudes',
      folder: 'Carpeta',
      uploadImage: 'Subir Imagen',
      deleteImage: 'Eliminar',
      refresh: 'Actualizar',
      loading: 'Cargando...',
      noImages: 'No hay imágenes en esta carpeta',
      error: 'Error',
      success: 'Éxito',
      failedToLoad: 'Error al cargar imágenes',
      failedToDelete: 'Error al eliminar imagen',
      deleteConfirm: '¿Estás seguro de que deseas eliminar esta imagen?',
      uploading: 'Subiendo...',
      maxRequests: 'Máx. solicitudes/mes',
      usedStorage: 'Almacenamiento utilizado',
    },
    en: {
      title: 'Media Manager - Cloudinary',
      stats: 'Statistics',
      storage: 'Storage',
      images: 'Images',
      requests: 'Requests',
      folder: 'Folder',
      uploadImage: 'Upload Image',
      deleteImage: 'Delete',
      refresh: 'Refresh',
      loading: 'Loading...',
      noImages: 'No images in this folder',
      error: 'Error',
      success: 'Success',
      failedToLoad: 'Failed to load images',
      failedToDelete: 'Failed to delete image',
      deleteConfirm: 'Are you sure you want to delete this image?',
      uploading: 'Uploading...',
      maxRequests: 'Max requests/month',
      usedStorage: 'Used storage',
    },
    pt: {
      title: 'Gerenciador de Mídia - Cloudinary',
      stats: 'Estatísticas',
      storage: 'Armazenamento',
      images: 'Imagens',
      requests: 'Solicitações',
      folder: 'Pasta',
      uploadImage: 'Fazer Upload',
      deleteImage: 'Excluir',
      refresh: 'Actualizar',
      loading: 'Carregando...',
      noImages: 'Nenhuma imagen nesta pasta',
      error: 'Erro',
      success: 'Sucesso',
      failedToLoad: 'Falha ao carregar imagens',
      failedToDelete: 'Falha ao excluir imagem',
      deleteConfirm: 'Tem certeza de que deseja excluir esta imagem?',
      uploading: 'Enviando...',
      maxRequests: 'Máx. solicitações/mês',
      usedStorage: 'Armazenamento usado',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.es;
  const { showToast } = useToast();

  // Load images and stats
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load images
      const imagesRes = await fetch(
        `${API_URL}/panel/cloudinary/images?folder=${selectedFolder}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        }
      );

      if (!imagesRes.ok) throw new Error(t.failedToLoad);
      const imagesData = await imagesRes.json();
      setImages(imagesData.data || []);

      // Load stats
      const statsRes = await fetch(`${API_URL}/panel/cloudinary/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });

      if (!statsRes.ok) throw new Error('Failed to load stats');
      const statsData = await statsRes.json();
      setStats(statsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [API_URL, selectedFolder, t.failedToLoad]);

  useEffect(() => {
    loadData();
  }, [selectedFolder, loadData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', selectedFolder);

      const res = await fetch(`${API_URL}/panel/cloudinary/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      showToast({ message: t.success, type: 'success' });
      // Reload images
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      showToast({ message: msg, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId: string) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const res = await fetch(
        `${API_URL}/panel/cloudinary/images/${encodeURIComponent(publicId)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        }
      );

      if (!res.ok) throw new Error(t.failedToDelete);

      showToast({ message: t.success, type: 'success' });
      // Reload images
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.failedToDelete;
      setError(msg);
      showToast({ message: msg, type: 'error' });
    }
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.title}</h1>
          <p className="text-slate-600">Gestiona y organiza tus medios en la nube</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">{t.error}</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t.usedStorage}</h3>
                  <HardDrive className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">
                  {formatBytes(stats.storage.bytes_stored)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  / {formatBytes(stats.storage.max_bytes_allowed)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t.images}</h3>
                  <ImageIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">
                  {stats.objects_count}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t.maxRequests}</h3>
                  <RefreshCw className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">
                  {stats.requests.requests_this_month}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="products">Productos</SelectItem>
              <SelectItem value="categories">Categorías</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="temp">Temporal</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild variant="default" className="cursor-pointer">
            <label>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.uploading}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {t.uploadImage}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </Button>

          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">{t.loading}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 rounded-lg bg-white border border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">{t.noImages}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.public_id}
                className="rounded-lg overflow-hidden bg-white border border-slate-200 hover:shadow-lg transition"
              >
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={img.url}
                    alt={img.public_id}
                    className="w-full h-full object-cover hover:scale-110 transition"
                  />
                </div>
                <div className="p-2 border-t">
                  <p className="text-[10px] text-muted-foreground truncate mb-2">{img.public_id}</p>
                  <p className="text-[10px] text-muted-foreground mb-2 font-mono">
                    {img.width}x{img.height} • {formatBytes(img.bytes)}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full h-7 text-[10px] gap-1"
                    onClick={() => handleDeleteImage(img.public_id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    {t.deleteImage}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
