import { unstable_cache } from 'next/cache';
import { getPublicClient, TTL, type MediaRow } from './shared';

// ─── Media paginated by category group ─────────────────────────────
export const getCachedMediaByCategoryGroup = async (
    categoryIds: string[],
    limit: number = 12,
    tenantId?: string,
    filters?: { search?: string; type?: string; author?: string }
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            if (!categoryIds || categoryIds.length === 0) return [];

            const supabase = getPublicClient();
            
            let finalCategoryIds = categoryIds;
            if (categoryIds.length === 1) {
                const { data: currentCat } = await supabase.from('categories').select('slug').eq('id', categoryIds[0]).single();
                if (currentCat?.slug) {
                    const { data: relatedCats } = await supabase.from('categories').select('id').eq('slug', currentCat.slug);
                    if (relatedCats && relatedCats.length > 0) {
                        const baseIds = relatedCats.map(c => c.id);
                        const { data: childCats } = await supabase.from('categories').select('id').in('parent_id', baseIds);
                        finalCategoryIds = [...new Set([...baseIds, ...(childCats?.map(c => c.id) || [])])];
                    }
                }
            }

            let query = supabase
                .from('media')
                .select('*')
                .in('category_id', finalCategoryIds);

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            if (filters?.search) {
                query = query.ilike('title_vi', `%${filters.search}%`);
            }
            if (filters?.type && (filters.type as any) !== 'all') {
                query = query.eq('type', filters.type as any);
            }
            if (filters?.author && filters.author !== 'all') {
                query = query.eq('author_name_vi', filters.author);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] media_by_category_group error:', error.message);
                return [];
            }
            return data ?? [];
        },
        ['media-by-category-group', categoryIds.join(','), limit.toString(), tenantId || 'all', JSON.stringify(filters || {})],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── Media paginated for uncategorized elements ────────────────────────────────
export const getCachedUncategorizedMedia = async (
    limit: number = 12,
    tenantId?: string,
    filters?: { search?: string; type?: string; author?: string }
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();

            let catQuery = supabase.from('categories').select('id').in('module', ['media', 'documents']);
            if (tenantId) {
                catQuery = catQuery.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }
            const { data: tenantCats } = await catQuery;
            const tenantCatIds = (tenantCats || []).map(c => c.id);

            let query = supabase
                .from('media')
                .select('*');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            if (filters?.search) {
                query = query.ilike('title_vi', `%${filters.search}%`);
            }
            if (filters?.type && (filters.type as any) !== 'all') {
                query = query.eq('type', filters.type as any);
            }
            if (filters?.author && filters.author !== 'all') {
                query = query.eq('author_name_vi', filters.author);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] uncategorized_media error:', error.message);
                return [];
            }

            const filtered = (data ?? []).filter(item =>
                !item.category_id || !tenantCatIds.includes(item.category_id)
            ).slice(0, limit);

            return filtered;
        },
        ['media-uncategorized-v4', limit.toString(), tenantId || 'all', JSON.stringify(filters || {})],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── Category Item Counts ──────────────────────────────────────────────────
export const getCachedCategoryItemCounts = async (tenantId?: string): Promise<Record<string, number>> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            
            let query = supabase
                .from('media')
                .select('category_id');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query;
            if (error) {
                console.error('[Cache] category_item_counts error:', error.message);
                return {};
            }

            const counts: Record<string, number> = {};
            data?.forEach(item => {
                if (item.category_id) {
                    counts[item.category_id] = (counts[item.category_id] || 0) + 1;
                }
            });
            return counts;
        },
        ['category-item-counts', tenantId || 'all'],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── Media List ──────────────────────────────────────────────────────────────
export const getCachedMedia = async (tenantId?: string): Promise<MediaRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('media')
                .select('*');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('[Cache] media error:', error.message);
                return [];
            }
            return (data ?? []) as unknown as MediaRow[];
        },
        ['media-gallery', tenantId || 'all'],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── Media Events ─────────────────────────────────────────────────────────────
export const getCachedMediaEvents = async (tenantId?: string): Promise<Array<{ id: string; title_vi: string }>> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('events')
                .select('id, title_vi')
                .neq('status', 'cancelled');

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query.order('start_date', { ascending: false });

            if (error) {
                console.error('[Cache] media_events error:', error.message);
                return [];
            }
            return data ?? [];
        },
        ['media-events-v2', tenantId || 'all'],
        { revalidate: false, tags: ['events', 'media', tenantId ? `events-${tenantId}` : 'events-all', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── Document Categories ──────────────────────────────────────────────────────
export const getCachedDocumentCategories = async (tenantId?: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('categories')
                .select('id, name_vi, name_km, name_en, slug, parent_id')
                .eq('module', 'documents');

            if (tenantId) {
                query = query.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }

            const { data, error } = await query.order('order_position', { ascending: true }).order('created_at', { ascending: true });

            if (error) {
                console.error('[Cache] document_categories error:', error.message);
                return [];
            }
            return data || [];
        },
        ['document-categories', tenantId || 'all'],
        { revalidate: TTL.CATEGORIES, tags: ['categories', tenantId ? `categories-${tenantId}` : 'categories-all'] }
    )();
};

// ─── Documents Page ──────────────────────────────────────────────────────────
export const getCachedDocumentsPage = async (page: number, categoryId: string, limit: number, tenantId?: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('media')
                .select('*', { count: 'exact' });

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            if (categoryId && categoryId !== 'all') {
                const { data: children } = await supabase.from('categories').select('id').eq('parent_id', categoryId);
                const categoryIds = [categoryId];
                if (children && children.length > 0) {
                    categoryIds.push(...children.map(c => c.id));
                }
                query = query.in('category_id', categoryIds);
            }

            const offset = (page - 1) * limit;
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('[Cache] documents error:', error.message);
                return { documents: [], total: 0 };
            }
            return { documents: (data as MediaRow[]) || [], total: count || 0 };
        },
        ['documents-page', page.toString(), categoryId, limit.toString(), tenantId || 'all'],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── Media Tags ─────────────────────────────────────────────────────────────
export const getCachedMediaTags = async (mediaIds: string[]) => {
    if (!mediaIds || mediaIds.length === 0) return {};
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            const { data: tagLinks, error } = await supabase
                .from('media_tags')
                .select('media_id, tags(*)')
                .in('media_id', mediaIds);

            if (error) {
                console.error('[Cache] media_tags error:', error.message);
                return {};
            }

            const tagsMap: Record<string, any[]> = {};
            tagLinks?.forEach((link: any) => {
                if (!tagsMap[link.media_id]) tagsMap[link.media_id] = [];
                if (link.tags) tagsMap[link.media_id].push(link.tags);
            });
            return tagsMap;
        },
        ['media-tags', mediaIds.sort().join(',')],
        { revalidate: TTL.MEDIA, tags: ['tags', 'media'] }
    )();
};
