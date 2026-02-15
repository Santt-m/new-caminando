import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader2 } from 'lucide-react';
import { AdminBrandsService } from '@/services/admin/brands.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionBrands } from './traduccion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import type { Brand, CreateBrandDto, UpdateBrandDto } from '@/types/ecommerce';

interface BrandFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    brand?: Brand | null;
}

// Helper to generate slug from name
const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[áàâã]/g, 'a')
        .replace(/[éèê]/g, 'e')
        .replace(/[íìî]/g, 'i')
        .replace(/[óòôõ]/g, 'o')
        .replace(/[úùû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const BrandFormModal = ({ isOpen, onClose, brand }: BrandFormModalProps) => {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [descriptionEs, setDescriptionEs] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [descriptionPt, setDescriptionPt] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [active, setActive] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Load brand data when editing
    useEffect(() => {
        if (brand) {
            setName(brand.name);
            setSlug(brand.slug);

            if (typeof brand.description === 'object' && brand.description !== null) {
                setDescriptionEs(brand.description.es || '');
                setDescriptionEn(brand.description.en || '');
                setDescriptionPt(brand.description.pt || '');
            } else {
                setDescriptionEs(brand.description || '');
                setDescriptionEn('');
                setDescriptionPt('');
            }

            setLogoUrl(brand.logoUrl || '');
            setActive(brand.active);
        } else {
            resetForm();
        }
    }, [brand]);

    const resetForm = () => {
        setName('');
        setSlug('');
        setDescriptionEs('');
        setDescriptionEn('');
        setDescriptionPt('');
        setLogoUrl('');
        setActive(true);
    };

    // Auto-generate slug from name
    useEffect(() => {
        if (!brand && name) {
            setSlug(generateSlug(name));
        }
    }, [name, brand]);

    const createMutation = useMutation({
        mutationFn: (data: CreateBrandDto) => AdminBrandsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
            toast.success(t(traduccionBrands, 'createSuccess'));
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al crear la marca');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) =>
            AdminBrandsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
            toast.success(t(traduccionBrands, 'updateSuccess'));
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al actualizar la marca');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            toast.error(t(traduccionBrands, 'nameRequired'));
            return;
        }

        if (name.trim().length < 2) {
            toast.error(t(traduccionBrands, 'nameMinLength'));
            return;
        }

        // Prepare description (multiidioma)
        const hasTranslations = descriptionEs || descriptionEn || descriptionPt;
        const description = hasTranslations
            ? {
                es: descriptionEs || '',
                en: descriptionEn || '',
                pt: descriptionPt || '',
            }
            : undefined;

        const formData: CreateBrandDto = {
            name: name.trim(),
            slug: slug.trim() || generateSlug(name),
            description,
            logoUrl: logoUrl || undefined,
            active,
        };

        if (brand) {
            updateMutation.mutate({ id: brand._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('El archivo debe ser una imagen');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar 5MB');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'brands_logos'); // Configure this in Cloudinary

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            setLogoUrl(data.secure_url);
            toast.success('Logo subido exitosamente');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error al subir el logo');
        } finally {
            setIsUploading(false);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {brand ? t(traduccionBrands, 'editBrand') : t(traduccionBrands, 'createBrand')}
                    </DialogTitle>
                    <DialogDescription>
                        {brand
                            ? 'Modifica los datos de la marca'
                            : 'Completa los datos para crear una nueva marca'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {t(traduccionBrands, 'name')} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t(traduccionBrands, 'namePlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">{t(traduccionBrands, 'slug')}</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(generateSlug(e.target.value))}
                                placeholder={t(traduccionBrands, 'slugPlaceholder')}
                            />
                            <p className="text-xs text-muted-foreground">
                                Se genera automáticamente desde el nombre
                            </p>
                        </div>
                    </div>

                    {/* Description (Multiidioma) */}
                    <div className="space-y-2">
                        <Label>{t(traduccionBrands, 'description')}</Label>
                        <Tabs defaultValue={language} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="es">Español</TabsTrigger>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="pt">Português</TabsTrigger>
                            </TabsList>
                            <TabsContent value="es" className="space-y-2">
                                <Textarea
                                    value={descriptionEs}
                                    onChange={(e) => setDescriptionEs(e.target.value)}
                                    placeholder={t(traduccionBrands, 'descriptionPlaceholder')}
                                    rows={3}
                                />
                            </TabsContent>
                            <TabsContent value="en" className="space-y-2">
                                <Textarea
                                    value={descriptionEn}
                                    onChange={(e) => setDescriptionEn(e.target.value)}
                                    placeholder="Optional brand description..."
                                    rows={3}
                                />
                            </TabsContent>
                            <TabsContent value="pt" className="space-y-2">
                                <Textarea
                                    value={descriptionPt}
                                    onChange={(e) => setDescriptionPt(e.target.value)}
                                    placeholder="Descrição opcional da marca..."
                                    rows={3}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <Label>{t(traduccionBrands, 'logo')}</Label>
                        <div className="flex items-center gap-4">
                            {logoUrl && (
                                <div className="relative">
                                    <img
                                        src={logoUrl}
                                        alt="Logo preview"
                                        className="h-20 w-20 rounded object-contain bg-muted border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={() => setLogoUrl('')}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex-1">
                                <Label
                                    htmlFor="logo-upload"
                                    className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Subiendo...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            {t(traduccionBrands, 'uploadLogo')}
                                        </>
                                    )}
                                </Label>
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                    disabled={isUploading}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Formatos: JPG, PNG, WEBP. Máximo 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="active"
                            checked={active}
                            onCheckedChange={setActive}
                        />
                        <Label htmlFor="active" className="cursor-pointer">
                            {t(traduccionBrands, 'active')}
                        </Label>
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            {t(traduccionBrands, 'cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t(traduccionBrands, 'saveBrand')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
