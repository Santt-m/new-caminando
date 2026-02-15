import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

export interface ToastContextType {
    showToast: (toast: Omit<ToastMessage, 'id'>) => void;
    hideToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    // Helper methods for cleaner usage
    return {
        ...context,
        success: (message: string, title?: string) => context.showToast({ type: 'success', message, title }),
        error: (message: string, title?: string) => context.showToast({ type: 'error', message, title }),
        warning: (message: string, title?: string) => context.showToast({ type: 'warning', message, title }),
        info: (message: string, title?: string) => context.showToast({ type: 'info', message, title }),
    };
};
