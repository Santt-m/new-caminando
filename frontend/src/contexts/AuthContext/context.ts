import { createContext, useContext } from 'react';
import type { User } from '@/services/auth/types';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        name: string;
        acceptTerms: boolean;
        language?: 'es' | 'en' | 'pt';
    }) => Promise<void>;
    registerWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { name?: string; language?: 'es' | 'en' | 'pt'; avatar?: string }) => Promise<void>;
    refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
