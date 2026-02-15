import { adminApi } from './auth.service';

export interface DashboardOverview {
    users: {
        total: number;
    };
    tickets: {
        total: number;
        open: number;
    };
    security: {
        requestsToday: number;
        blockedToday: number;
        blockRate: number;
    };
}

export interface SecurityMetric {
    requestsToday: number;
    blockedToday: number;
    blockRate: number;
    visitorStateDistribution: Record<string, number>;
}

export interface UserMetric {
    total: number;
    newThisWeek: number;
    newThisMonth: number;
}

export interface ProductMetric {
    total: number;
    available: number;
    unavailable: number;
}

export interface SecurityLog {
    _id: string;
    eventType: string;
    visitorState: string;
    ip: string;
    riskScore: number;
    createdAt: string;
    userId?: {
        name: string;
        email: string;
    };
    metadata?: Record<string, unknown>;
}

export const AdminAnalyticsService = {
    getOverview: async (): Promise<DashboardOverview> => {
        const response = await adminApi.get<{ data: DashboardOverview }>('/analytics/overview');
        return response.data.data;
    },

    getUserMetrics: async (): Promise<UserMetric> => {
        const response = await adminApi.get<{ data: UserMetric }>('/analytics/users');
        return response.data.data;
    },

    getProductMetrics: async (): Promise<ProductMetric> => {
        const response = await adminApi.get<{ data: ProductMetric }>('/analytics/products');
        return response.data.data;
    },

    getSecurityMetrics: async (): Promise<SecurityMetric> => {
        const response = await adminApi.get<{ data: SecurityMetric }>('/analytics/security');
        return response.data.data;
    },

    getRecentLogs: async (query: { page?: number; limit?: number; userId?: string; ip?: string; eventType?: string; visitorState?: string } = {}) => {
        const response = await adminApi.get<{ data: SecurityLog[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>('/analytics/logs', { params: query });
        return response.data;
    },

    async getTrafficHistory(range: '24h' | '7d' = '24h'): Promise<TrafficHistoryItem[]> {
        const response = await adminApi.get<{ data: TrafficHistoryItem[] }>('/analytics/traffic-history', { params: { range } });
        return response.data.data;
    }
};
export interface TrafficHistoryItem {
    timestamp: string;
    displayTime: string;
    requests: number;
    blocked: number;
    visitors: number;
}
