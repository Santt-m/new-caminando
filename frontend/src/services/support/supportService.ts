import { apiClient } from '../api/client';
import type { CreateTicketDTO } from './types';

export const supportService = {
    createTicket: async (data: CreateTicketDTO): Promise<void> => {
        try {
            await apiClient.post('/support/tickets', data);
        } catch (error) {
            console.error('[SupportService] Error creating ticket:', error);
            throw error;
        }
    }
};
