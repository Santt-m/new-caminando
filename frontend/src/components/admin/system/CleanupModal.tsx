import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Loader2, Database, Activity } from 'lucide-react';
import { AdminSystemService } from '@/services/admin/system.service';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionCleanup } from './traduccion';

interface CleanupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CleanupModal = ({ open, onOpenChange }: CleanupModalProps) => {
    const [step, setStep] = useState<'analyzing' | 'confirm' | 'executing' | 'result'>('analyzing');
    const [password, setPassword] = useState('');
    const [estimate, setEstimate] = useState<any>(null);
    const [result, setResult] = useState<any>(null);
    const toast = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        if (open) {
            analyze();
        } else {
            // Reset state when closed
            setTimeout(() => {
                setStep('analyzing');
                setPassword('');
                setEstimate(null);
                setResult(null);
            }, 300);
        }
    }, [open]);

    const analyze = async () => {
        try {
            setStep('analyzing');
            const data = await AdminSystemService.estimateCleanup();
            setEstimate(data);
            setStep('confirm');
        } catch (error) {
            console.error('Error fetching estimate:', error);
            toast.error(t(traduccionCleanup, 'errorAnalyzing'), t(traduccionCleanup, 'errorTitle'));
            onOpenChange(false);
        }
    };

    const handleExecute = async () => {
        if (!password) return;

        try {
            setStep('executing');
            const data = await AdminSystemService.executeCleanup(password);
            setResult(data);
            setStep('result');
            toast.success(t(traduccionCleanup, 'cleanupSuccessDesc'), t(traduccionCleanup, 'cleanupSuccess'));
        } catch (error) {
            console.error('Error executing cleanup:', error);
            toast.error(t(traduccionCleanup, 'cleanupFailedDesc'), t(traduccionCleanup, 'cleanupFailed'));
            setStep('confirm');
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        {t(traduccionCleanup, 'title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t(traduccionCleanup, 'description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">{t(traduccionCleanup, 'analyzing')}</p>
                        </div>
                    )}

                    {step === 'confirm' && estimate && (
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{t(traduccionCleanup, 'metricsEvents')}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{formatBytes(estimate.metrics.estimatedSize)}</div>
                                        <div className="text-xs text-muted-foreground">{estimate.metrics.count} {t(traduccionCleanup, 'records')}</div>
                                    </div>
                                </div>
                                <div className="h-[1px] bg-border w-full" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{t(traduccionCleanup, 'activityLogs')}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{formatBytes(estimate.activity.estimatedSize)}</div>
                                        <div className="text-xs text-muted-foreground">{estimate.activity.count} {t(traduccionCleanup, 'records')}</div>
                                    </div>
                                </div>
                                <div className="h-[1px] bg-border w-full" />
                                <div className="flex items-center justify-between text-primary">
                                    <span className="font-bold">{t(traduccionCleanup, 'totalReclaimable')}</span>
                                    <span className="font-bold">{formatBytes(estimate.totalSize)}</span>
                                </div>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md flex gap-3 text-yellow-600 dark:text-yellow-400">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p className="text-sm">
                                    {t(traduccionCleanup, 'warning').replace('{{days}}', estimate.retentionDays)}
                                </p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="password">{t(traduccionCleanup, 'passwordLabel')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t(traduccionCleanup, 'passwordPlaceholder')}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    )}

                    {step === 'executing' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-destructive" />
                            <p className="text-sm text-muted-foreground">{t(traduccionCleanup, 'cleaning')}</p>
                        </div>
                    )}

                    {step === 'result' && result && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-4 text-green-600 dark:text-green-500 space-y-2">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Trash2 className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg">{t(traduccionCleanup, 'cleanupSuccess')}</h3>
                            </div>

                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>{t(traduccionCleanup, 'metricsUpdate')}</span>
                                    <span className="font-mono">{result.metricsDeleted} {t(traduccionCleanup, 'docsProcessed')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t(traduccionCleanup, 'activityLogs')}:</span>
                                    <span className="font-mono">{result.activityDeleted} {t(traduccionCleanup, 'activityLogsDeleted')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between items-center">
                    {step === 'result' ? (
                        <Button className="w-full" onClick={() => onOpenChange(false)}>
                            {t(traduccionCleanup, 'close')}
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={step === 'executing'}
                            >
                                {t(traduccionCleanup, 'cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleExecute}
                                disabled={step !== 'confirm' || !password}
                            >
                                {step === 'executing' ? t(traduccionCleanup, 'cleaning') : t(traduccionCleanup, 'confirmCleanup')}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
