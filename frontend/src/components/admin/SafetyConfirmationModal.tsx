import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

interface SafetyConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
    title: string;
    description: string;
    confirmValue: string;
    confirmLabel: string;
    confirmPlaceholder: string;
    isPending?: boolean;
}

export const SafetyConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmValue,
    confirmLabel,
    confirmPlaceholder,
    isPending,
}: SafetyConfirmationModalProps) => {
    const [inputValue, setInputValue] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setInputValue('');
            setPassword('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (inputValue === confirmValue && password.trim()) {
            onConfirm(password);
        }
    };

    const isConfirmDisabled = inputValue !== confirmValue || !password.trim() || isPending;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">Zona Peligrosa</p>
                        <p className="text-sm text-destructive/80">
                            Esta acción es irreversible y requiere doble validación.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                {confirmLabel} <span className="font-mono font-bold text-destructive">"{confirmValue}"</span>
                            </label>
                            <Input
                                autoFocus
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={confirmPlaceholder}
                                className="font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                Contraseña del Administrador
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isConfirmDisabled) {
                                        handleConfirm();
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                    >
                        {isPending ? 'Procesando...' : 'Confirmar Acción Crítica'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
