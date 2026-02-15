/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminApi } from '@/services/admin/auth.service';

export interface SecurityMetrics {
    requestsToday: number;
    blockedToday: number;
    blockRate: number;
    visitorStateDistribution: Record<string, number>;
    requestsTrend?: Array<{ hour: number; count: number }>;
    topThreats?: Array<{ ip: string; count: number; lastSeen: string }>;
}

export interface SecurityLog {
    _id: string;
    eventType: string;
    visitorState: string;
    ip: string;
    visitorId?: string;
    riskScore: number;
    userId?: {
        _id: string;
        name: string;
        email: string;
    };
    metadata?: Record<string, any>;
    createdAt: string;
    ipInfo?: Record<string, any>;
}

export interface ThreatAnalysis {
    topBlockedIPs: Array<{ ip: string; count: number; country?: string; lastSeen: string }>;
    threatsByCountry: Array<{ country: string; count: number }>;
    eventTypeDistribution: Array<{ type: string; count: number }>;
    hourlyActivity: Array<{ hour: number; normal: number; suspicious: number; blocked: number }>;
}

export interface IPRule {
    _id: string;
    ip: string;
    type: 'whitelist' | 'blacklist';
    reason?: string;
    createdAt: string;
    createdBy?: string;
}

export interface UserActivity {
    userId: string;
    userName: string;
    email: string;
    sessions: Array<{
        sessionId: string;
        startTime: string;
        endTime?: string;
        events: SecurityLog[];
        ip: string;
        country?: string;
    }>;
    totalEvents: number;
    riskScore: number;
}

export const AdminSecurityService = {
    // Métricas generales
    getMetrics: async (): Promise<SecurityMetrics> => {
        const { data } = await adminApi.get('/analytics/security');
        return data.data;
    },

    // Logs con paginación y filtros
    getLogs: async (params: {
        page?: number;
        limit?: number;
        ip?: string;
        eventType?: string;
        visitorState?: string;
        userId?: string;
        dateFrom?: string;
        dateTo?: string;
    }) => {
        const { data } = await adminApi.get('/analytics/logs', { params });
        return data;
    },

    // Análisis de amenazas
    getThreatAnalysis: async (): Promise<ThreatAnalysis> => {
        const { data } = await adminApi.get('/analytics/threats');
        return data.data;
    },

    // Gestión de whitelist/blacklist
    getIPRules: async (): Promise<IPRule[]> => {
        const { data } = await adminApi.get('/security/ip-rules');
        return data.data;
    },

    addIPRule: async (rule: { ip: string; type: 'whitelist' | 'blacklist'; reason?: string }) => {
        const { data } = await adminApi.post('/security/ip-rules', rule);
        return data.data;
    },

    removeIPRule: async (id: string) => {
        const { data } = await adminApi.delete(`/security/ip-rules/${id}`);
        return data;
    },

    // Tracking de usuarios y visitantes
    getUserActivity: async (userId: string): Promise<UserActivity> => {
        const { data } = await adminApi.get(`/analytics/users/${userId}/activity`);
        return data.data;
    },

    getVisitorActivity: async (visitorId: string): Promise<any> => {
        const { data } = await adminApi.get(`/analytics/visitors/${visitorId}/activity`);
        return data.data;
    },

    getUserJourney: async (userId: string, sessionId?: string) => {
        const { data } = await adminApi.get(`/analytics/users/${userId}/journey`, {
            params: { sessionId }
        });
        return data.data;
    },

    // Detalles de IP
    getIPDetails: async (ip: string) => {
        const { data } = await adminApi.get(`/analytics/ip/${ip}`);
        return data.data;
    },

    // Exportar reportes
    exportReport: async (params: { dateFrom: string; dateTo: string; format: 'csv' | 'json' }) => {
        const { data } = await adminApi.get('/analytics/export', {
            params,
            responseType: 'blob'
        });
        return data;
    }
};
