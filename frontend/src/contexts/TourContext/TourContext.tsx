import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { tourSchema, type TourStep } from '../../schemas/tourSchema';
import { TourPopover } from '@/components/ui/TourPopover';
import { z } from 'zod';
import { TourContext } from './context';

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentTourId, setCurrentTourId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tourSteps, setTourSteps] = useState<TourStep[]>([]);

    const closeTour = useCallback(() => {
        if (currentTourId) {
            // Mark as completed
            const completedToursString = localStorage.getItem('completed_tours');
            const completedTours: string[] = completedToursString ? JSON.parse(completedToursString) : [];

            if (!completedTours.includes(currentTourId)) {
                const newCompleted = [...completedTours, currentTourId];
                localStorage.setItem('completed_tours', JSON.stringify(newCompleted));
            }
        }

        // Remove highlight
        const highlightedElement = document.querySelector('[data-tour-highlight]');
        if (highlightedElement) {
            highlightedElement.removeAttribute('data-tour-highlight');
        }

        setIsTourActive(false);
        setCurrentTourId(null);
        setCurrentStepIndex(0);
        setTourSteps([]);
    }, [currentTourId]);

    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex < 0 || stepIndex >= tourSteps.length) return;

        // Remove previous highlight
        const previousElement = document.querySelector('[data-tour-highlight]');
        if (previousElement) {
            previousElement.removeAttribute('data-tour-highlight');
        }

        // Highlight current element
        const currentStep = tourSteps[stepIndex];
        const element = document.querySelector(currentStep.element);
        if (element) {
            element.setAttribute('data-tour-highlight', 'true');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setCurrentStepIndex(stepIndex);
    }, [tourSteps]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < tourSteps.length - 1) {
            goToStep(currentStepIndex + 1);
        } else {
            closeTour();
        }
    }, [currentStepIndex, tourSteps.length, goToStep, closeTour]);

    const previousStep = useCallback(() => {
        if (currentStepIndex > 0) {
            goToStep(currentStepIndex - 1);
        }
    }, [currentStepIndex, goToStep]);

    const runTour = useCallback((tourId: string, steps: TourStep[]) => {
        // 1. Check persistence
        const completedToursString = localStorage.getItem('completed_tours');
        const completedTours: string[] = completedToursString ? JSON.parse(completedToursString) : [];

        if (completedTours.includes(tourId)) {
            console.log(`[Tour] Tour '${tourId}' already completed. Skipping.`);
            return;
        }

        // 2. Validate steps with Zod (Safety)
        try {
            const validatedSteps = tourSchema.parse(steps);

            setCurrentTourId(tourId);
            setTourSteps(validatedSteps);
            setCurrentStepIndex(0);
            setIsTourActive(true);

            // Highlight first element after a short delay
            setTimeout(() => {
                const firstElement = document.querySelector(validatedSteps[0].element);
                if (firstElement) {
                    firstElement.setAttribute('data-tour-highlight', 'true');
                    firstElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error(`[Tour] Invalid tour configuration for '${tourId}':`, error.issues);
            } else {
                console.error(`[Tour] Error running tour '${tourId}':`, error);
            }
        }
    }, []);

    // Calculate popover position
    const getPopoverPosition = () => {
        if (!isTourActive || tourSteps.length === 0) return { top: 0, left: 0 };

        const currentStep = tourSteps[currentStepIndex];
        const element = document.querySelector(currentStep.element);

        if (!element) return { top: window.innerHeight / 2, left: window.innerWidth / 2 };

        const rect = element.getBoundingClientRect();
        const side = currentStep.popover.side || 'bottom';
        const align = currentStep.popover.align || 'center';

        // Responsive popover width
        const isMobile = window.innerWidth < 768;
        const POPOVER_WIDTH = isMobile ? window.innerWidth - 32 : 384; // Full width on mobile with padding
        const OFFSET = isMobile ? 16 : 24; // Smaller offset on mobile

        let top = 0;
        let left = 0;

        // On mobile, always position at bottom center for simplicity
        if (isMobile) {
            top = rect.bottom + OFFSET;
            left = 16; // Fixed left padding on mobile
        } else {
            // Desktop positioning
            switch (side) {
                case 'top':
                    top = rect.top - OFFSET;
                    left = rect.left + rect.width / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + OFFSET;
                    left = rect.left + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left - POPOVER_WIDTH - OFFSET;
                    break;
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right + OFFSET;
                    break;
            }

            // Adjust horizontal alignment for top/bottom positions
            if (side === 'top' || side === 'bottom') {
                switch (align) {
                    case 'start':
                        left = rect.left;
                        break;
                    case 'center':
                        left = left - POPOVER_WIDTH / 2;
                        break;
                    case 'end':
                        left = rect.right - POPOVER_WIDTH;
                        break;
                }
            }
        }

        // Ensure popover stays within viewport
        const padding = 16;
        if (left < padding) left = padding;
        if (left + POPOVER_WIDTH > window.innerWidth - padding) {
            left = window.innerWidth - POPOVER_WIDTH - padding;
        }
        if (top < padding) top = padding;

        // On mobile, prevent popover from going off bottom
        const maxHeight = 400; // Approximate popover height
        if (top + maxHeight > window.innerHeight - padding) {
            top = window.innerHeight - maxHeight - padding;
        }

        return { top, left };
    };

    return (
        <TourContext.Provider value={{ runTour, isTourActive }}>
            {children}

            {/* Tour Overlay */}
            {isTourActive && ReactDOM.createPortal(
                <>
                    {/* Dark Overlay */}
                    <div
                        className="fixed inset-0 bg-black/75 z-[9998] transition-opacity duration-300"
                        onClick={closeTour}
                    />

                    {/* Custom Popover */}
                    {tourSteps.length > 0 && (
                        <TourPopover
                            title={tourSteps[currentStepIndex].popover.title || ''}
                            description={tourSteps[currentStepIndex].popover.description || ''}
                            currentStep={currentStepIndex + 1}
                            totalSteps={tourSteps.length}
                            onNext={currentStepIndex < tourSteps.length - 1 ? nextStep : undefined}
                            onPrevious={currentStepIndex > 0 ? previousStep : undefined}
                            onClose={closeTour}
                            position={getPopoverPosition()}
                        />
                    )}
                </>,
                document.body
            )}
        </TourContext.Provider>
    );
};
