import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Image as ImageIcon,
  Trash2,
  Download,
  Search,
  Grid3x3,
  List,
  Eye,
  RefreshCw,
  FolderOpen,
  Calendar,
  HardDrive,
  CheckSquare,
  Square,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cloudinaryService } from '@/services/adminMediaService';

interface CloudinaryImage {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: string;
  folder?: string;
}

const FOLDERS = ['products', 'categories', 'users', 'banners'];

export const ImageGallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(searchParams.get('folder') || 'all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<CloudinaryImage | null>(null);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await cloudinaryService.listImages(selectedFolder !== 'all' ? selectedFolder : undefined, 100);
      setImages(data || []);
      setFilteredImages(data || []);
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  useEffect(() => {
    const filtered = images.filter(img => {
      const searchLower = searchQuery.toLowerCase();
      return img.public_id.toLowerCase().includes(searchLower) ||
        img.format.toLowerCase().includes(searchLower);
    });
    setFilteredImages(filtered);
  }, [searchQuery, images]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) return;

    try {
      await cloudinaryService.deleteImage(publicId);
      await loadImages();
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Error al eliminar la imagen');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    if (!confirm(`¿Eliminar ${selectedImages.size} imagen(es) seleccionada(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedImages).map(publicId => cloudinaryService.deleteImage(publicId)));
      setSelectedImages(new Set());
      await loadImages();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      alert('Error al eliminar algunas imágenes');
    }
  };

  const toggleImageSelection = (publicId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(publicId)) {
      newSelection.delete(publicId);
    } else {
      newSelection.add(publicId);
    }
    setSelectedImages(newSelection);
  };

  const selectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.public_id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Cargando galería...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/panel/database/cloudinary')}
          className="h-8 px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Cloudinary
        </Button>
        <span>/</span>
        <span className="font-medium text-foreground">
          Galería {selectedFolder !== 'all' && `- ${selectedFolder}`}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galería de Imágenes</h1>
          <p className="text-muted-foreground mt-2">
            {filteredImages.length} imágenes encontradas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate('/panel/database/cloudinary/upload')}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Subir Imágenes
          </Button>
          <Button onClick={loadImages} variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o formato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 border rounded-md px-3 py-2 w-48">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              >
                <option value="all">Todas las carpetas</option>
                {FOLDERS.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedImages.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedImages.size} imagen(es) seleccionada(s)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImages(new Set())}
                >
                  Deseleccionar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar seleccionadas
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
            >
              {selectedImages.size === filteredImages.length ? (
                <CheckSquare className="h-4 w-4 mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              {selectedImages.size === filteredImages.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay imágenes</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron imágenes en esta carpeta
              </p>
              <Button onClick={() => navigate('/panel/database/cloudinary/upload')}>
                Subir primera imagen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <Card
              key={image.public_id}
              className={`group cursor-pointer hover:shadow-lg transition-all ${selectedImages.has(image.public_id) ? 'ring-2 ring-primary' : ''
                }`}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={image.secure_url}
                    alt={image.public_id}
                    className="w-full h-full object-cover rounded-t-lg"
                  />

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPreviewImage(image)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(image.secure_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.public_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleImageSelection(image.public_id);
                    }}
                  >
                    {selectedImages.has(image.public_id) ? (
                      <CheckSquare className="h-5 w-5 text-primary bg-white rounded" />
                    ) : (
                      <Square className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium truncate">{image.public_id.split('/').pop()}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{image.width}×{image.height}</span>
                    <Badge variant="outline" className="text-xs">
                      {image.format.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatBytes(image.bytes)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredImages.map((image) => (
                <div
                  key={image.public_id}
                  className={`p-4 hover:bg-accent transition-colors flex items-center space-x-4 ${selectedImages.has(image.public_id) ? 'bg-accent' : ''
                    }`}
                >
                  <div
                    onClick={() => toggleImageSelection(image.public_id)}
                    className="cursor-pointer"
                  >
                    {selectedImages.has(image.public_id) ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <img
                    src={image.secure_url}
                    alt={image.public_id}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.public_id}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <HardDrive className="h-3 w-3 mr-1" />
                        {formatBytes(image.bytes)}
                      </span>
                      <span>{image.width}×{image.height}</span>
                      <Badge variant="outline" className="text-xs">
                        {image.format.toUpperCase()}
                      </Badge>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(image.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewImage(image)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(image.secure_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(image.public_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.public_id || 'Vista Previa'}</DialogTitle>
            <DialogDescription>
              {previewImage ? `${previewImage.width}×${previewImage.height} · ${formatBytes(previewImage.bytes)} · ${previewImage.format.toUpperCase()}` : ''}
            </DialogDescription>
          </DialogHeader>

          {previewImage && (
            <div className="space-y-4">
              <img
                src={previewImage.secure_url}
                alt={previewImage.public_id}
                className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
              />
              <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                <Button
                  variant="outline"
                  onClick={() => window.open(previewImage.secure_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(previewImage.public_id);
                    setPreviewImage(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
