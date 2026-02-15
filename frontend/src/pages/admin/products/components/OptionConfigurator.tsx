import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { ProductOption } from '@/types/ecommerce';

interface OptionConfiguratorProps {
    options: ProductOption[];
    onChange: (options: ProductOption[]) => void;
    onGenerate: () => void;
}

export const OptionConfigurator = ({
    options,
    onChange,
    onGenerate
}: OptionConfiguratorProps) => {
    const [newOptionName, setNewOptionName] = useState('');

    // Agregar nueva opción
    const addOption = () => {
        if (!newOptionName.trim()) return;

        const key = newOptionName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_');

        const newOption: ProductOption = {
            name: newOptionName.trim(),
            key,
            values: []
        };

        onChange([...options, newOption]);
        setNewOptionName('');
    };

    // Eliminar opción
    const removeOption = (index: number) => {
        onChange(options.filter((_, i) => i !== index));
    };

    // Agregar valor a una opción
    const addValueToOption = (optionIndex: number, value: string) => {
        if (!value.trim()) return;

        const updated = [...options];
        if (!updated[optionIndex].values.includes(value.trim())) {
            updated[optionIndex].values.push(value.trim());
            onChange(updated);
        }
    };

    // Eliminar valor de una opción
    const removeValueFromOption = (optionIndex: number, valueIndex: number) => {
        const updated = [...options];
        updated[optionIndex].values = updated[optionIndex].values.filter((_, i) => i !== valueIndex);
        onChange(updated);
    };

    // Calcular total de combinaciones
    const totalCombinations = options.length === 0 ? 0 :
        options.reduce((total, opt) => total * (opt.values.length || 1), 1);

    const canGenerate = options.length > 0 && options.every(o => o.values.length > 0) && totalCombinations > 0 && totalCombinations <= 100;

    return (
        <div className="space-y-4">
            {/* Lista de opciones existentes */}
            {options.map((option, optionIdx) => (
                <Card key={optionIdx} className="p-4">
                    <div className="space-y-3">
                        {/* Header de la opción */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-semibold">{option.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                    {option.values.length} {option.values.length === 1 ? 'valor' : 'valores'}
                                </Badge>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(optionIdx)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Valores de la opción */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Valores</Label>

                            {/* Lista de valores existentes */}
                            <div className="flex flex-wrap gap-2">
                                {option.values.map((value, valueIdx) => (
                                    <Badge
                                        key={valueIdx}
                                        variant="secondary"
                                        className="pl-3 pr-1 py-1 gap-1"
                                    >
                                        {value}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 p-0 hover:bg-transparent"
                                            onClick={() => removeValueFromOption(optionIdx, valueIdx)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>

                            {/* Input para agregar nuevo valor */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder={`Ej: Blanco, Negro, Azul...`}
                                    className="h-8 text-sm flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget;
                                            addValueToOption(optionIdx, input.value);
                                            input.value = '';
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                        addValueToOption(optionIdx, input.value);
                                        input.value = '';
                                    }}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Agregar
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}

            {/* Agregar nueva opción */}
            <div className="flex gap-2">
                <Input
                    placeholder="Nombre de la opción (ej: Color, RAM, Almacenamiento)"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addOption();
                        }
                    }}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    disabled={!newOptionName.trim()}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Opción
                </Button>
            </div>

            {/* Preview y botón de generación */}
            {options.length > 0 && (
                <Card className="p-4 bg-muted/50">
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-medium text-sm">Vista Previa</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                {totalCombinations === 0 ? (
                                    'Agrega valores a las opciones para generar variantes'
                                ) : totalCombinations > 100 ? (
                                    <span className="text-destructive">
                                        ⚠️ Demasiadas combinaciones ({totalCombinations}). Máximo 100 permitidas.
                                    </span>
                                ) : (
                                    `Se generarán ${totalCombinations} ${totalCombinations === 1 ? 'variante' : 'variantes'}`
                                )}
                            </p>
                        </div>

                        {/* Ejemplo de combinación */}
                        {totalCombinations > 0 && totalCombinations <= 100 && (
                            <div className="text-xs text-muted-foreground">
                                <p className="mb-1">Ejemplo: {options.map(o => o.values[0] || '?').join(' - ')}</p>
                            </div>
                        )}

                        <Button
                            type="button"
                            onClick={onGenerate}
                            disabled={!canGenerate}
                            className="w-full"
                            size="lg"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Generar {totalCombinations} {totalCombinations === 1 ? 'Variante' : 'Variantes'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Mensaje si no hay opciones */}
            {options.length === 0 && (
                <Card className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Agrega opciones configurables como <strong>Color</strong>, <strong>Talle</strong>, <strong>RAM</strong>, etc.
                    </p>
                </Card>
            )}
        </div>
    );
};
