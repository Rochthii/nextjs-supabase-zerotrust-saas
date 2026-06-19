import { SupabaseClient } from '@supabase/supabase-js';

// --- Types ---
export interface SearchResult {
    id: string;
    type: 'news' | 'media' | 'event' | 'category' | 'page' | 'dharma_talk' | 'tag';
    title: string;
    description?: string;
    url: string;
    imageUrl?: string;
    badge?: string;
}

// --- Normalize Vietnamese (Remove diacritics for search fallback) ---
export function removeVietnameseDiacritics(str: string): string {
    return (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

/**
 * Core search logic shared between API and Search Page
 */
export async function performGlobalSearch(
    supabase: SupabaseClient,
    query: string,
    tenantId: string,
    limit: number = 20
): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q || q.length < 2) return [];

    const pattern = `%${q}%`;
    const patternNoDiacritics = `%${removeVietnameseDiacritics(q)}%`;

    const [newsRes, eventsRes, mediaRes, categoriesRes, talkItemsRes, tagsRes] = await Promise.allSettled([
        // 1. News
        supabase
            .from('news')
            .select('id, title_vi, excerpt_vi, slug, thumbnail_url, status')
            .or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`)
            .eq('status', 'published')
            .or(`title_vi.ilike.${pattern},excerpt_vi.ilike.${pattern},title_vi.ilike.${patternNoDiacritics},excerpt_vi.ilike.${patternNoDiacritics}`)
            .order('published_at', { ascending: false })
            .limit(limit),

        // 2. Events
        supabase
            .from('events')
            .select('id, title_vi, description_vi, thumbnail_url, start_date')
            .or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`)
            .neq('status', 'cancelled')
            .or(`title_vi.ilike.${pattern},description_vi.ilike.${pattern},title_vi.ilike.${patternNoDiacritics},description_vi.ilike.${patternNoDiacritics}`)
            .order('start_date', { ascending: false })
            .limit(limit),

        // 3. Media
        supabase
            .from('media')
            .select('id, title_vi, description_vi, url, thumbnail_url, type')
            .or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`)
            .or(`title_vi.ilike.${pattern},description_vi.ilike.${pattern},title_vi.ilike.${patternNoDiacritics},description_vi.ilike.${patternNoDiacritics}`)
            .order('created_at', { ascending: false })
            .limit(limit),

        // 4. Categories
        supabase
            .from('categories')
            .select('id, name_vi, name_en, slug, module')
            .or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`)
            .or(`name_vi.ilike.${pattern},name_vi.ilike.${patternNoDiacritics}`)
            .limit(limit),

        // 5. Dharma Talks
        supabase
            .from('dharma_talks' as any)
            .select('id, title_vi, description_vi, thumbnail_url, media_url')
            .or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`)
            .eq('is_active', true)
            .or(`title_vi.ilike.${pattern},description_vi.ilike.${pattern},title_vi.ilike.${patternNoDiacritics},description_vi.ilike.${patternNoDiacritics}`)
            .limit(limit),

        // 6. Tags
        supabase
            .from('tags')
            .select('id, name, slug')
            .or(`name.ilike.${pattern},name.ilike.${patternNoDiacritics}`)
            .limit(limit),
    ]);

    const results: SearchResult[] = [];

    // News
    if (newsRes.status === 'fulfilled' && newsRes.value.data) {
        for (const item of newsRes.value.data) {
            results.push({
                id: item.id, type: 'news',
                title: item.title_vi,
                description: item.excerpt_vi || undefined,
                url: `/tin-tuc/${item.slug}`,
                imageUrl: item.thumbnail_url || undefined,
                badge: 'News',
            });
        }
    }

    // Events
    if (eventsRes.status === 'fulfilled' && eventsRes.value.data) {
        for (const item of eventsRes.value.data) {
            results.push({
                id: item.id, type: 'event',
                title: item.title_vi,
                description: item.description_vi || undefined,
                url: `/lich-le/${item.id}`,
                imageUrl: item.thumbnail_url || undefined,
                badge: 'Event',
            });
        }
    }

    // Media
    if (mediaRes.status === 'fulfilled' && mediaRes.value.data) {
        const TYPE_LABELS: Record<string, string> = {
            document: 'Document', book: 'Kinh sách', sutra: 'Kinh văn',
            audio: 'Pháp âm', video: 'Video', image: 'Image', external_link: 'Liên kết',
        };
        for (const item of mediaRes.value.data) {
            results.push({
                id: item.id, type: 'media',
                title: item.title_vi,
                description: item.description_vi || undefined,
                url: item.url,
                imageUrl: item.thumbnail_url || undefined,
                badge: TYPE_LABELS[item.type] || 'Document',
            });
        }
    }

    // Categories
    if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
        const MODULE_PATHS: Record<string, string> = {
            news: '/tin-tuc', dharma_talks: '/documents', documents: '/tai-lieu-so', events: '/lich-le',
        };
        for (const item of categoriesRes.value.data) {
            const basePath = MODULE_PATHS[item.module || ''] || '/tai-lieu-so';
            results.push({
                id: item.id, type: 'category',
                title: item.name_vi,
                description: item.name_en || undefined,
                url: `${basePath}?category=${item.id}`,
                badge: 'Category',
            });
        }
    }

    // Dharma Talks
    if (talkItemsRes.status === 'fulfilled' && talkItemsRes.value.data) {
        for (const item of talkItemsRes.value.data as any[]) {
            results.push({
                id: item.id, type: 'dharma_talk',
                title: item.title_vi,
                description: item.description_vi || undefined,
                url: `/documents`,
                imageUrl: item.thumbnail_url || undefined,
                badge: 'Pháp thoại',
            });
        }
    }

    // Tags
    if (tagsRes.status === 'fulfilled' && tagsRes.value.data) {
        for (const item of tagsRes.value.data as any[]) {
            results.push({
                id: item.id, type: 'tag',
                title: `#${item.name}`,
                description: 'Topic content related',
                url: `/chu-de/${item.slug}`,
                badge: 'Topic',
            });
        }
    }

    // Sort: exact title matches first, then by type priority
    const typePriority: Record<string, number> = {
        tag: 1, news: 2, event: 3, dharma_talk: 4, media: 5, category: 6, page: 7,
    };

    const qLower = removeVietnameseDiacritics(q.toLowerCase());
    
    results.sort((a, b) => {
        const aTitle = removeVietnameseDiacritics(a.title.toLowerCase());
        const bTitle = removeVietnameseDiacritics(b.title.toLowerCase());
        
        const aExact = aTitle.startsWith(qLower) ? 0 : 1;
        const bExact = bTitle.startsWith(qLower) ? 0 : 1;
        
        if (aExact !== bExact) return aExact - bExact;
        return (typePriority[a.type] || 9) - (typePriority[b.type] || 9);
    });

    return results;
}
