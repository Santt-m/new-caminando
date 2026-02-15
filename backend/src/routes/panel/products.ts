import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { Product, type ProductVariant } from '../../models/ProductEnhanced.js';
import { success, error, ok } from '../../utils/response.js';

export const adminProductsRouter = Router();

// Todas las rutas requieren autenticación de admin
adminProductsRouter.use(requireAdmin);

/**
 * GET /api/panel/products
 * Listar todos los productos (con paginación)
 */
adminProductsRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const { page = '1', limit = '50', search, category, brand, available } = req.query;

        const query: Record<string, unknown> = {};

        if (search) {
            query.$text = { $search: search as string };
        }

        if (category) {
            query.category = category;
        }

        if (brand) {
            query.brand = brand;
        }

        if (available !== undefined) {
            query.available = available === 'true';
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('brand', 'name slug logoUrl')
                .populate('category', 'name slug')
                .populate('subcategories', 'name slug')
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Product.countDocuments(query),
        ]);

        return res.json(ok({
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }));
    })
);

/**
 * GET /api/panel/products/:id
 * Obtener un producto por ID
 */
adminProductsRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id)
            .populate('brand', 'name slug logoUrl')
            .populate('category', 'name slug')
            .populate('subcategories', 'name slug');

        if (!product) {
            return error(res, 'Producto no encontrado', 404);
        }

        return success(res, product);
    })
);

/**
 * POST /api/panel/products
 * Crear un nuevo producto
 */
adminProductsRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        const product = new Product(req.body);
        await product.save();

        // Poblar referencias para devolver el producto completo
        await product.populate('brand category subcategories');

        return success(res, product, 'Producto creado exitosamente', 201);
    })
);

/**
 * PUT /api/panel/products/:id
 * Actualizar un producto
 */
adminProductsRouter.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('brand category subcategories');

        if (!product) {
            return error(res, 'Producto no encontrado', 404);
        }

        return success(res, product, 'Producto actualizado exitosamente');
    })
);

/**
 * DELETE /api/panel/products/:id
 * Eliminar un producto
 */
adminProductsRouter.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return error(res, 'Producto no encontrado', 404);
        }

        return success(res, { deleted: true }, 'Producto eliminado exitosamente');
    })
);

/**
 * POST /api/panel/products/:id/variants
 * Agregar una variante a un producto
 */
adminProductsRouter.post(
    '/:id/variants',
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return error(res, 'Producto no encontrado', 404);
        }

        if (!product.variants) {
            product.variants = [];
        }

        product.variants.push(req.body);
        await product.save();

        return success(res, product, 'Variante agregada exitosamente', 201);
    })
);

/**
 * PUT /api/panel/products/:id/variants/:variantId
 * Actualizar una variante específica
 */
adminProductsRouter.put(
    '/:id/variants/:variantId',
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return error(res, 'Producto no encontrado', 404);
        }

        const variant = product.variants?.find((v: ProductVariant) => v._id?.toString() === req.params.variantId);

        if (!variant) {
            return error(res, 'Variante no encontrada', 404);
        }

        Object.assign(variant, req.body);
        await product.save();

        return success(res, product, 'Variante actualizada exitosamente');
    })
);

/**
 * DELETE /api/panel/products/:id/variants/:variantId
 * Eliminar una variante específica
 */
adminProductsRouter.delete(
    '/:id/variants/:variantId',
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return error(res, 'Producto no encontrado', 404);
        }

        if (!product.variants) {
            return error(res, 'Variante no encontrada', 404);
        }

        product.variants = product.variants.filter((v: ProductVariant) => v._id?.toString() !== req.params.variantId);
        await product.save();

        return success(res, product, 'Variante eliminada exitosamente');
    })
);
