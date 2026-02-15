import { Router, type Request, type Response } from 'express';
import { User } from '../../models/User.js';
import { Session } from '../../models/Session.js';
import { Activity } from '../../models/Activity.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { success, error } from '../../utils/response.js';
import { requireAdmin } from '../../middlewares/auth.js';
import { logAudit } from '../../utils/logger.js';

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAdmin);

adminUsersRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const search = String(req.query.search ?? '');

    const filter: Record<string, unknown> = { role: 'user' };
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return success(res, {
      users: users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        isActive: u.isActive,
        role: u.role,
        lastLogin: u.updatedAt?.toISOString(),
        createdAt: u.createdAt?.toISOString(),
        alertsCount: 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

adminUsersRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    const recentActivity = await Activity.find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(10);

    return success(res, {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      role: user.role,
      permissions: ['*'],
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      lastLogin: user.updatedAt?.toISOString(),
      stats: {
        alertsCount: 0,
        completedPurchases: 0,
        totalSpent: 0,
      },
      recentActivity,
    });
  })
);

adminUsersRouter.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return error(res, 'User not found', 404);
    }

    logAudit('User updated by admin', 'ADMIN', { targetUserId: user._id.toString(), changes: req.body }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

    return success(res, {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      role: user.role,
      permissions: ['*'],
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      lastLogin: user.updatedAt?.toISOString(),
      stats: {
        alertsCount: 0,
        completedPurchases: 0,
        totalSpent: 0,
      },
      recentActivity: [],
    }, 'User updated successfully');
  })
);

adminUsersRouter.get(
  '/:id/sessions',
  asyncHandler(async (req: Request, res: Response) => {
    const sessions = await Session.find({ userId: req.params.id }).sort({ createdAt: -1 });

    return success(res, sessions.map((s) => {
      const ipInfo = (s.ipInfo ?? {}) as Record<string, unknown>;
      return {
        id: s._id.toString(),
        deviceInfo: {
          browser: s.userAgent,
          os: 'unknown',
          device: s.deviceId,
        },
        ipInfo: {
          ip: s.ip,
          country: typeof ipInfo['country'] === 'string' ? ipInfo['country'] : undefined,
          city: typeof ipInfo['city'] === 'string' ? ipInfo['city'] : undefined,
          timezone: typeof ipInfo['timezone'] === 'string' ? ipInfo['timezone'] : undefined,
          isp: typeof ipInfo['isp'] === 'string' ? ipInfo['isp'] : undefined,
        },
        lastUsedAt: s.lastUsedAt?.toISOString() ?? s.updatedAt?.toISOString(),
        createdAt: s.createdAt?.toISOString(),
      };
    })
    );
  })
);

adminUsersRouter.delete(
  '/:id/sessions/:sessionId',
  asyncHandler(async (req: Request, res: Response) => {
    await Session.findByIdAndUpdate(req.params.sessionId, { revokedAt: new Date() });

    logAudit('User session revoked by admin', 'ADMIN', { targetUserId: req.params.id, sessionId: req.params.sessionId }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

    return success(res, { revoked: true }, 'Session revoked successfully');
  })
);

adminUsersRouter.delete(
  '/:id/sessions',
  asyncHandler(async (req: Request, res: Response) => {
    await Session.updateMany({ userId: req.params.id }, { revokedAt: new Date() });

    return success(res, { revoked: true }, 'All sessions revoked successfully');
  })
);
