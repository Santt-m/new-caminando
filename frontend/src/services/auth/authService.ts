import axios from 'axios';
import {
    type User,
    type RegisterRequest,
    type LoginRequest,
    type UpdateProfileRequest,
    type UpdatePreferencesRequest,
    type ChangePasswordRequest,
    type ForgotPasswordRequest,
    type ResetPasswordRequest,
} from './types';

import { API_BASE_URL as API_URL } from '@/utils/api.config';

// Instance for User API
const api = axios.create({
    baseURL: `${API_URL}/auth`,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

import { authTokenManager } from './authTokenManager';

api.interceptors.request.use((config) => {
    const token = authTokenManager.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // NO intentar refrescar si el error viene de /refresh (previene bucle infinito)
        if (originalRequest.url?.includes('/refresh')) {
            return Promise.reject(error.response?.data || { message: 'Session expired' });
        }

        // Si es 401
        if (error.response?.status === 401) {
            // Si es un chequeo silencioso (/me) y no tenemos token en memoria,
            // simplemente rechazamos sin loguear error ni intentar refrescar
            if (originalRequest.url?.includes('/me') && !authTokenManager.hasToken()) {
                return Promise.reject(error);
            }

            // Si no es un reintento, intentamos refrescar
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Intentar refrescar token
                    const newToken = await authService.refresh();
                    authTokenManager.setToken(newToken);

                    // Actualizar header y reintentar
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Si falla el refresco (cookie expirada o inexistente), limpiamos
                    authTokenManager.clearToken();
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error.response?.data || { message: 'An error occurred' });
    }
);

export const authService = {
    async register(data: RegisterRequest): Promise<User> {
        const response = await api.post<{ success: boolean; data: { user: User } }>('/register', data);
        return response.data.data.user;
    },

    async login(data: LoginRequest): Promise<User> {
        const response = await api.post<{ success: boolean; data: { user: User } }>('/login', data);
        return response.data.data.user;
    },

    async me(): Promise<User> {
        const response = await api.get<{ success: boolean; data: User }>('/me');
        return response.data.data;
    },

    async logout(): Promise<void> {
        await api.post('/logout');
    },

    async refresh(): Promise<string> {
        const response = await api.post<{ success: boolean; data: { accessToken: string } }>('/refresh');
        return response.data.data.accessToken;
    },

    async updateProfile(data: UpdateProfileRequest): Promise<User> {
        const response = await api.patch<{ success: boolean; data: { user: User } }>('/profile', data);
        return response.data.data.user;
    },

    async updatePreferences(data: UpdatePreferencesRequest): Promise<User> {
        const response = await api.patch<{ success: boolean; data: { user: User } }>('/preferences', data);
        return response.data.data.user;
    },

    async updateDashboardConfig(data: any): Promise<User> {
        const response = await api.patch<{ success: boolean; data: { user: User } }>('/dashboard-config', data);
        return response.data.data.user;
    },

    async changePassword(data: ChangePasswordRequest): Promise<void> {
        await api.post('/change-password', data);
    },

    async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
        await api.post('/forgot-password', data);
    },

    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        await api.post('/reset-password', data);
    },

    async verifyEmail(token: string): Promise<void> {
        await api.post('/verify-email', { token });
    },

    initiateGoogleOAuth(redirectUrl?: string): void {
        const url = new URL(`${API_URL}/auth/google`);
        if (redirectUrl) url.searchParams.append('redirect', redirectUrl);
        window.location.href = url.toString();
    },

    async loginWithGoogle(): Promise<User> {
        // Usually handled via redirect, this might be a polling or popup callback
        return this.me();
    },

    async registerWithGoogle(): Promise<User> {
        return this.me();
    },
};

// Export the api instance to allow setting headers/interceptors from outside
export { api };
