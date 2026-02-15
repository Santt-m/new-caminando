import React from 'react';
import { Header } from '../Header';
import { HeaderPrivate } from '../HeaderPrivate';
import { Footer } from '../Footer';
import { cn } from '../../../utils/cn';
import { LocalErrorBoundary } from '../../ui/ErrorBoundary';
import { CookieBanner } from '../../ui/CookieBanner';
import { useAuth } from '../../../hooks/useAuth';

export interface PublicLayoutProps {
    children: React.ReactNode;
    hideFooter?: boolean;
    fullWidth?: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, hideFooter = false, fullWidth = false }) => {
    const { isAuthenticated, user } = useAuth();
    const notificationCount = 0; // TODO: Implementar endpoint de notificaciones

    return (
        <>
            {isAuthenticated && user ? (
                <HeaderPrivate user={user} notificationCount={notificationCount} />
            ) : (
                <Header />
            )}
            <main className={cn(
                "flex-1 w-full flex flex-col",
                fullWidth ? "px-0 py-0" : "container mx-auto px-4 py-8"
            )}>
                <LocalErrorBoundary>
                    {children}
                </LocalErrorBoundary>
            </main>
            {!hideFooter && <Footer />}
            <CookieBanner />
        </>
    );
};
