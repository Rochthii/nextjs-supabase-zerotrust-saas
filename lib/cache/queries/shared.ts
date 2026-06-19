import { createClient as createSupabaseJSClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

// ─── Types ───
export type NewsRow = Database['public']['Tables']['news']['Row'];
export type EventRow = Database['public']['Tables']['events']['Row'] & {
    is_major_festival?: boolean;
};
export type HeroSlideRow = Database['public']['Tables']['hero_slides']['Row'];
export type MediaRow = Database['public']['Tables']['media']['Row'];
export type AboutSectionRow = Database['public']['Tables']['about_sections']['Row'];

export type DharmaTalkRow = Database['public']['Tables']['learning_resources']['Row'] & {
    speaker_name_vi: string | null;
    speaker_name_km: string | null;
    speaker_name_en: string | null;
    speaker_name: string | null;
};

// ─── Singleton Clients ───
let globalPublicClient: ReturnType<typeof createSupabaseJSClient<Database>> | null = null;
let globalServiceRoleClient: ReturnType<typeof createSupabaseJSClient<Database>> | null = null;

export function getPublicClient() {
    if (globalPublicClient) return globalPublicClient;
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('[Supabase] Missing Public Client config');
        throw new Error('System is not configured with Supabase Public Key. Please check environment variables.');
    }

    globalPublicClient = createSupabaseJSClient<Database>(url, key);
    return globalPublicClient;
}

export function getServiceRoleClient() {
    if (globalServiceRoleClient) return globalServiceRoleClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return getPublicClient();
    }

    globalServiceRoleClient = createSupabaseJSClient<Database>(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
    return globalServiceRoleClient;
}

// ─── Cache TTL configurations ───
export const TTL = {
    HERO_SLIDES: false as const,     // Permanent
    NEWS: false as const,            // Permanent
    NEWS_PAGE: false as const,       // Permanent
    CATEGORIES: false as const,      // Permanent
    EVENTS: false as const,          // Permanent
    DHARMA_TALKS: false as const,    // Permanent
    MEDIA: false as const,           // Permanent
    ABOUT_SECTIONS: false as const,  // Permanent
} as const;

// ─── Shared helper keywords ───
export const BUDDHIST_KEYWORDS = [
    'phật', 'tăng sự', 'tu viện', 'pali', 'khmer', 'kinh tụng', 'nghi thức', 'thiền môn', 'tam tạng', 'chú giải', 'pháp thoại'
];

/**
 * Extract Base Slug from a slug with tenant ID suffix
 */
export function getBaseSlug(slug: string): string {
    if (!slug) return '';
    if (slug.includes('--')) return slug.split('--')[0];
    
    const hexSuffixRegex = /-[0-9a-f]{8}$/;
    if (hexSuffixRegex.test(slug)) {
        return slug.replace(hexSuffixRegex, '');
    }
    
    return slug;
}
