import { Router, type Request, type Response } from 'express';
import { EmailTemplate } from '../../models/EmailTemplate.js';
import { EmailLog } from '../../models/EmailLog.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/response.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { logAudit } from '../../utils/logger.js';
import { emailService } from '../../services/EmailService.js';

export const adminEmailsRouter = Router();

adminEmailsRouter.use(requireAdmin);

// === Templates ===

adminEmailsRouter.get(
    '/templates',
    asyncHandler(async (_req: Request, res: Response) => {
        const templates = await EmailTemplate.find().sort({ name: 1 });
        res.json(ok(templates));
    })
);

adminEmailsRouter.get(
    '/templates/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            res.status(404).json({ message: 'Template not found' });
            return;
        }
        res.json(ok(template));
    })
);

adminEmailsRouter.post(
    '/templates',
    asyncHandler(async (req: Request, res: Response) => {
        const template = await EmailTemplate.create(req.body);
        res.json(ok(template));
        logAudit('Email template created', 'ADMIN', { templateId: template._id.toString(), name: template.name }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);
    })
);

adminEmailsRouter.patch(
    '/templates/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!template) {
            res.status(404).json({ message: 'Template not found' });
            return;
        }
        res.json(ok(template));
        logAudit('Email template updated', 'ADMIN', { templateId: template._id.toString(), changes: req.body }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);
    })
);

adminEmailsRouter.delete(
    '/templates/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const template = await EmailTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            res.status(404).json({ message: 'Template not found' });
            return;
        }
        res.json(ok({ success: true }));
        logAudit('Email template deleted', 'ADMIN', { templateId: req.params.id }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);
    })
);

// === Logs / Metrics ===

adminEmailsRouter.get(
    '/metrics',
    asyncHandler(async (_req: Request, res: Response) => {
        // Basic metrics for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalSent, totalFailed, logsByDay] = await Promise.all([
            EmailLog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            EmailLog.countDocuments({ status: 'failed', createdAt: { $gte: thirtyDaysAgo } }),
            EmailLog.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        sent: { $sum: 1 },
                        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        res.json(ok({
            totalSent,
            totalFailed,
            successRate: totalSent > 0 ? ((totalSent - totalFailed) / totalSent) * 100 : 0,
            chartData: logsByDay
        }));
    })
);

adminEmailsRouter.get(
    '/logs',
    asyncHandler(async (req: Request, res: Response) => {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const search = req.query.search?.toString();

        const query: Record<string, unknown> = {};
        if (search) {
            query.recipient = { $regex: search, $options: 'i' };
        }

        const [logs, total] = await Promise.all([
            EmailLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            EmailLog.countDocuments(query)
        ]);

        res.json(ok({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }));
    })
);

adminEmailsRouter.post(
    '/test',
    asyncHandler(async (req: Request, res: Response) => {
        const { to, templateName, variables } = req.body;
        if (!to || !templateName) {
            res.status(400).json({ message: 'Missing to or templateName' });
            return;
        }

        await emailService.sendEmail(to, templateName, variables || {});
        res.json(ok({ success: true }));
    })
);
