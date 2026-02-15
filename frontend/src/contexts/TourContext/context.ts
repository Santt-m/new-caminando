import { createContext, useContext } from 'react';
import type { TourStep } from '../../schemas/tourSchema';

export interface TourContextType {
    runTour: (tourId: string, steps: TourStep[]) => void;
    isTourActive: boolean;
}

export const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
