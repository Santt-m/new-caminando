import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './card';
import { X } from 'lucide-react';

interface TourPopoverProps {
    title: string;
    description: string;
    currentStep: number;
    totalSteps: number;
    onNext?: () => void;
    onPrevious?: () => void;
    onClose: () => void;
    position: { top: number; left: number };
}

export const TourPopover: React.FC<TourPopoverProps> = ({
    title,
    description,
    currentStep,
    totalSteps,
    onNext,
    onPrevious,
    onClose,
    position
}) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: 9999,
                width: 384, // w-96
                maxWidth: '90vw'
            }}
            className="transition-all duration-300 ease-in-out"
        >
            <Card className="shadow-xl">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight mr-2">{title}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full shrink-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription className="pt-1">{description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Paso {currentStep} de {totalSteps}</span>
                        <div className="flex space-x-1">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-1.5 rounded-full ${i + 1 === currentStep ? 'bg-primary' : 'bg-muted'}`}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}
                        disabled={!onPrevious}
                    >
                        Anterior
                    </Button>
                    <Button
                        size="sm"
                        onClick={onNext || onClose}
                    >
                        {onNext ? 'Siguiente' : 'Finalizar'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
