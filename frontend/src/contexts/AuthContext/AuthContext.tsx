import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from './context';
import { authService } from '@/services/auth/authService';
import { handleApiError } from '@/services/api/errors';
import { useToast } from '@/hooks/useToast';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { User } from '@/services/auth/types';
import type { ThemeName } from '@/styles/tokens';
import type { Language } from '@/contexts/LanguageContext';
import { traducciones } from './traduccion';
import { authTokenManager } from '@/services/auth/authTokenManager';


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const { setTheme } = useTheme();
    const { setLanguage, t } = useLanguage();

    // Helper para sincronizar preferencias
    const syncUserPreferences = useCallback((user: User) => {
        if (user.language) {
            setLanguage(user.language as Language);
            localStorage.setItem('language', user.language);
        }
        if (user.preferences?.theme) {
            setTheme(user.preferences.theme as ThemeName);
            localStorage.setItem('theme', user.preferences.theme);
        }
    }, [setLanguage, setTheme]);

    // Obtener usuario actual al cargar la app
    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        try {
            // Intentar restaurar sesión usando refresh token (cookie)
            // Solo lo intentamos si hay un indicio de sesión previa en localStorage
            // para evitar ruidos de 401 en la consola si el usuario nunca se logueó.
            const hasSessionHint = localStorage.getItem('auth_session_hint') === 'true';

            if (!authTokenManager.hasToken()) {
                if (!hasSessionHint) {
                    setIsLoading(false);
                    return;
                }

                try {
                    const token = await authService.refresh();
                    authTokenManager.setToken(token);
                } catch {
                    // Si el refresco falla, el hint era mentira, lo quitamos
                    localStorage.removeItem('auth_session_hint');
                    setUser(null);
                    authTokenManager.clearToken();
                    setIsLoading(false);
                    return;
                }
            }

            const userData = await authService.me();
            setUser(userData);
            syncUserPreferences(userData);
            localStorage.setItem('auth_session_hint', 'true');
        } catch (error) {
            setUser(null);
            authTokenManager.clearToken();
        } finally {
            setIsLoading(false);
        }
    }, [syncUserPreferences]);

    // Ejecutar solo una vez al montar
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string, rememberMe?: boolean) => {
        try {
            const loggedUser = await authService.login({ email, password, rememberMe });
            setUser(loggedUser);
            syncUserPreferences(loggedUser);
            localStorage.setItem('auth_session_hint', 'true');
            showToast({ message: t(traducciones, 'loginSuccess'), type: 'success' });
        } catch (error) {
            const apiError = handleApiError(error);
            showToast({ message: apiError.message, type: 'error' });
            throw apiError;
        }
    };

    const register = async (data: {
        email: string;
        password: string;
        name: string;
        acceptTerms: boolean;
        language?: 'es' | 'en' | 'pt';
    }) => {
        try {
            const newUser = await authService.register(data);
            setUser(newUser);
            syncUserPreferences(newUser);
            localStorage.setItem('auth_session_hint', 'true');
            showToast({ message: t(traducciones, 'registerSuccess'), type: 'success' });
        } catch (error) {
            const apiError = handleApiError(error);
            showToast({ message: apiError.message, type: 'error' });
            throw apiError;
        }
    };

    const loginWithGoogle = async () => {
        try {
            const loggedUser = await authService.loginWithGoogle();
            setUser(loggedUser);
            syncUserPreferences(loggedUser);
        } catch (error) {
            const apiError = handleApiError(error);
            showToast({ message: apiError.message, type: 'error' });
            throw apiError;
        }
    };

    const registerWithGoogle = async () => {
        try {
            const newUser = await authService.registerWithGoogle();
            setUser(newUser);
            syncUserPreferences(newUser);
        } catch (error) {
            const apiError = handleApiError(error);
            showToast({ message: apiError.message, type: 'error' });
            throw apiError;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            localStorage.removeItem('auth_session_hint');
            showToast({ message: t(traducciones, 'logoutSuccess'), type: 'success' });
        } catch (error) {
            const apiError = handleApiError(error);
            showToast({ message: apiError.message, type: 'error' });
            throw apiError;
        }
    };

    const updateProfile = async (data: { name?: string; language?: 'es' | 'en' | 'pt'; avatar?: string }) => {
        try {
            const updatedUser = await authService.updateProfile(data);
            setUser(updatedUser);
            syncUserPreferences(updatedUser);
            showToast({ message: t(traducciones, 'profileUpdated'), type: 'success' });
        } catch (error) {
            const apiError = handleApiError(error);
            showToast({ message: apiError.message, type: 'error' });
            throw apiError;
        }
    };

    const refetchUser = async () => {
        await fetchUser();
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        registerWithGoogle,
        logout,
        updateProfile,
        refetchUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
