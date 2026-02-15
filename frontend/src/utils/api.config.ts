
/**
 * Centralized API configuration to ensure consistent base URL resolution.
 * Handles variations in VITE_API_URL (e.g., matching localhost:4000, localhost:4000/api, etc.)
 * and enforces /api/v1 structure.
 */

export const getApiBaseUrl = (): string => {
    // If in production, usually use relative path or specific env
    if (import.meta.env.PROD) {
        return '/api/v1';
    }

    const envUrl = import.meta.env.VITE_API_URL;

    if (!envUrl) {
        return '/api/v1';
    }

    // Remove trailing slash if present
    const cleanUrl = envUrl.replace(/\/$/, '');

    // If URL already ends with /api/v1, return it
    if (cleanUrl.endsWith('/api/v1')) {
        return cleanUrl;
    }

    // If URL ends with /api, append /v1
    if (cleanUrl.endsWith('/api')) {
        return `${cleanUrl}/v1`;
    }

    // Otherwise, assume it's the host (e.g., http://localhost:4000) and append /api/v1
    return `${cleanUrl}/api/v1`;
};

export const API_BASE_URL = getApiBaseUrl();
