import { useEffect } from 'react';
import { useTour } from '@/contexts/TourContext';
import { useLocation } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAutoTour = (translations: { _tour?: any }) => { // Mantenemos any para el array de pasos por ahora pero tipamos la base
    const { runTour } = useTour();
    const location = useLocation();

    useEffect(() => {
        if (translations && translations._tour) {
            // Generate a valid tour ID from pathname
            const pathname = location.pathname || '/';
            const tourId = `tour_${pathname.replace(/\//g, '_').replace(/^_+|_+$/g, '') || 'home'}`;

            console.log('[useAutoTour] Tour detected:', { pathname, tourId, steps: translations._tour });

            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                runTour(tourId, translations._tour);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [translations, runTour, location.pathname]);
};
