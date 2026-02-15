import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
    threshold?: number;
    rootMargin?: string;
}

export const useInfiniteScroll = (
    callback: () => void,
    hasMore: boolean,
    loading: boolean,
    options: UseInfiniteScrollOptions = {}
) => {
    const observer = useRef<IntersectionObserver | null>(null);
    const isIntersectingRef = useRef(false); // Track intersection state purely via ref

    const callbackRef = useRef(callback);
    const hasMoreRef = useRef(hasMore);
    const loadingRef = useRef(loading);

    // Keep refs in sync with props
    useEffect(() => {
        callbackRef.current = callback;
        hasMoreRef.current = hasMore;
        loadingRef.current = loading;
    }, [callback, hasMore, loading]);

    // Check if we need to trigger loadMore after loading finishes
    // This solves the "stuck" issue without needing to disconnect/reconnect the observer
    useEffect(() => {
        if (!loading && hasMore && isIntersectingRef.current) {
            callbackRef.current();
        }
    }, [loading, hasMore]);

    // Default options
    const { threshold = 0.1, rootMargin = '800px' } = options;

    const observerRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observer.current) observer.current.disconnect();

            if (!node) return;

            observer.current = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    isIntersectingRef.current = entry.isIntersecting; // Update state

                    if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
                        callbackRef.current();
                    }
                },
                { threshold, rootMargin }
            );

            observer.current.observe(node);
        },
        [threshold, rootMargin]
    );

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, []);

    return observerRef;
};
