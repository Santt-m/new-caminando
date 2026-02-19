import { Router } from 'express';
import { z } from 'zod';
import { Campaign } from '../../models/Campaign.js';
import { CampaignMetrics } from '../../models/CampaignMetrics.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/response.js';
import { logAudit } from '../../utils/logger.js';

export const adminCampaignsRouter = Router();

// Schema de validación
const createCampaignSchema = z.object({
    code: z.string().min(3).regex(/^[a-zA-Z0-9-_]+$/),
    destinationUrl: z.string().url().optional().or(z.literal('')),
});

// GET /panel/campaigns - Listar campañas
adminCampaignsRouter.get(
    '/',
    asyncHandler(async (_req, res) => {
        const campaigns = await Campaign.find()
            .select('code destinationUrl isActive metrics createdAt') // No traemos dailyMetrics aquí para no pesar
            .sort({ createdAt: -1 });
        res.json(ok(campaigns));
    })
);

// POST /panel/campaigns - Crear campaña
adminCampaignsRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        try {
            const body = createCampaignSchema.parse(req.body);

            const exists = await Campaign.findOne({ code: body.code });
            if (exists) {
                res.status(409).json({ message: 'El código ya existe' });
                return;
            }

            const campaign = await Campaign.create({
                code: body.code,
                destinationUrl: body.destinationUrl,
                isActive: true
            });

            logAudit('Campaña creada', 'ADMIN', { code: campaign.code, destinationUrl: campaign.destinationUrl }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

            res.json(ok(campaign));
        } catch (err) {
            if (err instanceof z.ZodError) {
                const zodErr = err as z.ZodError;
                res.status(400).json({
                    message: 'Datos de campaña inválidos',
                    errors: zodErr.issues.map((e) => ({ path: e.path, message: e.message }))
                });
                return;
            }
            throw err;
        }
    })
);

// GET /panel/campaigns/:id - Detalle con métricas
adminCampaignsRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const campaign = await Campaign.findById(req.params.id).lean();
        if (!campaign) {
            res.status(404).json({ message: 'Campaign not found' });
            return;
        }

        // Fetch daily metrics from separate collection
        const dailyMetrics = await CampaignMetrics.find({ campaignId: req.params.id })
            .sort({ date: 1 })
            .lean();

        // Merge for frontend compatibility
        res.json(ok({ ...campaign, dailyMetrics }));
    })
);

// PATCH /panel/campaigns/:id - Toggle status
adminCampaignsRouter.patch(
    '/:id',
    asyncHandler(async (req, res) => {
        const { isActive } = req.body;
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );
        if (!campaign) {
            res.status(404).json({ message: 'Campaign not found' });
            return;
        }

        logAudit('Campaign status toggled', 'ADMIN', { code: campaign.code, isActive }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

        res.json(ok(campaign));
    })
);
