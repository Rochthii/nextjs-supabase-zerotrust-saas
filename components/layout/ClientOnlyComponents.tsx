'use client';

/**
 * ClientOnlyComponents
 * Wrapper that dynamically imports client-only components with ssr: false.
 * Must be a Client Component since ssr:false is not allowed in Server Components.
 */
import dynamic from 'next/dynamic';
import { Suspense } from 'react';


const ScrollToTop = dynamic(
    () => import('@/components/common/scroll-to-top').then(m => ({ default: m.ScrollToTop })),
    { ssr: false }
);

const PageTracker = dynamic(
    () => import('@/components/analytics/PageTracker').then(m => ({ default: m.PageTracker })),
    { ssr: false }
);



const Toaster = dynamic(
    () => import('sonner').then(m => ({ default: m.Toaster })),
    { ssr: false }
);

const PushNotificationManager = dynamic(
    () => import('@/components/common/PushNotificationManager').then(m => ({ default: m.PushNotificationManager })),
    { ssr: false }
);

export function ClientOnlyComponents() {
    return (
        <Suspense fallback={null}>
            <PageTracker />
            <ScrollToTop />

            <PushNotificationManager />

            <Toaster position="top-center" richColors />
        </Suspense>
    );
}
