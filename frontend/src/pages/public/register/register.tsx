import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { traducciones } from './traduccion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { RegisterSchema } from '@/services/schemas';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

export const RegisterPage = () => {
    const { t } = useLanguage();
    const { register, registerWithGoogle } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        acceptTerms?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            // Validar con Zod
            const data = RegisterSchema.parse({
                name,
                email,
                password,
            });

            await register({
                ...data,
                acceptTerms
            });
            // The context handles the toast and user state update, but here we also navigate
            // showToast is already called in context, so we might duplicate it, but context redirect isn't automatic usually.
            // checking context: context calls showToast but does not redirect. 
            // So we keep the navigate here.
            navigate('/app/dashboard/inicio', { replace: true });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                // Errores de validación de Zod
                const fieldErrors: Record<string, string> = {};
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                // Errores de la API
                const apiError = error as { message: string };
                setErrors({ email: apiError.message });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        try {
            await registerWithGoogle();
            showToast({ type: 'success', message: t(traducciones, 'googleSuccess') });
            navigate('/app/dashboard/inicio', { replace: true });
        } catch (error) {
            const apiError = error as { message: string };
            showToast({ type: 'error', message: apiError.message || t(traducciones, 'googleError') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="w-full max-w-md mx-auto px-4 py-12">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {t(traducciones, 'title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t(traducciones, 'subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t(traducciones, 'nameLabel')}</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder={t(traducciones, 'namePlaceholder')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t(traducciones, 'emailLabel')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t(traducciones, 'emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t(traducciones, 'passwordLabel')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t(traducciones, 'passwordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            <p className="text-xs text-muted-foreground mt-1">
                                {t(traducciones, 'passwordHint')}
                            </p>
                        </div>

                        <div>
                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="terms"
                                    checked={acceptTerms}
                                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                                />
                                <label htmlFor="terms" className="text-sm">
                                    {t(traducciones, 'termsLabel')}{' '}
                                    <Link to="/terminos" className="text-primary hover:underline">
                                        {t(traducciones, 'termsLink')}
                                    </Link>{' '}
                                    {t(traducciones, 'and')}{' '}
                                    <Link to="/privacidad" className="text-primary hover:underline">
                                        {t(traducciones, 'privacyLink')}
                                    </Link>
                                </label>
                            </div>
                            {errors.acceptTerms && (
                                <p className="text-sm text-destructive mt-1">{errors.acceptTerms}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? t(traducciones, 'registering') : t(traducciones, 'registerButton')}
                        </Button>
                    </form>

                    {/* Separador */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card text-muted-foreground">
                                {t(traducciones, 'orContinueWith')}
                            </span>
                        </div>
                    </div>

                    {/* Google OAuth */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {t(traducciones, 'googleButton')}
                    </Button>

                    {/* Link a Login */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {t(traducciones, 'haveAccount')}{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            {t(traducciones, 'loginLink')}
                        </Link>
                    </p>
                </Card>
            </div>
        </PublicLayout>
    );
};
