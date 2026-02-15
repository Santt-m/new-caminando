import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Zap,
  Settings,
  Image as ImageIcon,
  Info,
  Home
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransformOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  params: {
    name: string;
    label: string;
    type: 'number' | 'select';
    options?: { value: string; label: string }[];
    default?: string | number;
    min?: number;
    max?: number;
  }[];
}

const TRANSFORMATIONS: TransformOption[] = [
  {
    id: 'resize',
    name: 'Redimensionar',
    description: 'Cambia el tamaño de la imagen manteniendo la proporción',
    icon: ImageIcon,
    params: [
      { name: 'width', label: 'Ancho (px)', type: 'number', default: 800, min: 50, max: 4000 },
      { name: 'height', label: 'Alto (px)', type: 'number', default: 600, min: 50, max: 4000 },
      {
        name: 'crop',
        label: 'Modo de recorte',
        type: 'select',
        default: 'limit',
        options: [
          { value: 'limit', label: 'Limitar (mantener proporciones)' },
          { value: 'fill', label: 'Rellenar' },
          { value: 'fit', label: 'Ajustar' },
          { value: 'crop', label: 'Recortar' },
        ],
      },
    ],
  },
  {
    id: 'quality',
    name: 'Optimizar Calidad',
    description: 'Ajusta la calidad y compresión de la imagen',
    icon: Zap,
    params: [
      { 
        name: 'quality', 
        label: 'Calidad (%)', 
        type: 'number', 
        default: 80, 
        min: 1, 
        max: 100 
      },
      {
        name: 'format',
        label: 'Formato',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Automático (WebP/AVIF)' },
          { value: 'jpg', label: 'JPEG' },
          { value: 'png', label: 'PNG' },
          { value: 'webp', label: 'WebP' },
        ],
      },
    ],
  },
  {
    id: 'effects',
    name: 'Efectos',
    description: 'Aplica efectos visuales a la imagen',
    icon: Settings,
    params: [
      {
        name: 'effect',
        label: 'Efecto',
        type: 'select',
        default: 'none',
        options: [
          { value: 'none', label: 'Sin efecto' },
          { value: 'grayscale', label: 'Escala de grises' },
          { value: 'sepia', label: 'Sepia' },
          { value: 'blur', label: 'Desenfoque' },
          { value: 'sharpen', label: 'Enfocar' },
        ],
      },
      {
        name: 'intensity',
        label: 'Intensidad',
        type: 'number',
        default: 50,
        min: 0,
        max: 100,
      },
    ],
  },
];

export const ImageOptimizer = () => {
  const navigate = useNavigate();
  const [selectedTransform, setSelectedTransform] = useState<string>(TRANSFORMATIONS[0].id);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalUrl, setOriginalUrl] = useState<string>('');

  const currentTransform = TRANSFORMATIONS.find(t => t.id === selectedTransform);

  const generateTransformUrl = () => {
    if (!originalUrl) return;

    // Esta es una versión simplificada
    // En producción, construirías la URL de Cloudinary con las transformaciones
    const params = new URLSearchParams();
    
    // Aquí irían las transformaciones de Cloudinary
    // Ejemplo: w_800,h_600,c_limit,q_auto,f_auto
    
    setPreviewUrl(originalUrl + '?' + params.toString());
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
        <span className="font-medium text-foreground">Optimizador</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Optimizador de Imágenes</h1>
        <p className="text-muted-foreground mt-2">
          Transforma y optimiza imágenes con Cloudinary
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900 dark:text-blue-100">Transformaciones Automáticas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200">
          <p className="mb-2">
            Las imágenes subidas a Cloudinary se optimizan automáticamente con:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Límite de tamaño:</strong> máximo 1000x1000px</li>
            <li><strong>Calidad automática:</strong> compresión inteligente</li>
            <li><strong>Formato automático:</strong> WebP/AVIF para navegadores compatibles</li>
            <li><strong>CDN global:</strong> entrega rápida desde servidores cercanos</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transformations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecciona una transformación</CardTitle>
              <CardDescription>
                Elige el tipo de optimización que deseas aplicar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {TRANSFORMATIONS.map((transform) => {
                const Icon = transform.icon;
                const isSelected = selectedTransform === transform.id;
                
                return (
                  <div
                    key={transform.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTransform(transform.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{transform.name}</h4>
                          {isSelected && (
                            <Badge>Seleccionado</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transform.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Parameters */}
          {currentTransform && (
            <Card>
              <CardHeader>
                <CardTitle>Parámetros</CardTitle>
                <CardDescription>
                  Configura los valores para {currentTransform.name.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentTransform.params.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name}>{param.label}</Label>
                    {param.type === 'number' ? (
                      <Input
                        id={param.name}
                        type="number"
                        defaultValue={param.default}
                        min={param.min}
                        max={param.max}
                      />
                    ) : (
                      <select
                        id={param.name}
                        defaultValue={param.default}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {param.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* URL Builder */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Constructor de URL</CardTitle>
              <CardDescription>
                Genera URLs optimizadas para tus imágenes de Cloudinary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="original-url">URL de imagen original</Label>
                <Input
                  id="original-url"
                  placeholder="https://res.cloudinary.com/..."
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Pega una URL de Cloudinary existente
                </p>
              </div>

              <Button onClick={generateTransformUrl} className="w-full">
                Generar URL Optimizada
              </Button>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>URL generada</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <code className="text-xs break-all">{previewUrl}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(previewUrl);
                      alert('URL copiada al portapapeles');
                    }}
                  >
                    Copiar URL
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Ejemplos de transformaciones</CardTitle>
              <CardDescription>
                Cloudinary soporta transformaciones en la URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Redimensionar a 500x500:</p>
                <code className="text-xs bg-muted p-2 rounded block">
                  /w_500,h_500,c_limit/imagen.jpg
                </code>
              </div>
              <div>
                <p className="font-medium mb-1">Calidad automática + WebP:</p>
                <code className="text-xs bg-muted p-2 rounded block">
                  /q_auto,f_auto/imagen.jpg
                </code>
              </div>
              <div>
                <p className="font-medium mb-1">Escala de grises:</p>
                <code className="text-xs bg-muted p-2 rounded block">
                  /e_grayscale/imagen.jpg
                </code>
              </div>
              <div>
                <p className="font-medium mb-1">Combinación múltiple:</p>
                <code className="text-xs bg-muted p-2 rounded block">
                  /w_800,h_600,c_fill,q_auto,f_auto/imagen.jpg
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/panel/database/cloudinary/gallery')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Ver todas las imágenes
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/panel/database/cloudinary/upload')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Subir nueva imagen
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://cloudinary.com/documentation/image_transformations', '_blank')}
              >
                <Info className="h-4 w-4 mr-2" />
                Ver documentación completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
