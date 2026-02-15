import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Product } from '../models/ProductEnhanced.js';
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

        // Construir el filtro base para los conteos y rangos
        const baseQuery: Record<string, unknown> = { available: true };

        if (category) {
            const cat = await Category.findOne({ slug: category as string, active: true });
            if (cat) baseQuery.category = cat._id;
        }

        if (subcategory) {
            const subcat = await Category.findOne({ slug: subcategory as string, active: true });
            if (subcat) baseQuery.subcategories = subcat._id;
        }

        if (brand) {
            const brandIds = (brand as string).split(',');
            const brandDocs = await Brand.find({ slug: { $in: brandIds }, active: true });
            if (brandDocs.length > 0) baseQuery.brand = { $in: brandDocs.map(b => b._id) };
        }

        if (search) {
            baseQuery.$text = { $search: search as string };
        }

        // 1. Obtener categorías principales con subcategorías y conteo de productos
        // Las categorías siempre se muestran todas las activas, pero el conteo es sensible al filtro base
        // (Aunque normalmente las categorías no deberían filtrarse a sí mismas para permitir navegación)
        const categoriesAgg = await Category.aggregate([
            { $match: { active: true, parentCategory: null } },
            { $sort: { order: 1, name: 1 } },
            {
                $lookup: {
                    from: 'products',
                    let: { categoryId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$category', '$$categoryId'] }, { $eq: ['$available', true] }] } } },
                        { $count: 'total' },
                    ],
                    as: 'productCount',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    let: { parentId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$parentCategory', '$$parentId'] }, { $eq: ['$active', true] }] } } },
                        { $sort: { order: 1, name: 1 } },
                        {
                            $lookup: {
                                from: 'products',
                                let: { subcatId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [{ $in: ['$$subcatId', '$subcategories'] }, { $eq: ['$available', true] }],
                                            },
                                        },
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
                                count: { $ifNull: [{ $arrayElemAt: ['$productCount.total', 0] }, 0] },
                            },
                        },
                    ],
                    as: 'subcategories',
                },
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    count: { $ifNull: [{ $arrayElemAt: ['$productCount.total', 0] }, 0] },
                    subcategories: 1,
                },
            },
        ]);

        // 2. Obtener marcas con conteo de productos filtrado
        const brandsPage = parseInt(req.query.brandsPage as string) || 1;
        const brandsLimit = 20; // Aumentamos límite para filtros
        const brandsSkip = (brandsPage - 1) * brandsLimit;

        const brandsAgg = await Brand.aggregate([
            { $match: { active: true } },
            {
                $lookup: {
                    from: 'products',
                    let: { brandId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                ...baseQuery,
                                $expr: { $eq: ['$brand', '$$brandId'] }
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
            { $match: { count: { $gt: 0 } } }, // Solo marcas con productos en esta selección
            { $sort: { name: 1 } },
        ]);

        const totalBrands = brandsAgg.length;
        const brands = brandsAgg.slice(brandsSkip, brandsSkip + brandsLimit);

        // 3. Calcular rango de precios para la selección actual
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
            ? { min: priceStats[0].minPrice, max: priceStats[0].maxPrice }
            : { min: 0, max: 0 };

        // 4. Extraer atributos únicos de variantes presentes en la selección actual
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

                if (!valuesFromProducts) return null; // Si no hay productos con este atributo, no lo mostramos

                return {
                    name: def.name,
                    key: def.key,
                    type: def.type,
                    values: valuesFromProducts.values.sort(),
                    unit: def.unit,
                };
            })
            .filter(Boolean); // Filtrar los nulls

        return success(res, {
            categories: categoriesAgg,
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

        // Filtro por categoría
        if (category) {
            const cat = await Category.findOne({ slug: category, active: true });
            if (cat) query.category = cat._id;
        }

        // Filtro por subcategoría
        if (subcategory) {
            const subcat = await Category.findOne({ slug: subcategory, active: true });
            if (subcat) query.subcategories = subcat._id;
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
