import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { Brand } from '../../models/Brand.js';
import { Product } from '../../models/ProductEnhanced.js';


export const adminBrandsRouter = Router();

// Todas las rutas requieren autenticación de admin
adminBrandsRouter.use(requireAdmin);

/**
 * GET /api/panel/brands
 * Listar todas las marcas
 */
adminBrandsRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const { page = '1', limit = '50', search } = req.query;
        const query: Record<string, unknown> = {};

        if (search) {
            query.name = { $regex: search as string, $options: 'i' };
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [brands, total] = await Promise.all([
            Brand.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limitNum),
            Brand.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: {
                brands,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            }
        });
    })
);

/**
 * GET /api/panel/brands/:id/extracted-brands
 * Obtener marcas extraídas para una marca específica
 */
adminBrandsRouter.get(
    '/:id/extracted-brands',
    asyncHandler(async (req, res) => {
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        // Obtener productos que podrían contener esta marca en el título
        const products = await Product.find({
            $and: [
                { title: { $regex: brand.name, $options: 'i' } },
                {
                    $or: [
                        { brand: { $exists: false } },
                        { brand: null },
                        { brand: '' }
                    ]
                }
            ]
        }).limit(50).select('name brand category price available sources');

        const extractedBrands = products.map(product => ({
            productId: product._id,
            productTitle: typeof product.name === 'string' ? product.name : product.name.es,
            storeName: product.sources?.[0]?.store || 'unknown',
            confidence: 0.8, // Placeholder confidence
            extractedBrand: brand.name
        }));

        res.json({
            success: true,
            data: {
                brandId: brand._id,
                brandName: brand.name,
                extractedBrands,
                total: extractedBrands.length
            }
        });
    })
);

/**
 * GET /api/panel/brands/:id/mappings
 * Obtener mapeos de marca
 */
adminBrandsRouter.get(
    '/:id/mappings',
    asyncHandler(async (req, res) => {
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        // Obtener productos que tienen esta marca asignada
        const products = await Product.find({ brand: brand._id })
            .limit(100)
            .select('title storeName brandAssignedAt')
            .sort({ brandAssignedAt: -1 });

        const mappings = products.map(product => ({
            productId: product._id,
            productTitle: typeof product.name === 'string' ? product.name : product.name.es,
            storeName: product.sources?.[0]?.store || 'unknown',
            mappedAt: product.createdAt,
            confidence: 0.9 // Placeholder confidence
        }));

        res.json({
            success: true,
            data: {
                brandId: brand._id,
                brandName: brand.name,
                mappings,
                total: mappings.length
            }
        });
    })
);

/**
 * GET /api/panel/brands/:id/extraction-stats
 * Obtener estadísticas de extracción de marca
 */
adminBrandsRouter.get(
    '/:id/extraction-stats',
    asyncHandler(async (req, res) => {
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        // Contar productos con esta marca
        const totalMapped = await Product.countDocuments({ brand: brand._id });
        
        // Contar productos que podrían tener esta marca pero no están mapeados
        const potentialProducts = await Product.countDocuments({
            title: { $regex: brand.name, $options: 'i' },
            $or: [
                { brand: { $exists: false } },
                { brand: null },
                { brand: '' }
            ]
        });

        res.json({
            success: true,
            data: {
                brandId: brand._id,
                brandName: brand.name,
                totalExtracted: totalMapped,
                mappedCount: totalMapped,
                pendingCount: potentialProducts,
                averageConfidence: 0.85 // Placeholder
            }
        });
    })
);

/**
 * GET /api/panel/brands/:id
 * Obtener una marca por ID
 */
adminBrandsRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        res.json({ success: true, data: brand });
    })
);

/**
 * POST /api/panel/brands
 * Crear una nueva marca
 */
adminBrandsRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        const brand = new Brand(req.body);
        await brand.save();

        res.status(201).json({ success: true, data: brand });
    })
);

/**
 * PUT /api/panel/brands/:id
 * Actualizar una marca
 */
adminBrandsRouter.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!brand) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        res.json({ success: true, data: brand });
    })
);

/**
 * DELETE /api/panel/brands/:id
 * Eliminar una marca
 */
adminBrandsRouter.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const brand = await Brand.findByIdAndDelete(req.params.id);

        if (!brand) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        res.json({ success: true, message: 'Marca eliminada exitosamente' });
    })
);

/**
 * POST /api/panel/brands/extract-from-products
 * Extraer marcas de los títulos de productos
 */
adminBrandsRouter.post(
    '/extract-from-products',
    asyncHandler(async (req, res) => {
        const { storeName, sampleSize = 1000 } = req.body;
        
        if (!storeName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Falta el campo requerido: storeName' 
            });
        }

        // Obtener productos sin marca asignada
        const products = await Product.find({ 
            storeName,
            $or: [
                { brand: { $exists: false } },
                { brand: null },
                { brand: '' }
            ]
        }).limit(sampleSize).select('title brand storeName');

        if (products.length === 0) {
            return res.json({ 
                success: true, 
                data: {
                    totalProducts: 0,
                    extractedBrands: [],
                    message: 'No hay productos sin marca para este supermercado'
                }
            });
        }

        // Obtener todas las marcas existentes
        const existingBrands = await Brand.find({}).select('name keywords synonyms');
        
        const extractedBrands: Array<{
            productId: string;
            productTitle: string;
            brandName: string;
            brandId?: string;
            confidence: number;
            method: string;
        }> = [];
        const brandFrequency = new Map<string, number>();

        // Extraer marcas de los títulos
        for (const product of products) {
            const title = typeof product.name === 'string' ? product.name.toLowerCase() : product.name.es.toLowerCase();
            let foundBrand = null;
            let confidence = 0;

            // Buscar coincidencia exacta con marcas existentes
            for (const brand of existingBrands) {
                const brandName = brand.name.toLowerCase();
                if (title.includes(brandName)) {
                    foundBrand = brand;
                    confidence = 0.9;
                    break;
                }

                // Buscar en keywords (placeholder - marcas no tienen keywords actualmente)
                // if (brand.keywords && brand.keywords.length > 0) {
                //     for (const keyword of brand.keywords) {
                //         if (title.includes(keyword.toLowerCase())) {
                //             foundBrand = brand;
                //             confidence = 0.8;
                //             break;
                //         }
                //     }
                //     if (foundBrand) break;
                // }
            }

            // Si no se encontró marca, intentar extraer del título
            if (!foundBrand) {
                // Patrones comunes para marcas en títulos
                const patterns = [
                    /^([A-Z][a-z]+)\s+/, // Marca al principio
                    /\s+([A-Z][a-z]+)\s*$/, // Marca al final
                    /\s+([A-Z][a-z]+)\s+\d+/, // Marca seguida de números
                    /([A-Z][a-z]+)\s+[A-Z]/ // Marca seguida de otra palabra capitalizada
                ];

                for (const pattern of patterns) {
                    const match = (typeof product.name === 'string' ? product.name : product.name.es).match(pattern);
                    if (match && match[1]) {
                        const potentialBrand = match[1];
                        // Verificar que no sea una palabra común
                        const commonWords = ['con', 'sin', 'para', 'de', 'el', 'la', 'y', 'a', 'en'];
                        if (!commonWords.includes(potentialBrand.toLowerCase())) {
                            foundBrand = { name: potentialBrand, _id: null };
                            confidence = 0.6;
                            break;
                        }
                    }
                }
            }

            if (foundBrand) {
                extractedBrands.push({
                    productId: product._id.toString(),
                    productTitle: typeof product.name === 'string' ? product.name : product.name.es,
                    brandName: foundBrand.name,
                    brandId: foundBrand._id?.toString(),
                    confidence,
                    method: foundBrand._id ? 'existing' : 'extracted'
                });

                // Contar frecuencia de la marca
                const brandKey = foundBrand.name;
                brandFrequency.set(brandKey, (brandFrequency.get(brandKey) || 0) + 1);
            }
        }

        // Agrupar por marca y calcular estadísticas
        const brandStats = Array.from(brandFrequency.entries()).map(([brandName, frequency]) => {
            const brandExtractions = extractedBrands.filter(e => e.brandName === brandName);
            const avgConfidence = brandExtractions.reduce((sum, e) => sum + e.confidence, 0) / brandExtractions.length;
            
            return {
                brandName,
                frequency,
                avgConfidence,
                products: brandExtractions.slice(0, 5) // Primeros 5 productos como ejemplo
            };
        }).sort((a, b) => b.frequency - a.frequency);

        res.json({ 
            success: true, 
            data: {
                totalProducts: products.length,
                productsWithBrand: extractedBrands.length,
                extractionRate: (extractedBrands.length / products.length) * 100,
                extractedBrands: brandStats,
                sampleProducts: extractedBrands.slice(0, 10) // Primeros 10 productos
            }
        });
    })
);

/**
 * POST /api/panel/brands/:id/assign-to-products
 * Asignar marca a productos extraídos
 */
adminBrandsRouter.post(
    '/:id/assign-to-products',
    asyncHandler(async (req, res) => {
        const { productIds } = req.body;
        
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Falta el campo requerido: productIds array' 
            });
        }

        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: 'Marca no encontrada' });
        }

        // Actualizar productos con la marca
        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { 
                $set: { 
                    brand: brand._id,
                    brandName: brand.name,
                    brandAssignedAt: new Date()
                } 
            }
        );

        res.json({ 
            success: true, 
            message: 'Marca asignada exitosamente',
            data: {
                brandId: brand._id,
                brandName: brand.name,
                updatedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            }
        });
    })
);
