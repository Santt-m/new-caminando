import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout/PublicLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth/authService';

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await authService.verifyEmail(token);
                setStatus('success');
            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        };

        verify();
    }, [token]);

    return (
        <PublicLayout>
            <div className="w-full max-w-md mx-auto px-4 py-12">
                <Card className="p-8 text-center">
                    {status === 'verifying' && (
                        <>
                            <h1 className="text-2xl font-bold mb-4">Verificando Correo...</h1>
                            <p className="text-muted-foreground">Por favor espera mientras verificamos tu cuenta.</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <h1 className="text-2xl font-bold mb-4 text-green-600">¡Correo Verificado!</h1>
                            <p className="text-muted-foreground mb-6">Tu cuenta ha sido activada correctamente.</p>
                            <Button asChild className="w-full">
                                <Link to="/login">Iniciar Sesión</Link>
                            </Button>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <h1 className="text-2xl font-bold mb-4 text-destructive">Error de Verificación</h1>
                            <p className="text-muted-foreground mb-6">El token es inválido o ha expirado.</p>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/contact">Contactar Soporte</Link>
                            </Button>
                        </>
                    )}
                </Card>
            </div>
        </PublicLayout>
    );
};
