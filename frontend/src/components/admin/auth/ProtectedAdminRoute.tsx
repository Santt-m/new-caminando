import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedAdminRoute = () => {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirigir al login guardando la ubicación intentada
        return <Navigate to="/panel/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
