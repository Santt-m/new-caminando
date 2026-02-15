import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FolderOpen,
  ArrowLeft,
  Home
} from 'lucide-react';
import { API_BASE_URL } from '@/utils/api.config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UploadFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
  };
}

const FOLDERS = ['products', 'categories', 'users', 'banners'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const ImageUploader = () => {
  const navigate = useNavigate();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('products');
  const [isDragging, setIsDragging] = useState(false);

  const API_URL = API_BASE_URL;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Formato no soportado. Use JPEG, PNG, WebP o GIF';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Archivo demasiado grande. Máximo 10MB';
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        status: error ? 'error' : 'pending',
        progress: 0,
        error: error || undefined,
      });
    });

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFile = async (file: UploadFile, index: number) => {
    const formData = new FormData();
    formData.append('image', file.file);
    formData.append('folder', selectedFolder);

    try {
      // Update status to uploading
      setUploadFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], status: 'uploading', progress: 0 };
        return newFiles;
      });

      const token = localStorage.getItem('adminToken');

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], progress };
            return newFiles;
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setUploadFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = {
              ...newFiles[index],
              status: 'success',
              progress: 100,
              result: response.data
            };
            return newFiles;
          });
        } else {
          setUploadFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = {
              ...newFiles[index],
              status: 'error',
              error: 'Error al subir la imagen'
            };
            return newFiles;
          });
        }
      });

      xhr.addEventListener('error', () => {
        setUploadFiles(prev => {
          const newFiles = [...prev];
          newFiles[index] = {
            ...newFiles[index],
            status: 'error',
            error: 'Error de red'
          };
          return newFiles;
        });
      });

      xhr.open('POST', `${API_URL}/panel/cloudinary/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (err) {
      setUploadFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          status: 'error',
          error: err instanceof Error ? err.message : 'Error desconocido'
        };
        return newFiles;
      });
    }
  };

  const handleRetry = (index: number) => {
    const file = uploadFiles[index];
    uploadFile(file, index);
  };

  const uploadAll = async () => {
    const pendingFiles = uploadFiles
      .map((file, index) => ({ file, index }))
      .filter(({ file }) => file.status === 'pending');

    for (const { file, index } of pendingFiles) {
      await uploadFile(file, index);
    }
  };

  const clearCompleted = () => {
    setUploadFiles(prev => {
      const remaining = prev.filter(f => f.status !== 'success');
      const cleared = prev.filter(f => f.status === 'success');
      cleared.forEach(f => URL.revokeObjectURL(f.preview));
      return remaining;
    });
  };

  const stats = {
    total: uploadFiles.length,
    pending: uploadFiles.filter(f => f.status === 'pending').length,
    uploading: uploadFiles.filter(f => f.status === 'uploading').length,
    success: uploadFiles.filter(f => f.status === 'success').length,
    error: uploadFiles.filter(f => f.status === 'error').length,
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

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
        <span className="font-medium text-foreground">Subir Imágenes</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subir Imágenes</h1>
          <p className="text-muted-foreground mt-2">
            Arrastra y suelta imágenes o haz clic para seleccionar
          </p>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>Selecciona la carpeta de destino</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Carpeta:</label>
            <div className="flex items-center space-x-2 border rounded-md px-3 py-2 w-52">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              >
                {FOLDERS.map(folder => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="text-lg font-semibold mb-2">
              Arrastra y suelta tus imágenes aquí
            </h3>
            <p className="text-muted-foreground mb-4">
              o haz clic en el botón para seleccionar archivos
            </p>
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <Button onClick={() => document.getElementById('file-input')?.click()}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Seleccionar Imágenes
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos soportados: JPEG, PNG, WebP, GIF · Máximo 10MB por archivo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {uploadFiles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.uploading}</div>
              <p className="text-xs text-muted-foreground">Subiendo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <p className="text-xs text-muted-foreground">Exitosas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <p className="text-xs text-muted-foreground">Errores</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      {uploadFiles.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={uploadAll}
              disabled={stats.pending === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir {stats.pending > 0 ? `(${stats.pending})` : 'Todo'}
            </Button>
            {stats.success > 0 && (
              <Button
                variant="outline"
                onClick={clearCompleted}
              >
                Limpiar completados
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              uploadFiles.forEach(f => URL.revokeObjectURL(f.preview));
              setUploadFiles([]);
            }}
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Files List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archivos</CardTitle>
            <CardDescription>{uploadFiles.length} archivo(s) en cola</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  {/* Preview */}
                  <img
                    src={uploadFile.preview}
                    alt={uploadFile.file.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium truncate">{uploadFile.file.name}</p>
                      {uploadFile.status === 'pending' && (
                        <Badge variant="outline">Pendiente</Badge>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <Badge variant="secondary">Subiendo...</Badge>
                      )}
                      {uploadFile.status === 'success' && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200" variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completado
                        </Badge>
                      )}
                      {uploadFile.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {formatBytes(uploadFile.file.size)}
                    </p>

                    {uploadFile.error && (
                      <p className="text-sm text-red-600 mt-1">{uploadFile.error}</p>
                    )}

                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="mt-2" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {uploadFile.status === 'success' && uploadFile.result && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(uploadFile.result?.url, '_blank')}
                      >
                        Ver
                      </Button>
                    )}
                    {uploadFile.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(index)}
                      >
                        Reintentar
                      </Button>
                    )}
                    {uploadFile.status !== 'uploading' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Action */}
      {stats.success > 0 && stats.pending === 0 && stats.uploading === 0 && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    ¡Subida completada!
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {stats.success} imagen(es) subida(s) exitosamente
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/panel/database/cloudinary/gallery')}>
                Ver en Galería
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
