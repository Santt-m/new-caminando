import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Plus } from 'lucide-react';
import { AdminAttributesService } from '@/services/admin/attributes.service';
import { useLanguage } from '@/hooks/useLanguage';
import { traduccionAttributes } from './traduccion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import type {
    AttributeDefinition,
    CreateAttributeDefinitionDto,
    UpdateAttributeDefinitionDto
} from '@/types/ecommerce';

interface AttributeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    attribute?: AttributeDefinition | null;
}

// Helper to generate key from name
const generateKey = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[áàâã]/g, 'a')
        .replace(/[éèê]/g, 'e')
        .replace(/[íìî]/g, 'i')
        .replace(/[óòôõ]/g, 'o')
        .replace(/[úùû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/^_+|_+$/g, '');
};

export const AttributeFormModal = ({ isOpen, onClose, attribute }: AttributeFormModalProps) => {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();

    // Form state
    const [nameEs, setNameEs] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [namePt, setNamePt] = useState('');
    const [key, setKey] = useState('');
    const [type, setType] = useState<'select' | 'text' | 'number'>('select');
    const [values, setValues] = useState<string[]>([]);
    const [newValue, setNewValue] = useState('');
    const [unit, setUnit] = useState('');
    const [active, setActive] = useState(true);

    // Load attribute data when editing
    useEffect(() => {
        if (attribute) {
            // Load name
            if (typeof attribute.name === 'object' && attribute.name !== null) {
                setNameEs(attribute.name.es || '');
                setNameEn(attribute.name.en || '');
                setNamePt(attribute.name.pt || '');
            } else {
                setNameEs(attribute.name || '');
                setNameEn('');
                setNamePt('');
            }

            setKey(attribute.key);
            setType(attribute.type);
            setValues(attribute.values || []);
            setUnit(attribute.unit || '');
            setActive(attribute.active);
        } else {
            resetForm();
        }
    }, [attribute]);

    const resetForm = () => {
        setNameEs('');
        setNameEn('');
        setNamePt('');
        setKey('');
        setType('select');
        setValues([]);
        setNewValue('');
        setUnit('');
        setActive(true);
    };

    // Auto-generate key from spanish name
    useEffect(() => {
        if (!attribute && nameEs) {
            setKey(generateKey(nameEs));
        }
    }, [nameEs, attribute]);

    const createMutation = useMutation({
        mutationFn: (data: CreateAttributeDefinitionDto) => AdminAttributesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            toast.success(t(traduccionAttributes, 'createSuccess'));
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al crear el atributo');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAttributeDefinitionDto }) =>
            AdminAttributesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            toast.success(t(traduccionAttributes, 'updateSuccess'));
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al actualizar el atributo');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!nameEs.trim() && !nameEn.trim() && !namePt.trim()) {
            toast.error(t(traduccionAttributes, 'nameRequired'));
            return;
        }

        if (!key.trim()) {
            toast.error(t(traduccionAttributes, 'keyRequired'));
            return;
        }

        // Validate key format
        if (!/^[a-z0-9_]+$/.test(key)) {
            toast.error(t(traduccionAttributes, 'keyInvalid'));
            return;
        }

        if (!type) {
            toast.error(t(traduccionAttributes, 'typeRequired'));
            return;
        }

        if (type === 'select' && values.length === 0) {
            toast.error(t(traduccionAttributes, 'valuesRequired'));
            return;
        }

        // Prepare name (multiidioma)
        const name = {
            es: nameEs.trim() || '',
            en: nameEn.trim() || '',
            pt: namePt.trim() || '',
        };

        const formData: CreateAttributeDefinitionDto = {
            name,
            key: key.trim(),
            type,
            active,
        };

        // Add conditional fields based on type
        if (type === 'select') {
            formData.values = values;
        }
        if (type === 'number' && unit.trim()) {
            formData.unit = unit.trim();
        }

        if (attribute) {
            updateMutation.mutate({ id: attribute._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const addValue = () => {
        if (newValue.trim() && !values.includes(newValue.trim())) {
            setValues([...values, newValue.trim()]);
            setNewValue('');
        }
    };

    const removeValue = (valueToRemove: string) => {
        setValues(values.filter(v => v !== valueToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addValue();
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {attribute ? t(traduccionAttributes, 'editAttribute') : t(traduccionAttributes, 'createAttribute')}
                    </DialogTitle>
                    <DialogDescription>
                        {attribute
                            ? 'Modifica los datos del atributo'
                            : 'Define un nuevo atributo personalizable para productos'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name (Multiidioma) */}
                    <div className="space-y-2">
                        <Label>
                            {t(traduccionAttributes, 'name')} <span className="text-destructive">*</span>
                        </Label>
                        <Tabs defaultValue={language} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="es">Español</TabsTrigger>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="pt">Português</TabsTrigger>
                            </TabsList>
                            <TabsContent value="es" className="space-y-2">
                                <Input
                                    value={nameEs}
                                    onChange={(e) => setNameEs(e.target.value)}
                                    placeholder={t(traduccionAttributes, 'namePlaceholder')}
                                    required={!nameEn && !namePt}
                                />
                            </TabsContent>
                            <TabsContent value="en" className="space-y-2">
                                <Input
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    placeholder="E.g: Color, Size, Memory..."
                                />
                            </TabsContent>
                            <TabsContent value="pt" className="space-y-2">
                                <Input
                                    value={namePt}
                                    onChange={(e) => setNamePt(e.target.value)}
                                    placeholder="Ex: Cor, Tamanho, Memória..."
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Key */}
                    <div className="space-y-2">
                        <Label htmlFor="key">
                            {t(traduccionAttributes, 'key')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="key"
                            value={key}
                            onChange={(e) => setKey(generateKey(e.target.value))}
                            placeholder={t(traduccionAttributes, 'keyPlaceholder')}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            {t(traduccionAttributes, 'keyHelper')}
                        </p>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">
                            {t(traduccionAttributes, 'type')} <span className="text-destructive">*</span>
                        </Label>
                        <Select value={type} onValueChange={(value: any) => setType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="select">{t(traduccionAttributes, 'typeSelect')}</SelectItem>
                                <SelectItem value="text">{t(traduccionAttributes, 'typeText')}</SelectItem>
                                <SelectItem value="number">{t(traduccionAttributes, 'typeNumber')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {t(traduccionAttributes, 'typeHelper')}
                        </p>
                    </div>

                    {/* Conditional Fields based on Type */}
                    {type === 'select' && (
                        <div className="space-y-2">
                            <Label>{t(traduccionAttributes, 'values')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t(traduccionAttributes, 'valuesPlaceholder')}
                                />
                                <Button type="button" onClick={addValue} size="sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t(traduccionAttributes, 'valuesHelper')}
                            </p>
                            {values.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {values.map((value, idx) => (
                                        <Badge key={idx} variant="secondary" className="gap-1">
                                            {value}
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                onClick={() => removeValue(value)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {type === 'number' && (
                        <div className="space-y-2">
                            <Label htmlFor="unit">{t(traduccionAttributes, 'unit')}</Label>
                            <Input
                                id="unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder={t(traduccionAttributes, 'unitPlaceholder')}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t(traduccionAttributes, 'unitHelper')}
                            </p>
                        </div>
                    )}

                    {/* Active Switch */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="active"
                            checked={active}
                            onCheckedChange={setActive}
                        />
                        <Label htmlFor="active" className="cursor-pointer">
                            {t(traduccionAttributes, 'active')}
                        </Label>
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            {t(traduccionAttributes, 'cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t(traduccionAttributes, 'saveAttribute')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
