import { useState, useCallback, type ReactNode } from 'react';
import { ToastContext, type ToastMessage } from './context';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: ToastMessage = {
            ...toast,
            id,
            duration: toast.duration || 3000,
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remover después de la duración
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, newToast.duration);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = {
        showToast,
        hideToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Renderizar toasts */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md
                            animate-in slide-in-from-right duration-300
                            ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
                            ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
                            ${toast.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
                            ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
                        `}
                    >
                        {toast.title && (
                            <div className="font-semibold mb-1">{toast.title}</div>
                        )}
                        <div className="text-sm">{toast.message}</div>
                        <button
                            onClick={() => hideToast(toast.id)}
                            className="absolute top-2 right-2 text-current opacity-70 hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

