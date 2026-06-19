import { createClient } from '@/lib/supabase/server';
import { createClient as createStaticClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export interface SiteSetting {
    key: string;
    value: string;
    description: string | null;
}

// Internal non-cached fetcher
async function fetchSiteSettings(tenantId: string): Promise<Record<string, string>> {
    try {
        const supabase = createStaticClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data, error } = await supabase
            .from('site_settings')
            .select('key, value')
            .eq('tenant_id', tenantId);

        if (error || !data) return {};

        return (data as { key: string; value: any }[]).reduce(
            (acc, curr) => {
                acc[curr.key] = typeof curr.value === 'string' ? curr.value : JSON.stringify(curr.value);
                return acc;
            },
            {} as Record<string, string>
        );
    } catch (e) {
        console.error('[Settings] fetch error:', e);
        return {};
    }
}

/**
 * Retrieve website settings with support for caching and tenant isolation (Multi-tenant optimization).
 * Ensures data between branches is not mixed.
 * Saves Vercel CPU by only revalidating the specific tag of that branch.
 */
export async function getSiteSettings(tenantId: string): Promise<Record<string, string>> {
    return unstable_cache(
        () => fetchSiteSettings(tenantId),
        ['site-settings-v4', tenantId], // Isolated cache key v4
        {
            revalidate: false, // Permanent cache — optimized for Vercel CPU
            tags: ['site_settings', `site_settings-${tenantId}`]
        }
    )();
}

export async function getSiteSetting(key: string, tenantId: string): Promise<string | null> {
    const settings = await getSiteSettings(tenantId);
    return settings[key] || null;
}

export async function updateSiteSetting(key: string, value: string, tenantId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('site_settings')
        .upsert({
            key,
            value,
            tenant_id: tenantId,
            updated_at: new Date().toISOString()
        } as any, { onConflict: 'tenant_id,key' });

    if (error) throw error;
}
