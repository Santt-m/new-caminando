import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout/PublicLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth/authService';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.forgotPassword({ email });
            setSent(true);
        } catch (error) {
            // We usually pretend success to avoid leaking emails, but if error is network we show it
            showToast({ type: 'error', message: 'Ocurrió un error. Inténtalo de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="w-full max-w-md mx-auto px-4 py-12">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Recuperar Contraseña</h1>
                        <p className="text-muted-foreground">
                            Ingresa tu email y te enviaremos instrucciones.
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                                Si existe una cuenta con ese email, recibirás un correo con las instrucciones.
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/login">Volver al Login</Link>
                            </Button>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-primary hover:underline">
                            Cancelar
                        </Link>
                    </div>
                </Card>
            </div>
        </PublicLayout>
    );
};
