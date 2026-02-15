/**
 * AuthTokenManager - Gestión segura de access tokens en memoria
 * 
 * Los access tokens se almacenan SOLO en memoria (no en localStorage ni sessionStorage)
 * para máxima seguridad. Al recargar la página, el token se pierde y se obtiene uno
 * nuevo usando el refresh token (almacenado en httpOnly cookie).
 */

class AuthTokenManager {
    private accessToken: string | null = null;

    /**
     * Guarda el access token en memoria
     */
    setToken(token: string): void {
        this.accessToken = token;
    }

    /**
     * Obtiene el access token actual
     */
    getToken(): string | null {
        return this.accessToken;
    }

    /**
     * Limpia el access token (usado en logout)
     */
    clearToken(): void {
        this.accessToken = null;
    }

    /**
     * Verifica si hay un token guardado
     */
    hasToken(): boolean {
        return this.accessToken !== null;
    }
}

// Exportar instancia única (singleton)
export const authTokenManager = new AuthTokenManager();
