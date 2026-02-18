import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { Category } from '../../models/Category.js';
import { CategoryMapper } from '../../shared/utils/CategoryMapper.js';
import { Product, type ProductDocument } from '../../models/Product.js';



interface StoreCategory {
    id: string;
    name: string;
    path: string[];
    storeName: string;
    confidence: number;
    productCount: number;
}

export const adminCategoriesRouter = Router();

// Todas las rutas requieren autenticación de admin
adminCategoriesRouter.use(requireAdmin);

/**
 * GET /api/panel/categories
 * Listar todas las categorías (incluyendo subcategorías)
 */
adminCategoriesRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const { search } = req.query;
        const query: Record<string, unknown> = {};

        if (search) {
            query['name.es'] = { $regex: search as string, $options: 'i' };
        }

        const [categories, total] = await Promise.all([
            Category.find(query)
                .populate('parentCategory', 'name slug')
                .sort({ parentCategory: 1, order: 1, 'name.es': 1 }),
            Category.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                categories,
                pagination: {
                    total,
                    page: 1,
                    limit: categories.length,
                    totalPages: 1
                }
            }
        });
    })
);

/**
 * GET /api/panel/categories/:id/store-categories-needing-mapping
 * Obtener categorías de tienda que necesitan mapeo
 */
adminCategoriesRouter.get(
    '/:id/store-categories-needing-mapping',
    asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Obtener productos que tienen categorías de tienda no mapeadas
        const products = await Product.find({
            'category': category._id,
            'sources.categoryPath': { $exists: true, $ne: [] },
            $or: [
                { 'storeCategoryMapping': { $exists: false } },
                { 'storeCategoryMapping': null },
                { 'storeCategoryMapping.confidence': { $lt: 0.7 } }
            ]
        }).limit(50).select('name sources');

        const storeCategories = products.map((product: ProductDocument) => {
            const primarySource = product.sources?.[0];
            const categoryPath = primarySource?.categoryPath || [];
            const storeName = primarySource?.store || 'unknown';
            const storeCategory = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : 'unknown';
            
            return {
                id: `${storeName}-${storeCategory}`,
                name: storeCategory,
                path: categoryPath,
                storeName: storeName,
                confidence: 0.6,
                productCount: 1
            };
        });

        // Agrupar por categoría de tienda
        const grouped = storeCategories.reduce((acc: StoreCategory[], curr: StoreCategory) => {
            const existing = acc.find((item: StoreCategory) => item.id === curr.id && item.storeName === curr.storeName);
            if (existing) {
                existing.productCount += 1;
                existing.confidence = Math.min(existing.confidence + 0.1, 0.9);
            } else {
                acc.push(curr);
            }
            return acc;
        }, [] as typeof storeCategories);

        res.json({
            success: true,
            data: {
                categoryId: category._id,
                categoryName: typeof category.name === 'string' ? category.name : category.name.es,
                storeCategories: grouped,
                total: grouped.length
            }
        });
    })
);

/**
 * GET /api/panel/categories/:id/mappings
 * Obtener mapeos de categoría
 */
adminCategoriesRouter.get(
    '/:id/mappings',
    asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Obtener mapeos de la categoría
        const mappings: Array<{
            storeName: string;
            storeCategoryId: string;
            storeCategoryName: string;
            storeCategoryPath: string[];
            confidence: number;
            mappedAt: Date;
        }> = [];
        
        if (category.storeMappings) {
            Object.entries(category.storeMappings).forEach(([storeName, storeMappings]) => {
                storeMappings.forEach(mapping => {
                    const typedMapping = mapping as {
                        storeCategoryId: string;
                        storeCategoryName: string;
                        storeCategoryPath?: string[];
                        confidence?: number;
                        mappedAt?: Date;
                    };
                    mappings.push({
                        storeName,
                        storeCategoryId: typedMapping.storeCategoryId,
                        storeCategoryName: typedMapping.storeCategoryName,
                        storeCategoryPath: typedMapping.storeCategoryPath || [],
                        confidence: typedMapping.confidence || 0,
                        mappedAt: typedMapping.mappedAt || new Date()
                    });
                });
            });
        }

        res.json({
            success: true,
            data: {
                categoryId: category._id,
                categoryName: typeof category.name === 'string' ? category.name : category.name.es,
                mappings,
                total: mappings.length
            }
        });
    })
);

/**
 * GET /api/panel/categories/:id
 * Obtener una categoría por ID
 */
adminCategoriesRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id).populate('parentCategory', 'name slug');

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ success: true, data: category });
    })
);

/**
 * POST /api/panel/categories
 * Crear una nueva categoría
 */
adminCategoriesRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        const category = new Category(req.body);
        await category.save();

        res.status(201).json({ success: true, data: category });
    })
);

/**
 * PUT /api/panel/categories/:id
 * Actualizar una categoría
 */
adminCategoriesRouter.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ success: true, data: category });
    })
);

/**
 * DELETE /api/panel/categories/:id
 * Eliminar una categoría
 */
adminCategoriesRouter.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ success: true, message: 'Categoría eliminada exitosamente' });
    })
);

/**
 * POST /api/panel/categories/:id/mappings
 * Crear mapeo de categoría para un supermercado
 */
adminCategoriesRouter.post(
    '/:id/mappings',
    asyncHandler(async (req, res) => {
        const { storeName, storeCategoryId, storeCategoryName, storeCategoryPath, confidence } = req.body;
        
        if (!storeName || !storeCategoryId || !storeCategoryName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos requeridos: storeName, storeCategoryId, storeCategoryName' 
            });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Inicializar storeMappings si no existe
        if (!category.storeMappings) {
            category.storeMappings = {};
        }

        // Inicializar array para el supermercado si no existe
        if (!category.storeMappings[storeName]) {
            category.storeMappings[storeName] = [];
        }

        // Verificar si ya existe el mapeo
        const existingMapping = category.storeMappings[storeName].find(
            mapping => (mapping as { storeCategoryId: string }).storeCategoryId === storeCategoryId
        );

        if (existingMapping) {
            return res.status(400).json({ 
                success: false, 
                message: 'El mapeo ya existe para esta categoría y supermercado' 
            });
        }

        // Agregar nuevo mapeo
        const newMapping = {
            storeCategoryId,
            storeCategoryName,
            storeCategoryPath: storeCategoryPath || [],
            confidence: confidence || 0,
            mappedAt: new Date()
        };

        category.storeMappings[storeName].push(newMapping);
        await category.save();

        res.json({ 
            success: true, 
            message: 'Mapeo creado exitosamente',
            data: newMapping 
        });
    })
);

/**
 * DELETE /api/panel/categories/:id/mappings/:storeName/:storeCategoryId
 * Eliminar mapeo de categoría
 */
adminCategoriesRouter.delete(
    '/:id/mappings/:storeName/:storeCategoryId',
    asyncHandler(async (req, res) => {
        const { storeName, storeCategoryId } = req.params;
        
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        if (!category.storeMappings || !category.storeMappings[storeName]) {
            return res.status(404).json({ message: 'No se encontraron mapeos para este supermercado' });
        }

        // Filtrar el mapeo a eliminar
        const initialLength = category.storeMappings[storeName].length;
        category.storeMappings[storeName] = category.storeMappings[storeName].filter(
            mapping => (mapping as { storeCategoryId: string }).storeCategoryId !== storeCategoryId
        );

        if (category.storeMappings[storeName].length === initialLength) {
            return res.status(404).json({ message: 'Mapeo no encontrado' });
        }

        await category.save();

        res.json({ 
            success: true, 
            message: 'Mapeo eliminado exitosamente' 
        });
    })
);

/**
 * POST /api/panel/categories/auto-map
 * Auto-mapear categorías usando el CategoryMapper
 */
adminCategoriesRouter.post(
    '/auto-map',
    asyncHandler(async (req, res) => {
        const { storeName, categories } = req.body;
        
        if (!storeName || !Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos requeridos: storeName, categories array' 
            });
        }

        const mapper = new CategoryMapper();
        await mapper.loadMasterCategories();

        const results = [];
        
        for (const category of categories) {
            try {
                const mappingResult = await mapper.mapCategory(
                    storeName,
                    category.path || [],
                    category.name,
                    category.context
                );

                results.push({
                    storeCategoryId: category.id,
                    storeCategoryName: category.name,
                    storeCategoryPath: category.path || [],
                    mappingResult
                });

            } catch (error) {
                results.push({
                    storeCategoryId: category.id,
                    storeCategoryName: category.name,
                    storeCategoryPath: category.path || [],
                    mappingResult: {
                        masterCategoryId: 'unknown',
                        confidence: 0,
                        method: 'error',
                        reason: error instanceof Error ? error.message : 'Error desconocido'
                    }
                });
            }
        }

        res.json({ 
            success: true, 
            data: {
                total: results.length,
                mapped: results.filter(r => r.mappingResult.confidence > 0).length,
                pending: results.filter(r => r.mappingResult.method === 'pending').length,
                results
            }
        });
    })
);
