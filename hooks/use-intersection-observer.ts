import { useEffect, useState, RefObject } from 'react';

interface Args extends IntersectionObserverInit {
    freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
    elementRef: RefObject<Element | null>, // Accept null in type for easier usage
    {
        threshold = 0,
        root = null,
        rootMargin = '0%',
        freezeOnceVisible = false,
    }: Args = {}
): IntersectionObserverEntry | undefined {
    const [entry, setEntry] = useState<IntersectionObserverEntry>();

    const frozen = entry?.isIntersecting && freezeOnceVisible;

    useEffect(() => {
        const node = elementRef?.current; // Access current here
        const hasIOSupport = !!window.IntersectionObserver;

        if (!hasIOSupport || frozen || !node) return;

        const observerParams = { threshold, root, rootMargin };
        const observer = new IntersectionObserver(([entry]) => {
            setEntry(entry);
            if (entry.isIntersecting && freezeOnceVisible) {
                observer.disconnect();
            }
        }, observerParams);

        observer.observe(node);

        return () => observer.disconnect();
    }, [elementRef?.current, JSON.stringify(threshold), root, rootMargin, frozen]);

    return entry;
}
