import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { AttributeDefinition } from '../../models/AttributeDefinition.js';

export const adminAttributesRouter = Router();

// Todas las rutas requieren autenticación de admin
adminAttributesRouter.use(requireAdmin);

/**
 * GET /api/panel/attributes
 * Listar todas las definiciones de atributos
 */
adminAttributesRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const { page = '1', limit = '50', search } = req.query;
        const query: Record<string, unknown> = {};

        if (search) {
            query['name.es'] = { $regex: search as string, $options: 'i' };
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [attributes, total] = await Promise.all([
            AttributeDefinition.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limitNum),
            AttributeDefinition.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: {
                attributes,
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
 * GET /api/panel/attributes/:id
 * Obtener una definición de atributo por ID
 */
adminAttributesRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const attribute = await AttributeDefinition.findById(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Atributo no encontrado' });
        }

        res.json({ success: true, data: attribute });
    })
);

/**
 * POST /api/panel/attributes
 * Crear una nueva definición de atributo
 */
adminAttributesRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        const attribute = new AttributeDefinition(req.body);
        await attribute.save();

        res.status(201).json({ success: true, data: attribute });
    })
);

/**
 * PUT /api/panel/attributes/:id
 * Actualizar una definición de atributo
 */
adminAttributesRouter.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const attribute = await AttributeDefinition.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!attribute) {
            return res.status(404).json({ message: 'Atributo no encontrado' });
        }

        res.json({ success: true, data: attribute });
    })
);

/**
 * DELETE /api/panel/attributes/:id
 * Eliminar una definición de atributo
 */
adminAttributesRouter.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const attribute = await AttributeDefinition.findByIdAndDelete(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Atributo no encontrado' });
        }

        res.json({ success: true, message: 'Atributo eliminado exitosamente' });
    })
);
