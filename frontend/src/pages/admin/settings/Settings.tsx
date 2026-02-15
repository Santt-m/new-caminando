import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionSettings } from './traduccion';
import { adminApi } from '@/services/admin/auth.service';
import { Loader2, Moon, Sun, Monitor, User, Shield, Key, Server } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SystemMetrics } from './SystemMetrics';

const getPasswordSchema = (text: Record<string, string>) => z.object({
    currentPassword: z.string().min(1, 'Requerido'), // 'Requerido' could also be I18n but 'min(1)' usually implies required.
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: text.passwordsDoNotMatch,
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<ReturnType<typeof getPasswordSchema>>;

export const Settings = () => {
    const { admin: user } = useAdminAuth();
    const { theme, setTheme } = useTheme();
    const toast = useToast();
    const { language } = useLanguage();
    const text = traduccionSettings[language];
    const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'system'>('account');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordSchema = getPasswordSchema(text);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema)
    });

    const onSubmit = async (data: PasswordFormValues) => {
        setIsSubmitting(true);
        try {
            await adminApi.put('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success(text.successPassword);
            reset();
        } catch {
            toast.error(text.errorPassword);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{text.title}</h1>
                <p className="text-muted-foreground">{text.subtitle}</p>
            </div>

            <Tabs defaultValue="account" value={activeTab} onValueChange={(v) => setActiveTab(v as 'account' | 'appearance' | 'system')} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="account" className="gap-2">
                        <User className="h-4 w-4" />
                        {text.tabAccount}
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Monitor className="h-4 w-4" />
                        {text.tabAppearance}
                    </TabsTrigger>
                    <TabsTrigger value="system" className="gap-2">
                        <Server className="h-4 w-4" />
                        {text.tabSystem}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 border-b">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-semibold">{text.sectionProfile}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{text.labelName}</Label>
                                    <div className="font-medium text-foreground">{user?.name}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{text.labelEmail}</Label>
                                    <div className="font-medium text-foreground">{user?.email}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{text.labelRole}</Label>
                                    <div>
                                        <Badge variant="secondary" className="capitalize">
                                            {user?.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 border-b">
                            <Key className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-semibold">{text.sectionSecurity}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">{text.labelCurrentPassword}</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        {...register('currentPassword')}
                                    />
                                    {errors.currentPassword && (
                                        <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">{text.labelNewPassword}</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...register('newPassword')}
                                    />
                                    {errors.newPassword && (
                                        <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{text.labelConfirmPassword}</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...register('confirmPassword')}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {text.btnUpdatePassword}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 border-b">
                            <Monitor className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-semibold">{text.sectionTheme}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
                                <Button
                                    variant={theme === 'claro' ? "default" : "outline"}
                                    onClick={() => setTheme('claro')}
                                    className="h-24 flex-col gap-2"
                                >
                                    <Sun className="h-6 w-6" />
                                    <span>{text.themeLight}</span>
                                </Button>

                                <Button
                                    variant={theme === 'oscuro' ? "default" : "outline"}
                                    onClick={() => setTheme('oscuro')}
                                    className="h-24 flex-col gap-2"
                                >
                                    <Moon className="h-6 w-6" />
                                    <span>{text.themeDark}</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    disabled
                                    className="h-24 flex-col gap-2 opacity-50"
                                >
                                    <Monitor className="h-6 w-6" />
                                    <span>{text.themeSystem}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                    <SystemMetrics />
                </TabsContent>
            </Tabs>
        </div>
    );
};
