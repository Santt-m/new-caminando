import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supportService } from '../../../services/support/supportService';
import { CreateTicketSchema, type CreateTicketDTO } from '../../../services/support/types';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { traducciones } from './traduccion';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { CheckCircle2 } from 'lucide-react';

const ContactSchema = CreateTicketSchema.pick({
    email: true,
    subject: true,
    message: true,
});

type ContactFormData = {
    email: string;
    subject: string;
    message: string;
};

export const ContactPage = () => {
    const { t } = useLanguage();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
        resolver: zodResolver(ContactSchema)
    });

    const onSubmit = async (data: ContactFormData) => {
        try {
            const ticketData: CreateTicketDTO = {
                ...data,
                type: 'contacto', // Default type for contact form
                metadata: {
                    url: window.location.href,
                    browser_info: navigator.userAgent
                }
            };

            await supportService.createTicket(ticketData);
            setShowSuccessModal(true);
            reset();
        } catch (error) {
            console.error(error);
            alert(t(traducciones, 'errorMessage') as string);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center justify-center text-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-center">{t(traducciones, 'successMessage')}</DialogTitle>
                            <DialogDescription className="text-center mt-2">
                                Hemos recibido tu mensaje correctamente. Nuestro equipo se pondrá en contacto contigo lo antes posible.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button type="button" variant="secondary" onClick={() => setShowSuccessModal(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">{t(traducciones, 'title')}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t(traducciones, 'subtitle')}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> {t(traducciones, 'emailLabel')}
                                </label>
                                <input
                                    {...register('email')}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="tu@email.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> {t(traducciones, 'subjectLabel')}
                                </label>
                                <input
                                    {...register('subject')}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder={t(traducciones, 'subjectLabel') as string}
                                />
                                {errors.subject && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.subject.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> {t(traducciones, 'messageLabel')}
                                </label>
                                <textarea
                                    {...register('message')}
                                    rows={5}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    placeholder={t(traducciones, 'messageLabel') as string}
                                />
                                {errors.message && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.message.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> {t(traducciones, 'submitButton')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
