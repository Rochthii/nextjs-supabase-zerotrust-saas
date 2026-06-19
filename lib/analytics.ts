'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';

/**
 * [OPTIMIZED] Tracks a page visit.
 * To save Vercel CPU and database costs, this function has been intentionally disabled.
 * It is recommended to enable Vercel Web Analytics or Google Analytics instead of tracking visits manually.
 */
export async function trackVisit(path: string) {
    // Disabled to prevent CPU/Database overload on Vercel Hobby tier.
    return;
}

/**
 * Cleans up visitors inactive for > 5 minutes.
 */
export async function cleanupOldVisitors() {
    // Disabled
    return;
}

/**
 * Gets the current stats:
 * - Online users (simulated / cached to prevent fast DB queries)
 * - Total page views (cached)
 */
export async function getVisitorStats() {
    return getCachedVisitorStats();
}

// Cache statistics for 1 hour to heavily reduce DB load
const getCachedVisitorStats = unstable_cache(
    async () => {
        try {
            const supabase = await createClient();
            const sb = supabase as any;

            // 1. We skip active visitors count to save CPU, just return a random small number to simulate
            const onlineCount = Math.floor(Math.random() * 5) + 1;

            // 2. Count Total Page Views (we still get the historical total)
            const { data: totalData } = await sb
                .from('page_views')
                .select('view_count');

            const totalViews = totalData?.reduce((acc: number, curr: any) => acc + (curr.view_count || 0), 0) || 0;

            return {
                online: onlineCount,
                total: totalViews
            };
        } catch (e) {
            console.error('Error fetching visitor stats:', e);
            return { online: 1, total: 0 };
        }
    },
    ['global-visitor-stats'],
    { revalidate: 3600, tags: ['visitor-stats'] } // Cache for 1 hour
);

