import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { AttributeDefinition } from '../models/AttributeDefinition.js';
import { success, error, ok } from '../utils/response.js';

export const productsRouter = Router();

/**
 * GET /api/products/filters
 * Devuelve toda la información necesaria para construir el sidebar de filtros
 */
productsRouter.get(
    '/filters',
    asyncHandler(async (req, res) => {
        const { category, subcategory, brand, search } = req.query;

        // 1. Obtener todas las categorías
        const allCategories = await Category.find({ active: true }).lean();

        // Helper para obtener el nombre localizado
        const getNameStr = (name: any) => {
            if (typeof name === 'string') return name;
            return name?.es || name?.en || 'Categoría';
        };

        // 2. Obtener conteos de productos por categoría (contando tanto en 'category' como en 'subcategories')
        const categoryCounts = await Product.aggregate([
            { $match: { available: true } },
            {
                $project: {
                    allCats: {
                        $setUnion: [
                            ['$category'],
                            { $ifNull: ['$subcategories', []] }
                        ]
                    }
                }
            },
            { $unwind: '$allCats' },
            { $group: { _id: '$allCats', count: { $sum: 1 } } }
        ]);

        const directCountMap = new Map();
        categoryCounts.forEach(c => {
            if (c._id) directCountMap.set(c._id.toString(), c.count);
        });

        // 3. Función recursiva para construir el árbol y calcular conteos totales
        const buildTree = (parentId: string | null = null, visited = new Set<string>()): any[] => {
            return allCategories
                .filter(c => {
                    if (parentId === null) return !c.parentCategory;
                    return c.parentCategory?.toString() === parentId;
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0) || getNameStr(a.name).localeCompare(getNameStr(b.name)))
                .map(cat => {
                    const catId = cat._id.toString();
                    if (visited.has(catId)) {
                        console.error(`Circular reference detected in category tree at ID: ${catId}`);
                        return null;
                    }
                    const newVisited = new Set(visited);
                    newVisited.add(catId);

                    const subTree = buildTree(catId, newVisited).filter(Boolean);
                    const directCount = directCountMap.get(catId) || 0;

                    // IMPORTANTE: En este sistema, si un producto está en una subcategoría, 
                    // a veces NO está marcado en la categoría padre.
                    // Pero queremos que el padre muestre el total de la rama.
                    const subTotal = subTree.reduce((acc, sub) => acc + sub.count, 0);
                    const totalCount = directCount + subTotal;

                    return {
                        _id: cat._id,
                        name: cat.name,
                        slug: cat.slug,
                        count: totalCount,
                        subcategories: subTree
                    };
                })
                .filter(Boolean);
        };

        const categoriesTree = buildTree();

        // 4. Filtrado base para el resto de los filtros (marcas, precios, atributos)
        const baseQuery: Record<string, unknown> = { available: true };

        // Helper para obtener todos los IDs de una rama (recursivo)
        const getBranchIds = (parentSlug: string) => {
            const getChildrenIds = (parentId: string, visited = new Set<string>()): string[] => {
                if (visited.has(parentId)) return [];
                visited.add(parentId);
                const children = allCategories.filter(c => c.parentCategory?.toString() === parentId);
                return [parentId, ...children.flatMap(c => getChildrenIds(c._id.toString(), new Set(visited)))];
            };
            const parent = allCategories.find(c => c.slug === parentSlug);
            return parent ? getChildrenIds(parent._id.toString()) : [];
        };

        if (subcategory) {
            const branchIds = getBranchIds(subcategory as string);
            if (branchIds.length > 0) baseQuery.$or = [{ category: { $in: branchIds } }, { subcategories: { $in: branchIds } }];
        } else if (category) {
            const branchIds = getBranchIds(category as string);
            if (branchIds.length > 0) baseQuery.$or = [{ category: { $in: branchIds } }, { subcategories: { $in: branchIds } }];
        }

        if (brand) {
            const brandIds = (brand as string).split(',');
            const brandDocs = await Brand.find({ slug: { $in: brandIds }, active: true });
            if (brandDocs.length > 0) baseQuery.brand = { $in: brandDocs.map(b => b._id) };
        }

        if (search) {
            baseQuery.$text = { $search: search as string };
        }

        // 5. Marcas
        const brandBaseQuery = { ...baseQuery };
        delete brandBaseQuery.brand;

        const brandsAgg = await Brand.aggregate([
            { $match: { active: true } },
            {
                $lookup: {
                    from: 'products',
                    let: { bId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                ...brandBaseQuery,
                                $expr: { $eq: ['$brand', '$$bId'] }
                            }
                        },
                        { $count: 'total' },
                    ],
                    as: 'productCount',
                },
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    logoUrl: 1,
                    count: { $ifNull: [{ $arrayElemAt: ['$productCount.total', 0] }, 0] },
                },
            },
            { $sort: { name: 1 } },
        ]);

        const brandsPage = parseInt(req.query.brandsPage as string) || 1;
        const brandsLimit = 100;
        const brandsSkip = (brandsPage - 1) * brandsLimit;
        const totalBrands = brandsAgg.length;
        const brands = brandsAgg.slice(brandsSkip, brandsSkip + brandsLimit);

        // 6. Precios
        const priceStats = await Product.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
        ]);

        const priceRange = priceStats[0]
            ? { min: Math.floor(priceStats[0].minPrice || 0), max: Math.ceil(priceStats[0].maxPrice || 1000000) }
            : { min: 0, max: 1000000 };

        // 7. Atributos
        const attributeDefs = await AttributeDefinition.find({ active: true }).select('name key type values unit');
        const attributeValues = await Product.aggregate([
            { $match: { ...baseQuery, variants: { $exists: true, $ne: [] } } },
            { $unwind: '$variants' },
            { $match: { 'variants.available': { $ne: false } } },
            { $project: { attributes: { $objectToArray: '$variants.attributes' } } },
            { $unwind: '$attributes' },
            {
                $group: {
                    _id: '$attributes.k',
                    values: { $addToSet: '$attributes.v' },
                },
            },
        ]);

        const availableAttributes = attributeDefs
            .map((def) => {
                const defKey = typeof def.key === 'string' ? def.key : '';
                const valuesFromProducts = attributeValues.find((av) => av._id === defKey);
                if (!valuesFromProducts) return null;

                return {
                    name: def.name,
                    key: def.key,
                    type: def.type,
                    values: valuesFromProducts.values.sort(),
                    unit: def.unit,
                };
            })
            .filter(Boolean);

        return success(res, {
            categories: categoriesTree,
            brands: {
                items: brands,
                total: totalBrands,
                hasMore: brandsSkip + brands.length < totalBrands,
                currentPage: brandsPage,
            },
            priceRange,
            availableAttributes,
        });
    })
);

/**
 * GET /api/products
 * Lista productos con paginación y filtros
 */
productsRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const {
            page = '1',
            limit = '24',
            category,
            subcategory,
            brand,
            minPrice,
            maxPrice,
            attributes,
            sort = '-createdAt',
            search,
        } = req.query;

        const query: Record<string, unknown> = { available: true };

        const allCategories = await Category.find({ active: true }).lean();
        const getBranchIds = (parentSlugOrId: string) => {
            const getChildrenIds = (parentId: string): string[] => {
                const children = allCategories.filter(c => c.parentCategory?.toString() === parentId);
                return [parentId, ...children.flatMap(c => getChildrenIds(c._id.toString()))];
            };
            const cat = allCategories.find(c => c.slug === parentSlugOrId || c._id.toString() === parentSlugOrId);
            return cat ? getChildrenIds(cat._id.toString()) : [];
        };

        // Filtro por categoría
        if (category) {
            const branchIds = getBranchIds(category as string);
            if (branchIds.length > 0) query.$or = [{ category: { $in: branchIds } }, { subcategories: { $in: branchIds } }];
        }

        // Filtro por subcategoría
        if (subcategory) {
            const branchIds = getBranchIds(subcategory as string);
            if (branchIds.length > 0) query.$or = [{ category: { $in: branchIds } }, { subcategories: { $in: branchIds } }];
        }

        // Filtro por marca
        if (brand) {
            const brandDoc = await Brand.findOne({ slug: brand, active: true });
            if (brandDoc) query.brand = brandDoc._id;
        }

        // Filtro por precio
        if (minPrice || maxPrice) {
            query.price = {} as { $gte?: number; $lte?: number };
            if (minPrice) (query.price as { $gte?: number }).$gte = parseFloat(minPrice as string);
            if (maxPrice) (query.price as { $lte?: number }).$lte = parseFloat(maxPrice as string);
        }

        // Filtro por atributos de variantes (ej: ?attributes={"color":"rojo","ram":"8GB"})
        if (attributes) {
            try {
                const attrFilters = JSON.parse(attributes as string);
                Object.entries(attrFilters).forEach(([key, value]) => {
                    query[`variants.attributes.${key}`] = value;
                });
            } catch {
                // Ignorar si el JSON es inválido
            }
        }

        // Búsqueda de texto
        if (search) {
            query.$text = { $search: search as string };
        }

        // Paginación
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Determinar orden
        let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
        if (sort === 'price') sortQuery = { price: 1 };
        else if (sort === '-price') sortQuery = { price: -1 };
        else if (sort === 'name') sortQuery = { name: 1 };
        else if (sort === '-createdAt') sortQuery = { createdAt: -1 };

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('brand', 'name slug logoUrl')
                .populate('category', 'name slug')
                .populate('subcategories', 'name slug')
                .skip(skip)
                .limit(limitNum)
                .sort(sortQuery)
                .lean(),
            Product.countDocuments(query),
        ]);

        return res.json(ok({
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            }
        }));
    })
);

/**
 * GET /api/products/:slug
 * Obtener detalle de un producto por slug
 */
productsRouter.get(
    '/:slug',
    asyncHandler(async (req, res) => {
        const { slug } = req.params;

        const product = await Product.findOne({ slug, available: true })
            .populate('brand', 'name slug logoUrl description')
            .populate('category', 'name slug')
            .populate('subcategories', 'name slug');

        if (!product) {
            return error(res, 'Producto no encontrado', 404);
        }

        return success(res, product);
    })
);
