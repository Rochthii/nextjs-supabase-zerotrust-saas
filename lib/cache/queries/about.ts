import { unstable_cache } from 'next/cache';
import { getPublicClient, TTL, type AboutSectionRow } from './shared';

// ─── About Sections (all) ─────────────────────────────────────────────────
export const getCachedAboutSections = async (tenantId: string): Promise<AboutSectionRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            const { data, error } = await supabase
                .from('about_sections')
                .select('*')
                .eq('is_active', true)
                .eq('tenant_id', tenantId)
                .order('display_order', { ascending: true });

            const sections = (data ?? []) as unknown as AboutSectionRow[];
            return sections;
        },
        ['about-sections-v4', tenantId || 'all'],
        { revalidate: TTL.ABOUT_SECTIONS, tags: ['about-sections', tenantId ? `about-sections-${tenantId}` : 'about-sections-all'] }
    )();
};

// ─── About Section (theo key) ─────────────────────────────────────────────────
export const getCachedAboutSection = async (key: string, tenantId?: string): Promise<AboutSectionRow | null> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('about_sections')
                .select('*')
                .eq('key', key)
                .eq('is_active', true);

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error(`[Cache] about_sections[${key}] error:`, error.message);
                return null;
            }
            return (data ?? null) as unknown as AboutSectionRow | null;
        },
        ['about-section-by-key-v4', key, tenantId || 'all'],
        { revalidate: TTL.ABOUT_SECTIONS, tags: ['about-sections', tenantId ? `about-sections-${tenantId}` : 'about-sections-all'] }
    )();
};
