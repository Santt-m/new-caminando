import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../../hooks/useLanguage';
import { useToast } from '../../../hooks/useToast';
import { PublicLayout } from '../../../components/layout/PublicLayout';
import { LayoutSection } from '../../../components/layout/LayoutSection';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { supportService } from '../../../services/support/supportService';
import { traducciones } from './traduccion';
import { MessageSquare, Mail, AlertCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const contactSchema = z.object({
    name: z.string().min(2, "El nombre es muy corto"),
    email: z.string().email("Email inválido"),
    type: z.enum(['support', 'feedback', 'bug_report']),
    subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
    message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            type: 'support'
        }
    });

    const typeValue = watch('type');

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        try {
            await supportService.createTicket({
                email: data.email,
                type: data.type,
                subject: data.subject,
                message: `[Source: Contact Form]\nName: ${data.name}\n\n${data.message}`,
                metadata: {
                    browser_info: navigator.userAgent,
                    url: window.location.href
                }
            });

            showToast({
                type: 'success',
                title: t(traducciones, 'successTitle'),
                message: t(traducciones, 'successMessage')
            });
            reset();
        } catch {
            showToast({
                type: 'error',
                title: t(traducciones, 'errorTitle'),
                message: t(traducciones, 'errorMessage')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeOptions = [
        { value: 'support', label: t(traducciones, 'typeSupport'), icon: <HelpCircle className="h-4 w-4" /> },
        { value: 'feedback', label: t(traducciones, 'typeFeedback'), icon: <MessageSquare className="h-4 w-4" /> },
        { value: 'bug_report', label: t(traducciones, 'typeBug'), icon: <AlertCircle className="h-4 w-4" /> },
    ];

    return (
        <PublicLayout>
            <LayoutSection
                title={t(traducciones, 'title')}
                subtitle={t(traducciones, 'subtitle')}
                className="max-w-2xl mx-auto"
            >
                <Card className="p-6 md:p-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold font-heading">{t(traducciones, 'formTitle')}</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t(traducciones, 'nameLabel')}</Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="Tu nombre"
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t(traducciones, 'emailLabel')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="tu@email.com"
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">{t(traducciones, 'typeLabel')}</Label>
                            <Select
                                value={typeValue}
                                onValueChange={(val) => setValue('type', val as 'support' | 'feedback' | 'bug_report')}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                {option.icon}
                                                <span>{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">{t(traducciones, 'subjectLabel')}</Label>
                            <Input
                                id="subject"
                                {...register('subject')}
                                placeholder="Resumen breve"
                            />
                            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">{t(traducciones, 'messageLabel')}</Label>
                            <Textarea
                                id="message"
                                rows={5}
                                {...register('message')}
                                placeholder="Describe tu consulta en detalle..."
                            />
                            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                variant="default"
                                className="w-full h-11 text-base"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t(traducciones, 'sending') : t(traducciones, 'submitButton')}
                            </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            {t(traducciones, 'legalNote')} <Link to="/privacidad" className="text-primary hover:underline">{t(traducciones, 'privacyLink')}</Link>.
                        </p>
                    </form>
                </Card>
            </LayoutSection>
        </PublicLayout>
    );
};
