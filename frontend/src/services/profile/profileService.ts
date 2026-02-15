import { apiClient } from '../api/client';
import { z } from 'zod';
import type { User } from '../auth/types';

const UserResponseSchema = z.object({
    user: z.any(), // Usa el schema User completo de types.ts
});

// Re-exportar tipos de auth/types.ts para mantener compatibilidad
export type { UpdateProfileRequest, UpdatePreferencesRequest } from '../auth/types';

export const profileService = {
    /**
     * Actualizar perfil del usuario
     */
    async updateProfile(data: Record<string, unknown>): Promise<User> {
        const response = await apiClient.patch('/auth/profile', data);
        const validated = UserResponseSchema.parse(response.data);
        return validated.user;
    },

    /**
     * Actualizar preferencias del usuario
     */
    async updatePreferences(data: Record<string, unknown>): Promise<User> {
        const response = await apiClient.patch('/auth/preferences', data);
        const validated = UserResponseSchema.parse(response.data);
        return validated.user;
    },
};
