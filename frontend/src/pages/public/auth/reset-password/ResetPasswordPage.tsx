import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout/PublicLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth/authService';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            showToast({ type: 'error', message: 'Token inválido' });
            return;
        }

        if (password !== confirmPassword) {
            showToast({ type: 'error', message: 'Las contraseñas no coinciden' });
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({ token, newPassword: password });
            showToast({ type: 'success', message: 'Contraseña restablecida correctamente' });
            navigate('/login');
        } catch (error: any) {
            showToast({ type: 'error', message: error.message || 'Error al restablecer contraseña' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <PublicLayout>
                <div className="w-full max-w-md mx-auto px-4 py-12">
                    <Card className="p-8 text-center text-destructive">
                        Token no proporcionado.
                    </Card>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="w-full max-w-md mx-auto px-4 py-12">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Nueva Contraseña</h1>
                        <p className="text-muted-foreground">
                            Ingresa tu nueva contraseña.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nueva Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                        </Button>
                    </form>
                </Card>
            </div>
        </PublicLayout>
    );
};
