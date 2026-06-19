import { unstable_cache } from 'next/cache';
import { getPublicClient, getBaseSlug, TTL, type DharmaTalkRow } from './shared';

// ─── Dharma Talks / Learning Resources Featured ──────────────────────────────
export const getCachedDharmaTalks = async (limit = 3, tenantId?: string): Promise<DharmaTalkRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('learning_resources')
                .select('*')
                .eq('is_active', true)
                .eq('is_featured', true);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('order_position', { ascending: true })
                .limit(limit);

            if (error) {
                console.error('[Cache] dharma_talks error:', error.message);
                return [];
            }

            return (data ?? []).map((talk: any) => ({
                ...talk,
                speaker_name_vi: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
                speaker_name_km: talk.instructor_name_km,
                speaker_name_en: talk.instructor_name_en,
                speaker_name: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
            })) as unknown as DharmaTalkRow[];
        },
        ['learning-resources-featured', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['learning-resources', tenantId ? `learning-resources-${tenantId}` : 'learning-resources-all'] }
    )();
};

// ─── All Dharma Talks / Learning Resources ─────────────────────────────────────
export const getAllDharmaTalks = async (limit = 100, tenantId?: string): Promise<DharmaTalkRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('learning_resources')
                .select('*')
                .eq('is_active', true);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('order_position', { ascending: true })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] all_dharma_talks error:', error.message);
                return [];
            }
            return (data ?? []).map((talk: any) => ({
                ...talk,
                speaker_name_vi: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
                speaker_name_km: talk.instructor_name_km,
                speaker_name_en: talk.instructor_name_en,
                speaker_name: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
            })) as unknown as DharmaTalkRow[];
        },
        ['learning-resources-all', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['learning-resources', tenantId ? `learning-resources-${tenantId}` : 'learning-resources-all'] }
    )();
};

// ─── Dharma Talks paginated by category group ─────────────────────────────
export const getCachedDharmaTalksByCategoryGroup = async (
    categoryIds: string[],
    limit: number = 8,
    tenantId?: string
): Promise<DharmaTalkRow[]> => {
    return unstable_cache(
        async () => {
            if (!categoryIds || categoryIds.length === 0) return [];

            const supabase = getPublicClient();
            let finalCategoryIds = [...categoryIds];
            
            const { data: inputCats } = await supabase.from('categories').select('slug').in('id', categoryIds);
            if (inputCats && inputCats.length > 0) {
                const baseSlugs = [...new Set(inputCats.map(c => getBaseSlug(c.slug)))];
                
                const { data: relatedCats } = await supabase
                    .from('categories')
                    .select('id')
                    .or(baseSlugs.map(s => `slug.eq.${s},slug.ilike.${s}-%`).join(','));
                
                if (relatedCats && relatedCats.length > 0) {
                    const baseIds = relatedCats.map(c => c.id);
                    const { data: childCats } = await supabase.from('categories').select('id').in('parent_id', baseIds);
                    finalCategoryIds = [...new Set([...finalCategoryIds, ...baseIds, ...(childCats?.map(c => c.id) || [])])];
                }
            }

            let query = supabase
                .from('learning_resources')
                .select('*')
                .eq('is_active', true)
                .in('category_id', finalCategoryIds);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('order_position', { ascending: true })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] dharma_talks_by_category_group error:', error.message);
                return [];
            }
            return (data ?? []).map((talk: any) => ({
                ...talk,
                speaker_name_vi: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
                speaker_name_km: talk.instructor_name_km,
                speaker_name_en: talk.instructor_name_en,
                speaker_name: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
            })) as unknown as DharmaTalkRow[];
        },
        ['learning-resources-by-category-group', categoryIds.join(','), limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['learning-resources', tenantId ? `learning-resources-${tenantId}` : 'learning-resources-all'] }
    )();
};

// ─── Dharma Talks paginated for uncategorized elements ────────────────────────────────
export const getCachedUncategorizedDharmaTalks = async (
    limit: number = 8,
    tenantId?: string
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();

            let catQuery = supabase.from('categories').select('id').eq('module', 'dharma');
            if (tenantId) {
                catQuery = catQuery.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }
            const { data: tenantCats } = await catQuery;
            const tenantCatIds = (tenantCats || []).map(c => c.id);

            let query = supabase
                .from('learning_resources')
                .select('*')
                .eq('is_active', true);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[Cache] uncategorized_dharma_talks error:', error.message);
                return [];
            }

            const filtered = (data ?? []).filter(item =>
                !item.category_id || !tenantCatIds.includes(item.category_id)
            ).slice(0, limit);

            return filtered.map((talk: any) => ({
                ...talk,
                speaker_name_vi: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
                speaker_name_km: talk.instructor_name_km,
                speaker_name_en: talk.instructor_name_en,
                speaker_name: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
            }));
        },
        ['learning-resources-uncategorized-v3', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['learning-resources', tenantId ? `learning-resources-${tenantId}` : 'learning-resources-all'] }
    )();
};

// ─── Tags ───────────────────────────────────────────────────────────
export const getCachedDharmaTalkTags = async (talkIds: string[]) => {
    if (!talkIds || talkIds.length === 0) return {};
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            const { data: tagLinks, error } = await supabase
                .from('learning_resource_tags')
                .select('learning_resource_id, tags(*)')
                .in('learning_resource_id', talkIds);

            if (error) {
                console.error('[Cache] learning_resource_tags error:', error.message);
                return {};
            }

            const tagsMap: Record<string, any[]> = {};
            tagLinks?.forEach((link: any) => {
                if (!tagsMap[link.learning_resource_id]) tagsMap[link.learning_resource_id] = [];
                if (link.tags) tagsMap[link.learning_resource_id].push(link.tags);
            });
            return tagsMap;
        },
        ['dharma-talk-tags', talkIds.sort().join(',')],
        { revalidate: TTL.DHARMA_TALKS, tags: ['tags', 'learning-resources'] }
    )();
};

// ─── Dharma Talk Detail ───────────────────────────────────────────────────────
export const getCachedDharmaTalkDetail = async (
    slugOrId: string,
    tenantId?: string
) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('learning_resources')
                .select('*, categories(*)')
                .eq('is_active', true)
                .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const { data: talkRaw } = await query.maybeSingle();
            if (!talkRaw) return null;

            const talkData = {
                ...talkRaw,
                speaker_name_vi: talkRaw.instructor_name_vi || 'Multi-tenant Ecosystem',
                speaker_name_km: talkRaw.instructor_name_km,
                speaker_name_en: talkRaw.instructor_name_en,
                speaker_name: talkRaw.instructor_name_vi || 'Multi-tenant Ecosystem',
            };

            let relatedQuery = supabase
                .from('learning_resources')
                .select('*, categories(*)')
                .eq('is_active', true)
                .neq('id', talkData.id);

            if (talkData.category_id) {
                relatedQuery = relatedQuery.eq('category_id', talkData.category_id);
            }

            if (tenantId) {
                relatedQuery = relatedQuery.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const tagsQuery = supabase
                .from('learning_resource_tags')
                .select('tags(*)')
                .eq('learning_resource_id', talkData.id);

            const [
                { data: relatedTalksRaw },
                { data: tagData }
            ] = await Promise.all([
                relatedQuery.order('created_at', { ascending: false }).limit(3),
                tagsQuery
            ]);

            const relatedTalks = (relatedTalksRaw || []).map((t: any) => ({
                ...t,
                speaker_name_vi: t.instructor_name_vi || 'Multi-tenant Ecosystem',
                speaker_name_km: t.instructor_name_km,
                speaker_name_en: t.instructor_name_en,
                speaker_name: t.instructor_name_vi || 'Multi-tenant Ecosystem',
            }));

            const tags = tagData?.map((t: any) => t.tags).filter(Boolean) || [];

            return {
                talk: talkData,
                relatedTalks,
                tags
            };
        },
        ['talk-detail-bundle-v3', slugOrId, tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['learning-resources', tenantId ? `learning-resources-${tenantId}` : 'learning-resources-all', `learning-resource-${slugOrId}`] }
    )();
};

// ─── Dharma Talks Page ───────────────────────────────────────────────────────
export const getCachedDharmaTalksPage = async (
    page: number,
    categoryId: string,
    limit: number,
    tenantId?: string
) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('learning_resources')
                .select('*', { count: 'exact' })
                .eq('is_active', true);
            
            const { data: currentCat } = await supabase.from('categories').select('slug').eq('id', categoryId).single();
            if (currentCat?.slug) {
                const { data: relatedCats } = await supabase.from('categories').select('id').eq('slug', currentCat.slug);
                const categoryIds = relatedCats?.map(c => c.id) || [categoryId];
                query = query.in('category_id', categoryIds);
            } else {
                query = query.eq('category_id', categoryId);
            }

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const offset = (page - 1) * limit;
            const { data, count } = await query
                .order('order_position', { ascending: true })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const talks = (data || []).map((talk: any) => ({
                ...talk,
                speaker_name_vi: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
                speaker_name_km: talk.instructor_name_km,
                speaker_name_en: talk.instructor_name_en,
                speaker_name: talk.instructor_name_vi || 'Multi-tenant Ecosystem',
            }));

            return {
                talks,
                total: count || 0
            };
        },
        ['learning-resources-page-v1', page.toString(), categoryId, limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['learning-resources', tenantId ? `learning-resources-${tenantId}` : 'learning-resources-all'] }
    )();
};
