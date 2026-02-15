import { adminApi } from './auth.service';

export const TicketStatus = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export interface TicketMessage {
    senderId: string;
    senderType: 'user' | 'admin';
    content: string;
    createdAt: string;
    senderName?: string; // Optional helper
}

export interface Ticket {
    id: string;
    ticketId: string; // Friendly ID like T-1234
    userId: string;
    userEmail?: string; // Populated
    userName?: string; // Populated
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    messages: TicketMessage[];
    assignedTo?: string; // Admin ID
    createdAt: string;
    updatedAt: string;
}

export interface ListTicketsQuery {
    page?: number;
    limit?: number;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string; // 'me' or adminId
    search?: string;
}

export interface TicketListResponse {
    tickets: Ticket[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const AdminTicketsService = {
    getAll: async (query: ListTicketsQuery = {}): Promise<TicketListResponse> => {
        const response = await adminApi.get('/tickets', { params: query });
        return response.data.data;
    },

    getById: async (id: string): Promise<Ticket> => {
        const response = await adminApi.get(`/tickets/${id}`);
        return response.data.data;
    },

    reply: async (id: string, content: string): Promise<Ticket> => {
        const response = await adminApi.post(`/tickets/${id}/reply`, { content });
        return response.data.data;
    },

    updateStatus: async (id: string, status: TicketStatus): Promise<Ticket> => {
        const response = await adminApi.patch(`/tickets/${id}/status`, { status });
        return response.data.data;
    },

    assign: async (id: string, adminId?: string): Promise<Ticket> => {
        // If no adminId provided, usually assigns to current user in backend logic or passed explicitly
        const response = await adminApi.patch(`/tickets/${id}/assign`, { adminId });
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await adminApi.get('/tickets/unread-count');
        return response.data.data.count;
    },
};
