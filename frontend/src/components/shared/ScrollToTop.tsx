import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Resets the window scroll position to (0,0) whenever the route pathname changes.
 * This is essential for Single Page Applications (SPA) where the scroll position
 * would otherwise persist between different "pages".
 */
export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};
