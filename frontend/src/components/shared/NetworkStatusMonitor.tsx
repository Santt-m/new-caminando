import { useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

export const NetworkStatusMonitor = () => {
    const { showToast } = useToast();

    useEffect(() => {
        const handleOnline = () => {
            showToast({
                type: 'success',
                title: 'Conexión restaurada',
                message: 'Vuelves a estar en línea.',
                duration: 4000,
            });
        };

        const handleOffline = () => {
            showToast({
                type: 'warning',
                title: 'Sin conexión',
                message: 'Estás navegando en modo offline. Algunos datos pueden estar desactualizados.',
                duration: 6000, // Longer duration for warning
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showToast]);

    return null; // This component doesn't render anything visible directly
};
