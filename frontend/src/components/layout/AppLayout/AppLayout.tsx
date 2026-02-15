import { Outlet } from 'react-router-dom';
import { HeaderPrivate } from '../HeaderPrivate/HeaderPrivate';
import { FooterPrivate } from '../FooterPrivate/FooterPrivate';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '../../../hooks/useAuth';

export const AppLayout: React.FC = () => {
    // Datos reales del contexto de autenticación
    const { user } = useAuth();
    // TODO: Implementar hook de notificaciones reales
    const notificationCount = 0;

    // Safety check, although ProtectedRoute handles this
    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col transition-all duration-300">
            <HeaderPrivate user={user} notificationCount={notificationCount} />

            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
                    <AppSidebar />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-background/50">
                    <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            <FooterPrivate />
        </div>
    );
};
