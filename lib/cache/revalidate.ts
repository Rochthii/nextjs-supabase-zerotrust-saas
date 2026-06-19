import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { routing } from '@/i18n/routing';
import { CACHE_TAGS } from './tags';

// --- 10/10 DEDUPLICATION ENGINE ---
// Prevents redundant revalidation tasks for the same tenant/resource.
// Helps maintain low CPU during high-traffic admin operations.
const inFlightRevalidations = new Set<string>();

async function withDeduplication(id: string, task: () => Promise<void>) {
    if (inFlightRevalidations.has(id)) {
        console.log(`[Revalidate][DEDUPE] Task already in-flight for: ${id}. Skipping.`);
        return;
    }
    inFlightRevalidations.add(id);
    try {
        await task();
    } finally {
        // Clear from dedupe set after 2 seconds to allow subsequent valid updates
        // but block "storm" updates within the same window.
        setTimeout(() => inFlightRevalidations.delete(id), 2000);
    }
}

/**
 * Clear static cache (Full Route Cache + Data Cache) specifically for a branch homepage.
 * CPU EFFICIENT: Use type 'page' to clear only the exact page / (Homepage) in all languages.
 */
async function getTenantAliases(tenantId: string) {
    try {
        const { createAdminClient } = await import('@/lib/supabase/server');
        const supabase = await createAdminClient();
        const { data: tenant } = await (supabase as any)
            .from('tenants')
            .select('domain, subdomain')
            .eq('id', tenantId)
            .single();

        const aliases = new Set<string>();
        
        // 1. Primary domain
        if ((tenant as any)?.domain) {
            const cleanDomain = (tenant as any).domain.trim().toLowerCase();
            aliases.add(cleanDomain);
            if (!cleanDomain.startsWith('www.')) {
                aliases.add(`www.${cleanDomain}`);
            } else if (cleanDomain.startsWith('www.')) {
                aliases.add(cleanDomain.substring(4));
            }
        }

        // 2. Vercel subdomain
        if ((tenant as any)?.subdomain) {
            const cleanSub = (tenant as any).subdomain.trim().toLowerCase();
            aliases.add(`${cleanSub}.vercel.app`);
            aliases.add(cleanSub);
        }

        // 3. Aliases for development environment
        if (process.env.NODE_ENV === 'development') {
            aliases.add('localhost:3000');
            aliases.add('127.0.0.1:3000');
        }

        // 4. Always add tenantId as a fallback
        if (tenantId) aliases.add(tenantId);

        return Array.from(aliases);
    } catch (err) {
        console.error('[getTenantAliases] Error:', err);
        return [tenantId];
    }
}

/**
 * Clear static cache specifically for a branch homepage.
 */
export async function revalidateTenantHomepage(tenantId: string, dataTags: string[] = []) {
    return withDeduplication(`homepage-${tenantId}`, async () => {
        try {
            const aliases = await getTenantAliases(tenantId);

            (revalidateTag as any)(CACHE_TAGS.system.tenantConfigGlobal);

            // Revalidate for ID and each alias
            (revalidateTag as any)(CACHE_TAGS.system.tenantConfig(tenantId));
            
            aliases.forEach(alias => {
                try {
                    (revalidateTag as any)(CACHE_TAGS.system.tenantConfig(alias));
                } catch (e) {}
            });

            // Additional tags
            dataTags.forEach(tag => {
                try {
                    // @ts-ignore
                    revalidateTag(tag);
                } catch (e) {}
            });

            // 2. Revalidate Paths
            const locales = routing.locales;
            for (const alias of aliases) {
                for (const locale of locales) {
                    try {
                        revalidatePath(`/${alias}/${locale}`, 'page');
                    } catch (e) {}
                }
                try {
                    revalidatePath(`/${alias}`, 'page');
                } catch (e) {}
            }
        } catch (e) {
            console.error('[Revalidate] Error revalidating tenant homepage:', e);
        }
    });
}

/**
 * Clear static cache for ALL PAGES (Layout) of a branch.
 */
export async function revalidateTenantLayout(tenantId: string, dataTags: string[] = []) {
    return withDeduplication(`layout-${tenantId}`, async () => {
        try {
            const aliases = await getTenantAliases(tenantId);

            // 1. Tags
            (revalidateTag as any)(CACHE_TAGS.system.tenantConfigGlobal);
            (revalidateTag as any)(CACHE_TAGS.system.tenantConfig(tenantId));
            aliases.forEach(alias => {
                try {
                    (revalidateTag as any)(CACHE_TAGS.system.tenantConfig(alias)); 
                } catch (e) {}
            });

            dataTags.forEach(tag => {
                try {
                    (revalidateTag as any)(tag); 
                } catch (e) {}
            });

            // 2. Paths
            for (const alias of aliases) {
                try {
                    revalidatePath(`/${alias}`, 'layout');
                } catch (e) {}
            }
        } catch (e) {
            console.error('[Revalidate] Error revalidating tenant layout:', e);
        }
    });
}

/**
 * Revalidate cache for multiple branches simultaneously when publishing a Broadcast post.
 */
export async function revalidateMultiTenantNews(tenantIds: string[], dataTags: string[] = []) {
    try {
        if (!tenantIds || tenantIds.length === 0) return;

        dataTags.forEach(tag => {
            try {
                // @ts-ignore
                revalidateTag(tag);
            } catch (e) {}
        });
        
        // @ts-ignore
        revalidateTag(CACHE_TAGS.news.all);
        // @ts-ignore
        revalidateTag('news'); // Root tag used in queries.ts

        await Promise.all(tenantIds.map(id => revalidateTenantHomepage(id, [CACHE_TAGS.news.tenant(id)])));
    } catch (e) {
        console.error('[Revalidate] Error in revalidateMultiTenantNews:', e);
    }
}
