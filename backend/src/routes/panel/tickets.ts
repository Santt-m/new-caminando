import { Router, type Request, type Response } from 'express';
import { Ticket } from '../../models/Ticket.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/response.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { logAudit } from '../../utils/logger.js';

export const adminTicketsRouter = Router();
adminTicketsRouter.use(requireAdmin);

adminTicketsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Ticket.countDocuments(filter),
    ]);

    res.json(
      ok({
        tickets,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  })
);

adminTicketsRouter.get(
  '/unread-count',
  asyncHandler(async (_req: Request, res: Response) => {
    const count = await Ticket.countDocuments({ status: 'OPEN' });
    res.json(ok({ count }));
  })
);

adminTicketsRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    res.json(ok(ticket));
  })
);

adminTicketsRouter.post(
  '/:id/reply',
  asyncHandler(async (req: Request, res: Response) => {
    const { content } = req.body as { content?: string };
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    ticket.messages.push({
      senderId: req.userId ?? 'admin',
      senderType: 'admin',
      content: content ?? '',
      createdAt: new Date(),
    });
    await ticket.save();

    logAudit('Ticket replied by admin', 'SUPPORT', { ticketId: ticket._id.toString() }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

    res.json(ok(ticket));
  })
);

adminTicketsRouter.patch(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as { status?: string };
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    res.json(ok(ticket));
  })
);

adminTicketsRouter.patch(
  '/:id/assign',
  asyncHandler(async (req: Request, res: Response) => {
    const { adminId } = req.body as { adminId?: string };
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { assignedTo: adminId }, { new: true });
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    res.json(ok(ticket));
  })
);
