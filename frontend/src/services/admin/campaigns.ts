import { apiClient } from '../api/client';

export interface Campaign {
    _id: string;
    code: string;
    destinationUrl?: string;
    isActive: boolean;
    metrics: {
        visits: number;
        conversions: number;
    };
    dailyMetrics?: {
        date: string;
        visits: number;
        conversions: number;
    }[];
    createdAt: string;
}

export const campaignsService = {
    getAll: async () => {
        const response = await apiClient.get<{ data: Campaign[] }>('/panel/campaigns');
        return response.data.data;
    },

    create: async (data: { code: string; destinationUrl?: string }) => {
        const response = await apiClient.post<{ data: Campaign }>('/panel/campaigns', data);
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<{ data: Campaign }>(`/panel/campaigns/${id}`);
        return response.data.data;
    },

    toggleStatus: async (id: string, isActive: boolean) => {
        const response = await apiClient.patch<{ data: Campaign }>(`/panel/campaigns/${id}`, { isActive });
        return response.data.data;
    }
};
