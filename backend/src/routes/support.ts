import { Router, type Request, type Response } from 'express';
import { Ticket } from '../models/Ticket.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';
import { logAudit } from '../utils/logger.js';

export const supportRouter = Router();

supportRouter.post(
    '/tickets',
    asyncHandler(async (req: Request, res: Response) => {
        const { email, subject, message, type, metadata } = req.body;

        const userId = req.userId || `guest_${uuidv4().split('-')[0]}`;
        const ticketId = `T-${Date.now().toString(36).toUpperCase()}-${uuidv4().split('-')[0].toUpperCase()}`;

        const ticket = await Ticket.create({
            ticketId,
            userId,
            userEmail: email,
            userName: 'Guest User',
            status: 'OPEN',
            priority: 'MEDIUM',
            category: type || 'general',
            subject,
            metadata,
            messages: [
                {
                    senderId: userId,
                    senderType: 'user',
                    senderName: email || 'Guest',
                    content: message,
                    createdAt: new Date(),
                }
            ]
        });

        res.status(201).json(ok(ticket));

        logAudit(`Ticket created: ${ticketId}`, 'SUPPORT',
            { ticketId, subject, type: type || 'general', email },
            { ip: req.ip, userAgent: req.headers['user-agent'] },
            req.userId
        );
    })
);
