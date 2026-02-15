import { useState, useEffect, type ReactNode } from 'react';
import { AdminAuthService } from '@/services/admin/auth.service';
import type { AdminUser, LoginCredentials } from '@/services/admin/auth.service';
import { AdminAuthContext } from './context';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const storedUser = AdminAuthService.getStoredUser();

            // Si no hay rastro de usuario en localStorage, asumimos que no hay sesión
            // Esto evita la petición inicial /auth/me que genera un 401 ruidoso
            if (!storedUser) {
                setIsLoading(false);
                setIsAuthenticated(false);
                return;
            }

            try {
                // Si había un usuario guardado, validamos con el servidor
                const user = await AdminAuthService.getCurrentUser();
                setAdmin(user);
                setIsAuthenticated(true);
                localStorage.setItem('admin_user', JSON.stringify(user));
            } catch {
                // Si falla (401), limpiamos
                setAdmin(null);
                setIsAuthenticated(false);
                localStorage.removeItem('admin_user');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await AdminAuthService.login(credentials);
            setAdmin(response.admin);
            setIsAuthenticated(true);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AdminAuthService.logout();
            setAdmin(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminAuthContext.Provider value={{ admin, isLoading, isAuthenticated, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
