import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader2, Plus, ArrowLeft } from 'lucide-react';
import { AdminProductsService } from '@/services/admin/products.service';
import { AdminCategoriesService } from '@/services/admin/categories.service';
import { AdminBrandsService } from '@/services/admin/brands.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionProducts } from './traduccion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import type { CreateProductDto, UpdateProductDto, ProductVariant, ProductOption } from '@/types/ecommerce';
import { VariantEditor } from './components/VariantEditor';
import { OptionConfigurator } from './components/OptionConfigurator';
import { cartesianProduct, generateVariantName, generateVariantSku } from '@/utils/variantHelpers';

// Helper to generate slug
const generateSlug = (text: string): string => {
    return text.toLowerCase().trim()
        .replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i')
        .replace(/[óòôõ]/g, 'o').replace(/[úùû]/g, 'u').replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const isEditing = !!id;

    // Form state - Basic Info
    const [nameEs, setNameEs] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [namePt, setNamePt] = useState('');
    const [slug, setSlug] = useState('');
    const [descriptionEs, setDescriptionEs] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [descriptionPt, setDescriptionPt] = useState('');

    // Form state - IDs
    const [sku, setSku] = useState('');
    const [ean, setEan] = useState('');

    // Form state - Pricing & Stock
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [stock, setStock] = useState('');

    // Form state - Categorization
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');

    // Form state - Images
    const [images, setImages] = useState<string[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    // Form state - Variants & Options
    const [hasVariants, setHasVariants] = useState(false);
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);

    // Form state - Flags
    const [available, setAvailable] = useState(true);
    const [featured, setFeatured] = useState(false);

    // Fetch product if editing
    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['admin-product', id],
        queryFn: () => AdminProductsService.getById(id!),
        enabled: isEditing,
    });

    // Fetch related data
    const { data: categoriesData } = useQuery({
        queryKey: ['admin-categories-all'],
        queryFn: () => AdminCategoriesService.getAll({}),
    });

    const { data: brandsData } = useQuery({
        queryKey: ['admin-brands-all'],
        queryFn: () => AdminBrandsService.getAll({}),
    });

    // Load product data when editing
    useEffect(() => {
        if (product) {
            // Names
            if (typeof product.name === 'object') {
                setNameEs(product.name.es || '');
                setNameEn(product.name.en || '');
                setNamePt(product.name.pt || '');
            } else {
                setNameEs(product.name || '');
            }

            setSlug(product.slug);

            // Descriptions
            if (typeof product.description === 'object' && product.description) {
                setDescriptionEs(product.description.es || '');
                setDescriptionEn(product.description.en || '');
                setDescriptionPt(product.description.pt || '');
            } else {
                setDescriptionEs(product.description || '');
            }

            setSku(product.sku);
            setEan(product.ean || '');
            setPrice(product.price?.toString() || '');
            setDiscountPrice(product.discountPrice?.toString() || '');
            setStock(product.stock?.toString() || '');
            setCategory(typeof product.category === 'string' ? product.category : product.category?._id || '');
            setBrand(typeof product.brand === 'string' ? product.brand : product.brand?._id || '');
            setImages(product.images || []);
            setAvailable(product.available ?? true);
            setFeatured(product.featured || false);

            if (product.variants && product.variants.length > 0) {
                setHasVariants(true);
                setVariants(product.variants);
            }
        }
    }, [product]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!isEditing && nameEs) {
            setSlug(generateSlug(nameEs));
        }
    }, [nameEs, isEditing]);

    const createMutation = useMutation({
        mutationFn: (data: CreateProductDto) => AdminProductsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast.success(t(traduccionProducts, 'createSuccess'));
            navigate('/panel/products');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al crear el producto');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
            AdminProductsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
            toast.success(t(traduccionProducts, 'updateSuccess'));
            navigate('/panel/products');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al actualizar el producto');
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate max images
        if (images.length + files.length > 8) {
            toast.error('Máximo 8 imágenes por producto');
            return;
        }

        setIsUploadingImages(true);

        const uploadPromises = files.map(async (file) => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} no es una imagen`);
                return null;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} supera 5MB`);
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'products_images');

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    { method: 'POST', body: formData }
                );
                const data = await response.json();
                return data.secure_url;
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Error al subir ${file.name}`);
                return null;
            }
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter((url): url is string => url !== null);

        setImages([...images, ...validUrls]);
        setIsUploadingImages(false);

        if (validUrls.length > 0) {
            toast.success(`${validUrls.length} imagen(es) subida(s)`);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setVariants([...variants, { sku: '', price: 0, stock: 0, attributes: {} }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const updateVariantImages = (index: number, images: string[]) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], images };
        setVariants(updated);
    };

    // Generate variants from options
    const handleGenerateVariants = () => {
        if (options.length === 0) {
            toast.error('Define al menos una opción');
            return;
        }

        // Convert options to cartesian format
        const attributeValues: Record<string, string[]> = {};
        options.forEach(option => {
            if (option.values.length > 0) {
                attributeValues[option.key] = option.values;
            }
        });

        // Generate combinations
        const combinations = cartesianProduct(attributeValues);

        if (combinations.length === 0) {
            toast.error('Agrega valores a las opciones');
            return;
        }

        if (combinations.length > 100) {
            toast.error('Máximo 100 variantes. Reduce las opciones.');
            return;
        }

        // Create variants from combinations
        const newVariants: Partial<ProductVariant>[] = combinations.map(combo => {
            const variantName = generateVariantName(combo);
            const variantSku = generateVariantSku(combo);

            return {
                name: variantName,
                sku: sku ? `${sku}-${variantSku}` : variantSku,
                price: parseFloat(price) || 0,
                stock: parseInt(stock) || 0,
                images: [],
                attributes: combo,
                available: true
            };
        });

        setVariants(newVariants);
        toast.success(`${newVariants.length} variantes generadas`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (!nameEs.trim() && !nameEn.trim() && !namePt.trim()) {
            toast.error(t(traduccionProducts, 'nameRequired'));
            return;
        }

        if (!sku.trim()) {
            toast.error(t(traduccionProducts, 'skuRequired'));
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            toast.error(t(traduccionProducts, 'priceInvalid'));
            return;
        }

        const stockNum = parseInt(stock);
        if (isNaN(stockNum) || stockNum < 0) {
            toast.error(t(traduccionProducts, 'stockInvalid'));
            return;
        }

        if (images.length === 0) {
            toast.error(t(traduccionProducts, 'atLeastOneImage'));
            return;
        }

        // Prepare data
        const name = {
            es: nameEs.trim() || '',
            en: nameEn.trim() || '',
            pt: namePt.trim() || '',
        };

        const hasDescriptions = descriptionEs || descriptionEn || descriptionPt;
        const description = hasDescriptions ? {
            es: descriptionEs || '',
            en: descriptionEn || '',
            pt: descriptionPt || '',
        } : undefined;

        const formData: CreateProductDto = {
            name,
            slug: slug.trim() || generateSlug(nameEs),
            description,
            sku: sku.trim(),
            ean: ean.trim() || undefined,
            brand: brand || undefined,
            category: category || undefined,
            price: priceNum,
            discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
            stock: stockNum,
            images,
            variants: hasVariants && variants.length > 0 ? variants as any : undefined,
            available,
            featured,
        };

        if (isEditing && id) {
            updateMutation.mutate({ id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;
    const getName = (name: any): string => {
        if (typeof name === 'string') return name;
        if (typeof name === 'object' && name !== null) {
            return name.es || name.en || name.pt || '';
        }
        return '';
    };

    if (isEditing && isLoadingProduct) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/panel/products')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        {isEditing ? t(traduccionProducts, 'editProduct') : t(traduccionProducts, 'createProduct')}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{t(traduccionProducts, 'basicInfo')}</h2>

                    {/* Name (Multiidioma) */}
                    <div className="space-y-2 mb-4">
                        <Label>{t(traduccionProducts, 'name')} <span className="text-destructive">*</span></Label>
                        <Tabs defaultValue={language}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="es">Español</TabsTrigger>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="pt">Português</TabsTrigger>
                            </TabsList>
                            <TabsContent value="es">
                                <Input value={nameEs} onChange={(e) => setNameEs(e.target.value)}
                                    placeholder={t(traduccionProducts, 'namePlaceholder')} required={!nameEn && !namePt} />
                            </TabsContent>
                            <TabsContent value="en">
                                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                                    placeholder="E.g: iPhone 15 Pro Max" />
                            </TabsContent>
                            <TabsContent value="pt">
                                <Input value={namePt} onChange={(e) => setNamePt(e.target.value)}
                                    placeholder="Ex: iPhone 15 Pro Max" />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Slug */}
                    <div className="space-y-2 mb-4">
                        <Label htmlFor="slug">{t(traduccionProducts, 'slug')}</Label>
                        <Input id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))}
                            placeholder={t(traduccionProducts, 'slugPlaceholder')} />
                    </div>

                    {/* Description (Multiidioma) */}
                    <div className="space-y-2">
                        <Label>{t(traduccionProducts, 'description')}</Label>
                        <Tabs defaultValue={language}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="es">Español</TabsTrigger>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="pt">Português</TabsTrigger>
                            </TabsList>
                            <TabsContent value="es">
                                <Textarea value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)}
                                    placeholder={t(traduccionProducts, 'descriptionPlaceholder')} rows={4} />
                            </TabsContent>
                            <TabsContent value="en">
                                <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)}
                                    placeholder="Detailed product description..." rows={4} />
                            </TabsContent>
                            <TabsContent value="pt">
                                <Textarea value={descriptionPt} onChange={(e) => setDescriptionPt(e.target.value)}
                                    placeholder="Descrição detalhada do produto..." rows={4} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </Card>

                {/* IDs & Pricing */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{t(traduccionProducts, 'pricing')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">{t(traduccionProducts, 'sku')} <span className="text-destructive">*</span></Label>
                            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)}
                                placeholder={t(traduccionProducts, 'skuPlaceholder')} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ean">{t(traduccionProducts, 'ean')}</Label>
                            <Input id="ean" value={ean} onChange={(e) => setEan(e.target.value)}
                                placeholder={t(traduccionProducts, 'eanPlaceholder')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">{t(traduccionProducts, 'price')} <span className="text-destructive">*</span></Label>
                            <Input id="price" type="number" step="0.01" value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder={t(traduccionProducts, 'pricePlaceholder')} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discountPrice">{t(traduccionProducts, 'discountPrice')}</Label>
                            <Input id="discountPrice" type="number" step="0.01" value={discountPrice}
                                onChange={(e) => setDiscountPrice(e.target.value)}
                                placeholder={t(traduccionProducts, 'discountPricePlaceholder')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">{t(traduccionProducts, 'stock')} <span className="text-destructive">*</span></Label>
                            <Input id="stock" type="number" value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder={t(traduccionProducts, 'stockPlaceholder')} required />
                        </div>
                    </div>
                </Card>

                {/* Categorization */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{t(traduccionProducts, 'categorization')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">{t(traduccionProducts, 'category')}</Label>
                            <Select value={category || 'none'} onValueChange={(v) => setCategory(v === 'none' ? '' : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t(traduccionProducts, 'categoryPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t(traduccionProducts, 'categoryPlaceholder')}</SelectItem>
                                    {categoriesData?.categories?.map((cat: any) => (
                                        <SelectItem key={cat._id} value={cat._id}>{getName(cat.name)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">{t(traduccionProducts, 'brand')}</Label>
                            <Select value={brand || 'none'} onValueChange={(v) => setBrand(v === 'none' ? '' : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t(traduccionProducts, 'brandPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t(traduccionProducts, 'brandPlaceholder')}</SelectItem>
                                    {brandsData?.brands?.map((b: any) => (
                                        <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Images */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{t(traduccionProducts, 'images')}</h2>

                    {/* Image Grid */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img src={img} alt={`Product ${idx + 1}`}
                                        className="w-full h-32 object-cover rounded border" />
                                    <Button type="button" variant="destructive" size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(idx)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Button */}
                    <Label htmlFor="image-upload"
                        className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        {isUploadingImages ? (
                            <>
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span>{t(traduccionProducts, 'uploadingImages')}</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8" />
                                <span className="font-medium">{t(traduccionProducts, 'uploadImages')}</span>
                                <span className="text-sm text-muted-foreground">
                                    {t(traduccionProducts, 'maxImages').replace('{{max}}', '8')}
                                </span>
                            </>
                        )}
                    </Label>
                    <Input id="image-upload" type="file" accept="image/*" multiple
                        className="hidden" onChange={handleImageUpload} disabled={isUploadingImages} />
                </Card>

                {/* Variants - SIMPLIFIED FLOW */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{t(traduccionProducts, 'variants')}</h2>
                        <div className="flex items-center space-x-2">
                            <Switch id="hasVariants" checked={hasVariants} onCheckedChange={setHasVariants} />
                            <Label htmlFor="hasVariants" className="cursor-pointer">
                                {t(traduccionProducts, 'hasVariants')}
                            </Label>
                        </div>
                    </div>

                    {hasVariants && (
                        <div className="space-y-6">
                            {/* Step 1: Configure Options */}
                            {variants.length === 0 && (
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">
                                            1. Configurar Opciones
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Define opciones como Color, Talle, RAM, Almacenamiento, etc.
                                        </p>
                                    </div>

                                    <OptionConfigurator
                                        options={options}
                                        onChange={setOptions}
                                        onGenerate={handleGenerateVariants}
                                    />
                                </div>
                            )}

                            {/* Step 2: Generated Variants List */}
                            {variants.length > 0 && (
                                <div className="space-y-4">
                                    {/* Header with regenerate button */}
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                Variantes Generadas ({variants.length})
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {options.map(o => o.name).join(' × ')}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('¿Borrar todas las variantes y reconfigurar opciones?')) {
                                                    setVariants([]);
                                                    setOptions([]);
                                                }
                                            }}
                                        >
                                            Reconfigurar
                                        </Button>
                                    </div>

                                    {/* Variant editors */}
                                    <div className="space-y-3">
                                        {variants.map((variant, idx) => (
                                            <VariantEditor
                                                key={idx}
                                                variant={variant}
                                                index={idx}
                                                onUpdate={updateVariant}
                                                onRemove={removeVariant}
                                                onImageUpload={updateVariantImages}
                                            />
                                        ))}
                                    </div>

                                    {/* Add manual variant button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addVariant}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t(traduccionProducts, 'addVariant')}
                                    </Button>
                                </div>
                            )}

                            {/* Empty state */}
                            {variants.length === 0 && options.length === 0 && (
                                <Card className="p-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Define opciones configurables para generar variantes automáticamente
                                    </p>
                                </Card>
                            )}
                        </div>
                    )}
                </Card>

                {/* Flags */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Switch id="available" checked={available} onCheckedChange={setAvailable} />
                            <Label htmlFor="available" className="cursor-pointer">
                                {t(traduccionProducts, 'available')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                            <Label htmlFor="featured" className="cursor-pointer">
                                {t(traduccionProducts, 'featured')}
                            </Label>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <Button type="button" variant="outline" onClick={() => navigate('/panel/products')} disabled={isLoading}>
                        {t(traduccionProducts, 'cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t(traduccionProducts, 'saveProduct')}
                    </Button>
                </div>
            </form>
        </div>
    );
};
