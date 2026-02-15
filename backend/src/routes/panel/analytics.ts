import { Router, type Request, type Response } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/response.js';
import { User } from '../../models/User.js';
import { Ticket } from '../../models/Ticket.js';
import { Activity } from '../../models/Activity.js';
import { Session } from '../../models/Session.js';
import { IPRule } from '../../models/IPRule.js';
import { Product } from '../../models/ProductEnhanced.js';
import { redisClient } from '../../config/redis.js';

export const adminAnalyticsRouter = Router();
adminAnalyticsRouter.use(requireAdmin);

adminAnalyticsRouter.get(
  '/products',
  asyncHandler(async (_req: Request, res: Response) => {
    const [total, available, unavailable] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ available: true }),
      Product.countDocuments({ available: false })
    ]);

    res.json(ok({
      total,
      available,
      unavailable
    }));
  })
);

adminAnalyticsRouter.get(
  '/overview',
  asyncHandler(async (_req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const [usersTotal, ticketsTotal, ticketsOpen, redisReq, redisBlock] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'OPEN' }),
      redisClient.get(`security:req:${todayStr}`),
      redisClient.get(`security:block:${todayStr}`)
    ]);

    let reqToday = parseInt(redisReq || '0');
    let blockToday = parseInt(redisBlock || '0');

    // Fallback a DB solo si Redis está vacío (p.ej. reinicio de caché)
    if (reqToday === 0) {
      const dbStats = await Activity.aggregate([
        { $match: { createdAt: { $gte: today } } },
        {
          $group: {
            _id: null,
            requestsToday: { $sum: 1 },
            blockedToday: { $sum: { $cond: [{ $eq: ['$visitorState', 'blocked'] }, 1, 0] } }
          }
        }
      ]);
      if (dbStats[0]) {
        reqToday = dbStats[0].requestsToday;
        blockToday = dbStats[0].blockedToday;
      }
    }

    res.json(
      ok({
        users: { total: usersTotal },
        tickets: { total: ticketsTotal, open: ticketsOpen },
        security: {
          requestsToday: reqToday,
          blockedToday: blockToday,
          blockRate: reqToday > 0 ? (blockToday / reqToday) * 100 : 0
        },
      })
    );
  })
);

adminAnalyticsRouter.get(
  '/users',
  asyncHandler(async (_req: Request, res: Response) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [total, newThisWeek, newThisMonth] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: weekAgo } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: monthAgo } }),
    ]);

    res.json(ok({ total, newThisWeek, newThisMonth }));
  })
);


adminAnalyticsRouter.get(
  '/security',
  asyncHandler(async (_req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = today.toISOString().split('T')[0];
    const [redisReq, redisBlock, visitorStateDistribution] = await Promise.all([
      redisClient.get(`security:req:${todayStr}`),
      redisClient.get(`security:block:${todayStr}`),
      Activity.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: '$visitorState', count: { $sum: 1 } } }
      ])
    ]);

    let reqToday = parseInt(redisReq || '0');
    let blockToday = parseInt(redisBlock || '0');

    // Fallback
    if (reqToday === 0) {
      reqToday = await Activity.countDocuments({ createdAt: { $gte: today } });
      blockToday = await Activity.countDocuments({ createdAt: { $gte: today }, visitorState: 'blocked' });
    }

    const stats = visitorStateDistribution.reduce((acc: Record<string, number>, curr: { _id?: string; count: number }) => {
      acc[curr._id || 'ok'] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    // Tendencia de las últimas 24 horas
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const trend = await Activity.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const requestsTrend = trend.map(t => ({ hour: t._id, count: t.count }));

    res.json(ok({
      requestsToday: reqToday,
      blockedToday: blockToday,
      blockRate: reqToday > 0 ? (blockToday / reqToday) * 100 : 0,
      visitorStateDistribution: stats,
      requestsTrend
    }));
  })
);

adminAnalyticsRouter.get(
  '/logs',
  asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const ip = req.query.ip ? String(req.query.ip) : undefined;

    const filter: Record<string, unknown> = {};
    if (ip) {
      filter.$or = [
        { ip: { $regex: ip, $options: 'i' } },
        { visitorId: { $regex: ip, $options: 'i' } }
      ];
    }

    const [logs, total] = await Promise.all([
      Activity.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Activity.countDocuments(filter),
    ]);

    // Población manual segura
    const uIds = [...new Set(logs.map(l => l.userId).filter(id => id && /^[0-9a-fA-F]{24}$/.test(id.toString())))];
    const users = await User.find({ _id: { $in: uIds } }).select('name email').lean();
    const usersMap = new Map(users.map(u => [u._id.toString(), u]));

    res.json({
      data: logs.map((log) => ({
        _id: log._id.toString(),
        userId: log.userId ? (usersMap.get(log.userId.toString()) || { _id: log.userId, name: log.userId }) : undefined,
        eventType: log.eventType || 'REQUEST',
        visitorState: log.visitorState || 'ok',
        ip: log.ip,
        visitorId: log.visitorId,
        sessionId: log.sessionId,
        riskScore: log.visitorState === 'blocked' ? 100 : (log.visitorState === 'suspicious' ? 50 : 0),
        createdAt: log.createdAt?.toISOString(),
        ipInfo: log.ipInfo,
        metadata: { path: log.path, method: log.method, status: log.status },
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  })
);

adminAnalyticsRouter.get(
  '/traffic-history',
  asyncHandler(async (req: Request, res: Response) => {
    const range = req.query.range === '7d' ? 7 : 1;
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Inicio del día actual
    if (range === 7) {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 1); // Últimas 24h
    }

    const activities = await Activity.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const grouped: Record<string, { requests: number; blocked: number; uniqueVisitors: Set<string> }> = {};

    // Pre-llenar intervalos para garantizar que el gráfico no esté vacío
    const now = new Date();
    if (range === 1) {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(d.getHours() - i, 0, 0, 0);
        const key = `${d.getHours()}:00`;
        grouped[key] = { requests: 0, blocked: 0, uniqueVisitors: new Set() };
      }
    } else {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        grouped[key] = { requests: 0, blocked: 0, uniqueVisitors: new Set() };
      }
    }

    activities.forEach(activity => {
      const date = new Date(activity.createdAt!);
      const key = range === 7
        ? date.toISOString().split('T')[0]
        : `${date.getHours()}:00`;

      if (grouped[key]) {
        grouped[key].requests++;
        if (activity.visitorState === 'blocked') grouped[key].blocked++;
        if (activity.visitorId) grouped[key].uniqueVisitors.add(activity.visitorId);
      }
    });

    const data = Object.entries(grouped).map(([timestamp, stats]) => {
      let displayTime = timestamp;
      if (range === 7) {
        const [, m, d] = timestamp.split('-');
        displayTime = `${d}/${m}`;
      }

      return {
        timestamp,
        displayTime,
        requests: stats.requests,
        blocked: stats.blocked,
        visitors: stats.uniqueVisitors.size
      };
    });

    res.json(ok(data));
  })
);

adminAnalyticsRouter.get(
  '/threats',
  asyncHandler(async (_req: Request, res: Response) => {
    const topBlockedIPs = await Activity.aggregate([
      { $match: { visitorState: 'blocked' } },
      {
        $group: {
          _id: '$ip',
          count: { $sum: 1 },
          lastSeen: { $max: '$createdAt' },
          country: { $first: '$ipInfo.country' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          ip: '$_id',
          count: 1,
          lastSeen: 1,
          country: 1
        }
      }
    ]);

    const threatsByCountry = await Activity.aggregate([
      { $match: { visitorState: 'blocked' } },
      {
        $group: {
          _id: '$ipInfo.country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          country: '$_id',
          count: 1
        }
      }
    ]);

    const eventTypeDistribution = await Activity.aggregate([
      { $match: { visitorState: 'blocked' } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const hourlyActivity = await Activity.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            state: '$visitorState'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.hour',
          normal: { $sum: { $cond: [{ $eq: ['$_id.state', 'ok'] }, '$count', 0] } },
          suspicious: { $sum: { $cond: [{ $eq: ['$_id.state', 'suspicious'] }, '$count', 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$_id.state', 'blocked'] }, '$count', 0] } }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', _id: 0, normal: 1, suspicious: 1, blocked: 1 } }
    ]);

    res.json(ok({
      topBlockedIPs,
      threatsByCountry,
      eventTypeDistribution,
      hourlyActivity
    }));
  })
);

adminAnalyticsRouter.get(
  '/users/:userId/activity',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const sessions = await Session.find({ userId }).sort({ lastUsedAt: -1 }).lean();
    const totalEvents = await Activity.countDocuments({ userId });

    // Calcular un risk score simple basado en IPs únicas y estados
    const uniqueIPs = await Activity.distinct('ip', { userId });
    const suspiciousEvents = await Activity.countDocuments({ userId, visitorState: { $in: ['blocked', 'suspicious'] } });
    const riskScore = Math.min(100, (uniqueIPs.length * 5) + (suspiciousEvents * 10));

    res.json(ok({
      userId: user._id,
      userName: user.name,
      email: user.email,
      totalEvents,
      riskScore,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessions: await Promise.all(sessions.map(async (s: any) => {
        const events = await Activity.find({
          userId,
          sessionId: s._id.toString()
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        return {
          sessionId: s._id,
          startTime: s.createdAt,
          lastUsedAt: s.lastUsedAt,
          ip: s.ip,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          country: (s.ipInfo as any)?.country,
          events: events.map(e => ({
            ...e,
            _id: e._id.toString()
          }))
        };
      }))
    }));
  })
);

adminAnalyticsRouter.get(
  '/ip/:ip',
  asyncHandler(async (req: Request, res: Response) => {
    const { ip } = req.params;
    const info = await IPRule.findOne({ ip }).lean();
    const activity = await Activity.find({ ip }).sort({ createdAt: -1 }).limit(50).lean();

    res.json(ok({
      ip,
      rule: info,
      activity: activity.map(a => ({
        ...a,
        _id: a._id.toString()
      }))
    }));
  })
);

adminAnalyticsRouter.get(
  '/visitors/:visitorId/activity',
  asyncHandler(async (req: Request, res: Response) => {
    const { visitorId } = req.params;

    // Buscar todas las actividades de este visitante, agrupadas por sesión
    const activities = await Activity.find({ visitorId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Intentar encontrar si este visitante se vinculó a algún usuario (excluyendo legacy demo-user)
    const linkedUser = await Activity.findOne({
      visitorId,
      userId: { $exists: true, $ne: null, $nin: ['demo-user'] }
    }).select('userId').lean();

    let userData = null;
    if (linkedUser?.userId && /^[0-9a-fA-F]{24}$/.test(linkedUser.userId.toString())) {
      userData = await User.findById(linkedUser.userId).select('name email').lean();
    }

    // Población manual segura para los eventos
    const uIds = [...new Set(activities.map(l => l.userId).filter(id => id && /^[0-9a-fA-F]{24}$/.test(id.toString())))];
    const users = await User.find({ _id: { $in: uIds } }).select('name email').lean();
    const usersMap = new Map(users.map(u => [u._id.toString(), u]));

    // Agrupar por sessionId
    const sessionsMap = activities.reduce((acc, activity) => {
      const sId = activity.sessionId || 'unknown';
      if (!acc[sId]) {
        acc[sId] = {
          sessionId: sId,
          lastSeen: activity.createdAt,
          firstSeen: activity.createdAt,
          events: []
        };
      }

      const enrichedEvent = {
        ...activity,
        userId: activity.userId ? (usersMap.get(activity.userId.toString()) || { _id: activity.userId, name: activity.userId }) : undefined
      };

      acc[sId].events.push(enrichedEvent);
      if (new Date(activity.createdAt!) > new Date(acc[sId].lastSeen!)) acc[sId].lastSeen = activity.createdAt;
      if (new Date(activity.createdAt!) < new Date(acc[sId].firstSeen!)) acc[sId].firstSeen = activity.createdAt;

      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any>);

    res.json(ok({
      visitorId,
      user: userData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessions: Object.values(sessionsMap).sort((a: any, b: any) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    }));
  })
);

adminAnalyticsRouter.get(
  '/export',
  asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo, format: exportFormat } = req.query as { dateFrom?: string; dateTo?: string; format?: 'csv' | 'json' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const activity = await Activity.find(filter).sort({ createdAt: -1 }).limit(1000).lean();

    if (exportFormat === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=security-report.json');
      res.json(activity);
      return;
    }

    // CSV fallback simple
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=security-report.csv');

    const headers = ['date', 'ip', 'method', 'path', 'status', 'state', 'type'];
    const rows = activity.map(a => [
      a.createdAt?.toISOString(),
      a.ip,
      a.method,
      a.path,
      a.status,
      a.visitorState,
      a.eventType
    ].join(','));

    res.send([headers.join(','), ...rows].join('\n'));
  })
);
