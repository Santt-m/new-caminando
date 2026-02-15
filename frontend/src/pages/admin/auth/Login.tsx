import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import type { LoginCredentials } from '@/services/admin/auth.service';
import { loginSchema } from '@/services/admin/auth.service';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionAdminLogin } from './traduccion';

export const AdminLoginPage = () => {
    const { login } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { language } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper para traducción local
    const text = traduccionAdminLogin[language];

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginCredentials) => {
        setIsSubmitting(true);
        try {
            await login(data);
            toast.success(text.welcome);

            const from = location.state?.from?.pathname || '/panel/dashboard';
            navigate(from, { replace: true });
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            toast.error(errorMessage || text.errorLogin);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-card border shadow-lg">
                <div className="bg-primary p-8 text-center text-primary-foreground">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-primary-foreground/20 p-3">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">{text.title}</h1>
                    <p className="mt-2 text-sm opacity-90">{text.subtitle}</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {text.emailLabel}
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder={text.emailPlaceholder}
                                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-primary'
                                    }`}
                                {...register('email')}
                                disabled={isSubmitting}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {text.passwordLabel}
                            </label>
                            <input
                                id="password"
                                type="password"
                                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-primary'
                                    }`}
                                {...register('password')}
                                disabled={isSubmitting}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {text.loadingButton}
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    {text.loginButton}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-muted-foreground">
                        <p>{text.monitorSystem}</p>
                        <p>{text.ipRegistered.replace('{{ip}}', '127.0.0.1')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
