import { adminApi } from './auth.service';

export interface AdminUserListItem {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    role: string;
    lastLogin?: string;
    createdAt: string;
    cartsCount: number;
    alertsCount: number;
}

export interface AdminUserDetail {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    role: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    stats: {
        cartsCount: number;
        alertsCount: number;
        completedPurchases: number;
        totalSpent: number;
    };
    recentActivity: unknown[]; // To be defined
}

export interface ListUsersQuery {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
    users: AdminUserListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const AdminUsersService = {
    getAll: async (query: ListUsersQuery = {}): Promise<UserListResponse> => {
        const response = await adminApi.get('/users', { params: query });
        return response.data.data;
    },

    getById: async (id: string): Promise<AdminUserDetail> => {
        const response = await adminApi.get(`/users/${id}`);
        return response.data.data;
    },

    update: async (id: string, data: { isActive?: boolean; role?: string; name?: string; email?: string }): Promise<AdminUserDetail> => {
        const response = await adminApi.patch(`/users/${id}`, data);
        return response.data.data;
    },

    getSessions: async (id: string): Promise<UserSession[]> => {
        const response = await adminApi.get(`/users/${id}/sessions`);
        return response.data.data;
    },

    revokeSession: async (userId: string, sessionId: string): Promise<void> => {
        await adminApi.delete(`/users/${userId}/sessions/${sessionId}`);
    },

    revokeAllSessions: async (userId: string): Promise<void> => {
        await adminApi.delete(`/users/${userId}/sessions`);
    },
};

export interface UserSession {
    id: string;
    deviceInfo: {
        browser: string;
        os: string;
        device: string;
    };
    ipInfo: {
        ip: string;
        country?: string;
        city?: string;
        timezone?: string;
        isp?: string;
    };
    lastUsedAt: string;
    createdAt: string;
}
