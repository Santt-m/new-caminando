/**
 * Rutas de API para operaciones con EAN
 * Búsqueda, validación y gestión de códigos de barras
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Product, type ProductDocument, type ProductVariant } from '../models/Product.js';
import { validateEAN, formatEAN, extractEANFromText } from '../shared/utils/EANUtils.js';
import { authenticateAdmin } from '../middlewares/auth.js';

export const eanRouter = Router();

/**
 * GET /api/ean/:ean
 * Buscar producto por EAN
 */
eanRouter.get(
    '/:ean',
    asyncHandler(async (req, res) => {
        const { ean } = req.params;
        
        // Validar formato del EAN
        const validation = validateEAN(ean);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'EAN inválido',
                data: { validation }
            });
        }
        
        // Buscar producto por EAN
        const product = await Product.findByEAN(ean);
        if (product) {
            await product.populate('brand', 'name');
            await product.populate('category', 'name.es');
            await product.populate('subcategories', 'name.es');
        }
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado para el EAN proporcionado',
                data: { ean, formattedEAN: formatEAN(ean) }
            });
        }
        
        // Encontrar la variante específica con este EAN
        let variant = null;
        if (product.variants && product.variants.length > 0) {
            variant = product.variants.find((v: ProductVariant) => v.ean === ean);
        }
        
        res.json({
            success: true,
            message: 'Producto encontrado',
            data: {
                product: product.toJSON(),
                variant,
                eanInfo: validation,
                formattedEAN: formatEAN(ean)
            }
        });
    })
);

/**
 * POST /api/ean/validate
 * Validar múltiples EANs
 */
eanRouter.post(
    '/validate',
    asyncHandler(async (req, res) => {
        const { eans } = req.body;
        
        if (!Array.isArray(eans) || eans.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de EANs'
            });
        }
        
        if (eans.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Máximo 100 EANs permitidos por validación'
            });
        }
        
        const results = eans.map(ean => ({
            ean,
            validation: validateEAN(ean),
            formattedEAN: formatEAN(ean)
        }));
        
        const validEANs = results.filter(r => r.validation.isValid).map(r => r.ean);
        const invalidEANs = results.filter(r => !r.validation.isValid).map(r => r.ean);
        
        // Buscar productos existentes para EANs válidos
        const existingProducts = validEANs.length > 0 
            ? await Product.findByEANs(validEANs)
            : [];
        
        // Populate the products
        for (const product of existingProducts) {
            await product.populate('brand', 'name');
            await product.populate('category', 'name.es');
        }
        
        const existingEANs = existingProducts.map((p: ProductDocument) => p.getAllEANs()).flat();
        
        res.json({
            success: true,
            data: {
                results,
                summary: {
                    total: eans.length,
                    valid: validEANs.length,
                    invalid: invalidEANs.length,
                    existing: existingEANs.length,
                    new: validEANs.length - existingEANs.length
                },
                existingProducts
            }
        });
    })
);

/**
 * POST /api/ean/extract
 * Extraer EANs de texto
 */
eanRouter.post(
    '/extract',
    asyncHandler(async (req, res) => {
        const { text } = req.body;
        
        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Se requiere texto para extraer EANs'
            });
        }
        
        const extractedEANs = extractEANFromText(text);
        
        if (extractedEANs.length === 0) {
            return res.json({
                success: true,
                message: 'No se encontraron EANs en el texto',
                data: {
                    text,
                    extractedEANs: [],
                    formattedEANs: []
                }
            });
        }
        
        // Validar EANs extraídos
        const validatedEANs = extractedEANs.map(ean => ({
            ean,
            validation: validateEAN(ean),
            formattedEAN: formatEAN(ean)
        }));
        
        // Buscar productos existentes
        const existingProducts = await Product.findByEANs(extractedEANs);
        
        // Populate the products
        for (const product of existingProducts) {
            await product.populate('brand', 'name');
            await product.populate('category', 'name.es');
        }
        
        res.json({
            success: true,
            data: {
                text,
                extractedEANs: validatedEANs,
                summary: {
                    found: extractedEANs.length,
                    valid: validatedEANs.filter(v => v.validation.isValid).length,
                    invalid: validatedEANs.filter(v => !v.validation.isValid).length,
                    existing: existingProducts.length
                },
                existingProducts
            }
        });
    })
);

/**
 * GET /api/ean/temporary
 * Obtener productos con EANs temporales (admin only)
 */
eanRouter.get(
    '/temporary',
    authenticateAdmin,
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;
        
        const products = await Product.findWithTemporaryEANs()
            .select('name brand category price available ean variants sources')
            .skip(skip)
            .limit(limit)
            .sort({ 'scrapingMetadata.lastUpdatedAt': -1 })
            .exec();
        
        // Populate the products
        for (const product of products) {
            await product.populate('brand', 'name');
            await product.populate('category', 'name.es');
        }
        
        const total = await Product.countDocuments({
            $or: [
                { ean: /^2/ },
                { 'variants.ean': /^2/ }
            ]
        });
        
        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    })
);

/**
 * GET /api/ean/stats
 * Estadísticas de EANs en el sistema (admin only)
 */
eanRouter.get(
    '/stats',
    authenticateAdmin,
    asyncHandler(async (_req, res) => {
        const totalProducts = await Product.countDocuments();
        
        // Productos con EAN principal
        const productsWithMainEAN = await Product.countDocuments({
            ean: { $exists: true, $ne: '' }
        });
        
        // Productos con variantes que tienen EAN
        const productsWithVariantEANs = await Product.countDocuments({
            'variants.ean': { $exists: true, $ne: null }
        });
        
        // Productos con EANs temporales
        const productsWithTempEANs = await Product.countDocuments({
            $or: [
                { ean: /^2/ },
                { 'variants.ean': /^2/ }
            ]
        });
        
        // Productos sin EAN
        const productsWithoutEAN = await Product.countDocuments({
            $and: [
                { $or: [{ ean: { $exists: false } }, { ean: null }, { ean: '' }] },
                { $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }] }
            ]
        });
        
        // Total de variantes con EAN
        const totalVariantsWithEAN = await Product.aggregate([
            { $unwind: '$variants' },
            { $match: { 'variants.ean': { $exists: true, $ne: '' } } },
            { $count: 'total' }
        ]);
        
        res.json({
            success: true,
            data: {
                totalProducts,
                productsWithMainEAN,
                productsWithVariantEANs,
                productsWithTempEANs,
                productsWithoutEAN,
                totalVariantsWithEAN: totalVariantsWithEAN[0]?.total || 0,
                coverage: {
                    mainEAN: Math.round((productsWithMainEAN / totalProducts) * 100),
                    anyEAN: Math.round(((totalProducts - productsWithoutEAN) / totalProducts) * 100),
                    tempEAN: Math.round((productsWithTempEANs / totalProducts) * 100)
                }
            }
        });
    })
);

export default eanRouter;