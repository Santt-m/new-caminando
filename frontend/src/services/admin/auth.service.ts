import axios from 'axios';
import { z } from 'zod';

import { API_BASE_URL as API_URL } from '@/utils/api.config';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
}

export interface AdminAuthResponse {
    accessToken: string;
    admin: AdminUser;
}

// Interceptor para inyectar token (OBSOLETO: Ahora usa Cookies HTTPOnly)
const adminApi = axios.create({
    baseURL: `${API_URL}/panel`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // IMPORTANTE: Enviar cookies
});

// Variables para manejar el refresco de token sincronizado
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Interceptor para manejar 401 mediante refresco automático
adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Evitar bucles si el error viene del refresh mismo
        if (originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    // Marcar como reintento antes de volver a intentar
                    originalRequest._retry = true;
                    // Delay para asegurar que las cookies se procesen
                    return new Promise(resolve => setTimeout(resolve, 150)).then(() => adminApi(originalRequest));
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await AdminAuthService.refresh();
                processQueue(null);

                // Esperar a que las cookies se asienten y reintentar
                await new Promise(resolve => setTimeout(resolve, 200));
                return adminApi(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('admin_user');

                const isAlreadyInLogin = window.location.pathname === '/panel/login';
                if (!isAlreadyInLogin) {
                    window.location.href = '/panel/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Helper to get or create deviceId
const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
};

export const AdminAuthService = {
    login: async (credentials: LoginCredentials): Promise<AdminAuthResponse> => {
        // La respuesta del backend devuelve { success: true, data: { admin: ... } }
        // El token ya no viene en el body, se setea en la cookie automáticamente.
        const deviceId = getDeviceId();
        const response = await adminApi.post<{ success: boolean; data: { admin: AdminUser } }>('/auth/login', {
            ...credentials,
            deviceId
        });

        const authData = response.data.data;

        if (authData?.admin) {
            console.log('[AdminAuthService] Login exitoso');
            localStorage.setItem('admin_user', JSON.stringify(authData.admin));
            // Devolvemos estructura compatible con la interfaz esperada por el contexto
            return {
                accessToken: 'cookie', // Dummy value
                admin: authData.admin
            };
        }

        throw new Error('Respuesta de login inválida');
    },

    logout: async () => {
        try {
            await adminApi.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('admin_user');
        }
    },

    getCurrentUser: async (): Promise<AdminUser> => {
        const response = await adminApi.get<{ success: boolean, data: AdminUser }>('/auth/me');
        return response.data.data;
    },

    refresh: async (): Promise<void> => {
        // Llama al endpoint de refresh del panel que ya configuramos en el backend
        // El backend seteará las nuevas cookies adminAccess y adminRefresh automáticamente
        await adminApi.post('/auth/refresh');
    },

    // Ya no podemos verificar token en localStorage
    // El estado de autenticación debe inferirse de una llamada exitosa a getCurrentUser
    getStoredUser: (): AdminUser | null => {
        const userStr = localStorage.getItem('admin_user');
        return userStr ? JSON.parse(userStr) : null;
    },
};

export { adminApi };
