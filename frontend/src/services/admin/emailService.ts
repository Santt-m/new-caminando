import { adminApi } from './auth.service';

export interface EmailTemplate {
    _id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EmailMetrics {
    totalSent: number;
    totalFailed: number;
    successRate: number;
    chartData: Array<{
        _id: string;
        sent: number;
        failed: number;
    }>;
}

export interface EmailLog {
    _id: string;
    recipient: string;
    templateName: string;
    status: 'success' | 'failed';
    error?: string;
    metadata?: any;
    createdAt: string;
}

export interface EmailLogsResponse {
    logs: EmailLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Service for managing email templates, metrics and settings.
 * Uses adminApi (base: /panel)
 */
export const adminEmailService = {
    async getTemplates(): Promise<EmailTemplate[]> {
        const response = await adminApi.get('/emails/templates');
        return response.data.data;
    },

    async getTemplate(id: string): Promise<EmailTemplate> {
        const response = await adminApi.get(`/emails/templates/${id}`);
        return response.data.data;
    },

    async createTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const response = await adminApi.post('/emails/templates', data);
        return response.data.data;
    },

    async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const response = await adminApi.patch(`/emails/templates/${id}`, data);
        return response.data.data;
    },

    async deleteTemplate(id: string): Promise<void> {
        const response = await adminApi.delete(`/emails/templates/${id}`);
        return response.data;
    },

    async getMetrics(): Promise<EmailMetrics> {
        const response = await adminApi.get('/emails/metrics');
        return response.data.data;
    },

    async sendTestEmail(to: string, templateName: string, variables: Record<string, any>): Promise<void> {
        await adminApi.post('/emails/test', { to, templateName, variables });
    },

    async getLogs(page = 1, limit = 20, search?: string): Promise<EmailLogsResponse> {
        const response = await adminApi.get('/emails/logs', {
            params: { page, limit, search }
        });
        return response.data.data;
    }
};
