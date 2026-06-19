'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackVisit } from '@/lib/analytics';

export function PageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Trigger server action to record visit
        // We defer it slightly to not block initial hydration/rendering
        const timeoutId = setTimeout(() => {
            trackVisit(pathname);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [pathname, searchParams]);

    return null; // Invisible component
}
