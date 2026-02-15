import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminRedisService } from '@/services/admin/redis.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Save, Trash, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SafetyConfirmationModal } from '@/components/admin/SafetyConfirmationModal';
import { traducciones } from './traduccion';

export const MaintenanceTools = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isFlushModalOpen, setIsFlushModalOpen] = useState(false);

    const saveMutation = useMutation({
        mutationFn: AdminRedisService.triggerSave,
        onSuccess: () => {
            alert(t(traducciones, 'successBgsave'));
        }
    });

    const flushMutation = useMutation({
        mutationFn: ({ confirm, password }: { confirm: string; password: string }) =>
            AdminRedisService.flushDatabase(confirm, password),
        onSuccess: () => {
            queryClient.invalidateQueries();
            setIsFlushModalOpen(false);
            alert(t(traducciones, 'successFlush'));
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Error flushing database');
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/panel/database/redis')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{t(traducciones, 'title')}</h1>
                    <p className="text-muted-foreground">{t(traducciones, 'subtitle')}</p>
                </div>
            </div>

            {/* BGSAVE */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        {t(traducciones, 'sectionBgsave')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {t(traducciones, 'bgsaveDescription')}
                    </p>
                    <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {t(traducciones, 'buttonBgsave')}
                    </Button>
                </CardContent>
            </Card>

            {/* Flush Database */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t(traducciones, 'sectionFlush')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                        <p className="text-sm font-medium text-destructive">{t(traducciones, 'dangerZone')}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t(traducciones, 'warningDestructive')}
                        </p>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={() => setIsFlushModalOpen(true)}
                        disabled={flushMutation.isPending}
                    >
                        <Trash className="h-4 w-4 mr-2" />
                        {t(traducciones, 'buttonFlush')}
                    </Button>
                </CardContent>
            </Card>

            <SafetyConfirmationModal
                isOpen={isFlushModalOpen}
                onClose={() => setIsFlushModalOpen(false)}
                onConfirm={(password) => flushMutation.mutate({ confirm: 'CONFIRM', password })}
                title={t(traducciones, 'sectionFlush')}
                description={t(traducciones, 'warningDestructive')}
                confirmValue="CONFIRM"
                confirmLabel={t(traducciones, 'flushConfirmLabel')}
                confirmPlaceholder={t(traducciones, 'flushConfirmPlaceholder')}
                isPending={flushMutation.isPending}
            />
        </div>
    );
};
