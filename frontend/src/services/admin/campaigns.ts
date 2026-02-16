import { adminApi } from './auth.service';

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
        const response = await adminApi.get<{ data: Campaign[] }>('/campaigns');
        return response.data.data;
    },

    create: async (data: { code: string; destinationUrl?: string }) => {
        const response = await adminApi.post<{ data: Campaign }>('/campaigns', data);
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await adminApi.get<{ data: Campaign }>(`/campaigns/${id}`);
        return response.data.data;
    },

    toggleStatus: async (id: string, isActive: boolean) => {
        const response = await adminApi.patch<{ data: Campaign }>(`/campaigns/${id}`, { isActive });
        return response.data.data;
    }
};
