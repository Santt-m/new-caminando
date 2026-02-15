import axios from 'axios';
import { authTokenManager } from '../auth/authTokenManager';

import { API_BASE_URL } from '@/utils/api.config';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // Importante para httpOnly cookies (refresh token)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de REQUEST - Agregar access token a todas las peticiones
apiClient.interceptors.request.use(
    (config) => {
        // Agregar access token desde memoria si existe
        const accessToken = authTokenManager.getToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // CSRF token (si existe)
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de RESPONSE - Manejar errores
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // User Auth is deprecated, so we no longer attempt to refresh tokens for public user.
        return Promise.reject(error);
    }
);
