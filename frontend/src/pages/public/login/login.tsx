import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { traducciones } from './traduccion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

export const LoginPage = () => {
    const { t } = useLanguage();
    const { login, loginWithGoogle } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            await login(email, password, rememberMe);

            // Redirigir a la página que intentaba acceder o al dashboard
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard/inicio';
            navigate(from, { replace: true });
        } catch (error: unknown) {
            const apiError = error as { code?: string; message: string };
            if (apiError.code === 'INVALID_CREDENTIALS') {
                setErrors({ password: apiError.message });
            } else {
                setErrors({ email: apiError.message });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            showToast({ type: 'success', message: t(traducciones, 'googleSuccess') });

            // Redirigir al dashboard
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard/inicio';
            navigate(from, { replace: true });
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
                            <Label htmlFor="email">{t(traducciones, 'emailLabel')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t(traducciones, 'emailPlaceholder')}
                                required
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t(traducciones, 'passwordLabel')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t(traducciones, 'passwordPlaceholder')}
                                required
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t(traducciones, 'rememberMe')}
                            </Label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                {t(traducciones, 'forgotPassword')}
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? t(traducciones, 'loggingIn') : t(traducciones, 'loginButton')}
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
                        onClick={handleGoogleLogin}
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

                    {/* Link a Registro */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {t(traducciones, 'noAccount')}{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            {t(traducciones, 'signupLink')}
                        </Link>
                    </p>
                </Card>
            </div>
        </PublicLayout>
    );
};
