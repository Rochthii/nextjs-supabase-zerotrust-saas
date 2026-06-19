import { createAdminClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

/**
 * Advanced Rate Limiting Service
 * Protects against spam by tracking hits in the database.
 */
export const RateLimit = {
    /**
     * Get client IP from headers securely
     */
    async getIP(): Promise<string> {
        const headerList = await headers();
        const forwarded = headerList.get('x-forwarded-for');
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return '127.0.0.1';
    },

    /**
     * Check if an action is rate limited
     * @param action The type of action (e.g., 'contact', 'transaction')
     * @param limit Max hits allowed in the window
     * @param windowSeconds Duration of the window in seconds
     * @param tenantId Optional tenant context
     */
    async check(
        action: 'contact' | 'transaction' | 'registration' | 'login',
        limit: number = 5,
        windowSeconds: number = 3600, // Default 1 hour
        tenantId?: string
    ): Promise<{ allowed: boolean; message?: string }> {
        const ip = await this.getIP();
        const supabase = await createAdminClient();

        // Call the stored procedure
        const { data, error } = await (supabase as any).rpc('check_rate_limit', {
            p_ip: ip,
            p_action: action,
            p_max_hits: limit,
            p_window_seconds: windowSeconds,
            p_tenant_id: tenantId || null
        });

        if (error) {
            console.error('Rate limit check error:', error);
            // In case of error, we default to ALLOWING to avoid blocking legitimate users due to system glitches
            return { allowed: true };
        }

        return {
            allowed: !!data,
            message: data ? undefined : `Too many requests. Please try again later.`
        };
    }
};
