'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchContent(query: string) {
    const supabase = await createClient();

    // Search news - search in title and content
    const { data: news } = await supabase
        .from('news')
        .select('id, title_vi, title_km, excerpt_vi, slug, published_at')
        .or(`title_vi.ilike.%${query}%,title_km.ilike.%${query}%,content_vi.ilike.%${query}%,content_km.ilike.%${query}%`)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);

    // Search events - search in title and description
    const { data: events } = await supabase
        .from('events')
        .select('id, title_vi, title_km, description_vi, start_date')
        .or(`title_vi.ilike.%${query}%,title_km.ilike.%${query}%,description_vi.ilike.%${query}%`)
        .gte('start_date', new Date().toISOString().split('T')[0]) // Only fetch upcoming events
        .order('start_date', { ascending: true })
        .limit(5);

    return {
        news: news || [],
        events: events || [],
    };
}
