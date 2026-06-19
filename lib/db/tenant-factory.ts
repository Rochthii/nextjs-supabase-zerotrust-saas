/**
 * ============================================================================
 * TENANT FACTORY — lib/db/tenant-factory.ts
 * ============================================================================
 * Central factory for all multi-branch data queries.
 *
 * PRINCIPLES:
 *   1. All PUBLIC queries must go through createTenantQuery()
 *   2. All ADMIN queries must go through createAdminTenantQuery()
 *   3. Automatic caching with correct tag standards: `[module]-${tenantId}`
 *   4. Never forget to filter by tenant_id
 *
 * USAGE:
 *   import { getTenantData, getTenantDataCached } from '@/lib/db/tenant-factory';
 *
 *   // Fetch with cache (used for frontend pages):
 *   const news = await getTenantDataCached('news', tenantId, {
 *       filter: [{ column: 'status', value: 'published' }],
 *       order: { column: 'published_at', ascending: false },
 *       limit: 10,
 *       cacheTag: 'news',
 *   });
 *
 *   // Fetch without cache (used for admin pages):
 *   const news = await getTenantData('news', tenantId, { ... });
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Database } from '@/lib/supabase/database.types';

// ─── Types ────────────────────────────────────────────────────────────────────

type TableName = keyof Database['public']['Tables'];

export interface TenantQueryOptions {
    /** Additional filter conditions (in addition to tenant_id) */
    filter?: Array<{
        column: string;
        value: string | number | boolean | null;
        operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'is' | 'in';
    }>;
    /** Sort results */
    order?: {
        column: string;
        ascending?: boolean;
    };
    /** Limit number of results */
    limit?: number;
    /** Columns to retrieve (default '*') */
    select?: string;
    /** Cache tag (will be automatically combined with tenantId) */
    cacheTag?: string;
    /** Cache TTL (seconds, default false = permanent) */
    cacheTtl?: number | false;
}

// ─── Public Client (none cookies, an toàn với unstable_cache) ─────────────

function createPublicClient() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// ─── Core Query Builder ───────────────────────────────────────────────────────

/**
 * Build and execute query with automatic tenant_id filter.
 * NO cache — used for admin pages or real-time data.
 */
export async function getTenantData<T = any>(
    tableName: string,
    tenantId: string,
    options: Omit<TenantQueryOptions, 'cacheTag' | 'cacheTtl'> = {}
): Promise<T[]> {
    const supabase = createPublicClient();

    let query = supabase
        .from(tableName as any)
        .select(options.select || '*')
        .eq('tenant_id', tenantId);

    // Apply additional filters
    if (options.filter) {
        for (const f of options.filter) {
            const op = f.operator || 'eq';
            if (op === 'eq') query = (query as any).eq(f.column, f.value);
            else if (op === 'neq') query = (query as any).neq(f.column, f.value);
            else if (op === 'gt') query = (query as any).gt(f.column, f.value);
            else if (op === 'gte') query = (query as any).gte(f.column, f.value);
            else if (op === 'lt') query = (query as any).lt(f.column, f.value);
            else if (op === 'lte') query = (query as any).lte(f.column, f.value);
            else if (op === 'is') query = (query as any).is(f.column, f.value);
            else if (op === 'in' && Array.isArray(f.value)) query = (query as any).in(f.column, f.value);
        }
    }

    if (options.order) {
        query = (query as any).order(options.order.column, {
            ascending: options.order.ascending ?? false,
        });
    }

    if (options.limit) {
        query = (query as any).limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error(`[TenantFactory] Error fetching ${tableName} for tenant ${tenantId}:`, error.message);
        return [];
    }

    return (data || []) as T[];
}

/**
 * Build and execute query with automatic tenant_id filter.
 * WITH cache using unstable_cache — used for frontend pages.
 *
 * Automatic tags: ['[cacheTag]-[tenantId]', '[cacheTag]-all']
 */
export async function getTenantDataCached<T = any>(
    tableName: string,
    tenantId: string,
    options: TenantQueryOptions = {}
): Promise<T[]> {
    const cacheTag = options.cacheTag || tableName;
    const ttl = options.cacheTtl !== undefined ? options.cacheTtl : false;

    const cacheKey = [
        tableName,
        tenantId,
        cacheTag,
        JSON.stringify(options.filter || []),
        options.order?.column || 'default',
        String(options.limit || 'all'),
        options.select || '*',
    ];

    return unstable_cache(
        async () => getTenantData<T>(tableName, tenantId, options),
        cacheKey,
        {
            revalidate: ttl,
            tags: [
                cacheTag,
                `${cacheTag}-${tenantId}`,
                `${cacheTag}-all`,
            ],
        }
    )();
}

/**
 * Retrieve a single record by ID and tenant_id.
 */
export async function getTenantRecord<T = any>(
    tableName: string,
    tenantId: string,
    id: string,
    select = '*'
): Promise<T | null> {
    const supabase = createPublicClient();

    const { data, error } = await supabase
        .from(tableName as any)
        .select(select)
        .eq('tenant_id', tenantId)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error(`[TenantFactory] Error fetching ${tableName}/${id}:`, error.message);
        return null;
    }

    return data as T | null;
}

/**
 * Retrieve a single record by slug and tenant_id.
 * Useful for slug-based routing.
 */
export async function getTenantRecordBySlug<T = any>(
    tableName: string,
    tenantId: string,
    slug: string,
    select = '*'
): Promise<T | null> {
    const supabase = createPublicClient();

    const { data, error } = await supabase
        .from(tableName as any)
        .select(select)
        .eq('tenant_id', tenantId)
        .eq('slug', slug)
        .maybeSingle();

    if (error) {
        console.error(`[TenantFactory] Error fetching ${tableName} by slug "${slug}":`, error.message);
        return null;
    }

    return data as T | null;
}

// ─── Cache Tag Helpers ────────────────────────────────────────────────────────

/**
 * Generate standard tags for a module and tenant.
 * Used in revalidateTag() of Server Actions.
 *
 * @example
 * import { buildCacheTags } from '@/lib/db/tenant-factory';
 * const tags = buildCacheTags('news', tenantId);
 * // → ['news', 'news-uuid-abc123', 'news-all']
 */
export function buildCacheTags(module: string, tenantId?: string | null): string[] {
    const base = [module, `${module}-all`];
    if (tenantId) base.push(`${module}-${tenantId}`);
    return base;
}

/**
 * Revalidate cache for a specific module and tenant.
 * Import and invoke in Server Actions after successful CRUD operations.
 *
 * @example
 * import { revalidateTenantCache } from '@/lib/db/tenant-factory';
 * revalidateTenantCache('news', tenantId);
 */
export function revalidateTenantModule(module: string, tenantId?: string | null) {
    // Lazy import to avoid error when used in server components without revalidateTag
    const { revalidateTag } = require('next/cache');
    const tags = buildCacheTags(module, tenantId);
    for (const tag of tags) {
        revalidateTag(tag);
    }
}
