import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader2 } from 'lucide-react';
import { AdminCategoriesService } from '@/services/admin/categories.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionCategories } from './traduccion';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/ecommerce';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category | null;
    parentCategoryId?: string | null;
    categories: Category[];
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

export const CategoryFormModal = ({
    isOpen,
    onClose,
    category,
    parentCategoryId,
    categories,
}: CategoryFormModalProps) => {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();

    // Form state
    const [nameEs, setNameEs] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [namePt, setNamePt] = useState('');
    const [slug, setSlug] = useState('');
    const [descriptionEs, setDescriptionEs] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [descriptionPt, setDescriptionPt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [parentCategory, setParentCategory] = useState<string>('');
    const [order, setOrder] = useState(0);
    const [active, setActive] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Load category data when editing
    useEffect(() => {
        if (category) {
            // Load name
            if (typeof category.name === 'object' && category.name !== null) {
                setNameEs(category.name.es || '');
                setNameEn(category.name.en || '');
                setNamePt(category.name.pt || '');
            } else {
                setNameEs(category.name || '');
                setNameEn('');
                setNamePt('');
            }

            setSlug(category.slug);

            // Load description
            if (typeof category.description === 'object' && category.description !== null) {
                setDescriptionEs(category.description.es || '');
                setDescriptionEn(category.description.en || '');
                setDescriptionPt(category.description.pt || '');
            } else {
                setDescriptionEs(category.description || '');
                setDescriptionEn('');
                setDescriptionPt('');
            }

            setImageUrl(category.imageUrl || '');
            setParentCategory(category.parentCategory || '');
            setOrder(category.order || 0);
            setActive(category.active);
        } else {
            resetForm();
            // If creating a subcategory, set parent
            if (parentCategoryId) {
                setParentCategory(parentCategoryId);
            }
        }
    }, [category, parentCategoryId]);

    const resetForm = () => {
        setNameEs('');
        setNameEn('');
        setNamePt('');
        setSlug('');
        setDescriptionEs('');
        setDescriptionEn('');
        setDescriptionPt('');
        setImageUrl('');
        setParentCategory('');
        setOrder(0);
        setActive(true);
    };

    // Auto-generate slug from spanish name
    useEffect(() => {
        if (!category && nameEs) {
            setSlug(generateSlug(nameEs));
        }
    }, [nameEs, category]);

    const createMutation = useMutation({
        mutationFn: (data: CreateCategoryDto) => AdminCategoriesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            toast.success(t(traduccionCategories, 'createSuccess'));
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al crear la categoría');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
            AdminCategoriesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            toast.success(t(traduccionCategories, 'updateSuccess'));
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al actualizar la categoría');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!nameEs.trim() && !nameEn.trim() && !namePt.trim()) {
            toast.error(t(traduccionCategories, 'nameRequired'));
            return;
        }

        // Prepare name (multiidioma)
        const name = {
            es: nameEs.trim() || '',
            en: nameEn.trim() || '',
            pt: namePt.trim() || '',
        };

        // Prepare description (multiidioma)
        const hasDescriptions = descriptionEs || descriptionEn || descriptionPt;
        const description = hasDescriptions
            ? {
                es: descriptionEs || '',
                en: descriptionEn || '',
                pt: descriptionPt || '',
            }
            : undefined;

        const formData: CreateCategoryDto = {
            name,
            slug: slug.trim() || generateSlug(nameEs),
            description,
            imageUrl: imageUrl || undefined,
            parentCategory: parentCategory || undefined,
            order,
            active,
        };

        if (category) {
            updateMutation.mutate({ id: category._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        formData.append('upload_preset', 'categories_images'); // Configure this in Cloudinary

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            setImageUrl(data.secure_url);
            toast.success('Imagen subida exitosamente');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Get category name for display
    const getCategoryName = (cat: Category): string => {
        if (typeof cat.name === 'object' && cat.name !== null) {
            return cat.name.es || cat.name.en || cat.name.pt || '';
        }
        return cat.name || '';
    };

    // Filter categories to prevent circular references
    const availableParentCategories = categories.filter(
        (cat) => !category || cat._id !== category._id
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {category
                            ? t(traduccionCategories, 'editCategory')
                            : parentCategoryId
                                ? t(traduccionCategories, 'createSubcategory')
                                : t(traduccionCategories, 'createCategory')}
                    </DialogTitle>
                    <DialogDescription>
                        {category
                            ? 'Modifica los datos de la categoría'
                            : 'Completa los datos para crear una nueva categoría'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name (Multiidioma) */}
                    <div className="space-y-2">
                        <Label>
                            {t(traduccionCategories, 'name')} <span className="text-destructive">*</span>
                        </Label>
                        <Tabs defaultValue={language} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="es">Español</TabsTrigger>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="pt">Português</TabsTrigger>
                            </TabsList>
                            <TabsContent value="es" className="space-y-2">
                                <Input
                                    value={nameEs}
                                    onChange={(e) => setNameEs(e.target.value)}
                                    placeholder={t(traduccionCategories, 'namePlaceholder')}
                                    required={!nameEn && !namePt}
                                />
                            </TabsContent>
                            <TabsContent value="en" className="space-y-2">
                                <Input
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    placeholder="E.g: Electronics, Clothing, Food..."
                                />
                            </TabsContent>
                            <TabsContent value="pt" className="space-y-2">
                                <Input
                                    value={namePt}
                                    onChange={(e) => setNamePt(e.target.value)}
                                    placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">{t(traduccionCategories, 'slug')}</Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(generateSlug(e.target.value))}
                            placeholder={t(traduccionCategories, 'slugPlaceholder')}
                        />
                    </div>

                    {/* Description (Multiidioma) */}
                    <div className="space-y-2">
                        <Label>{t(traduccionCategories, 'description')}</Label>
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
                                    placeholder={t(traduccionCategories, 'descriptionPlaceholder')}
                                    rows={3}
                                />
                            </TabsContent>
                            <TabsContent value="en" className="space-y-2">
                                <Textarea
                                    value={descriptionEn}
                                    onChange={(e) => setDescriptionEn(e.target.value)}
                                    placeholder="Optional category description..."
                                    rows={3}
                                />
                            </TabsContent>
                            <TabsContent value="pt" className="space-y-2">
                                <Textarea
                                    value={descriptionPt}
                                    onChange={(e) => setDescriptionPt(e.target.value)}
                                    placeholder="Descrição opcional da categoria..."
                                    rows={3}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Parent Category */}
                    <div className="space-y-2">
                        <Label htmlFor="parentCategory">{t(traduccionCategories, 'parentCategory')}</Label>
                        <Select value={parentCategory || ''} onValueChange={setParentCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder={t(traduccionCategories, 'parentCategoryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">
                                    {t(traduccionCategories, 'parentCategoryPlaceholder')}
                                </SelectItem>
                                {availableParentCategories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {getCategoryName(cat)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {t(traduccionCategories, 'parentCategoryHelper')}
                        </p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>{t(traduccionCategories, 'image')}</Label>
                        <div className="flex items-center gap-4">
                            {imageUrl && (
                                <div className="relative">
                                    <img
                                        src={imageUrl}
                                        alt="Category preview"
                                        className="h-20 w-20 rounded object-cover bg-muted border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={() => setImageUrl('')}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex-1">
                                <Label
                                    htmlFor="image-upload"
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
                                            {t(traduccionCategories, 'uploadImage')}
                                        </>
                                    )}
                                </Label>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order */}
                    <div className="space-y-2">
                        <Label htmlFor="order">{t(traduccionCategories, 'order')}</Label>
                        <Input
                            id="order"
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            placeholder={t(traduccionCategories, 'orderPlaceholder')}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t(traduccionCategories, 'orderHelper')}
                        </p>
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="active"
                            checked={active}
                            onCheckedChange={setActive}
                        />
                        <Label htmlFor="active" className="cursor-pointer">
                            {t(traduccionCategories, 'active')}
                        </Label>
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            {t(traduccionCategories, 'cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t(traduccionCategories, 'saveCategory')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
