import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        // Server Component - cookies can only be modified in Server Actions
                    }
                },
            },
        }
    );
}

/**
 * Admin client using SERVICE_ROLE_KEY.
 * IMPORTANT: Must use createClient from @supabase/supabase-js (NOT @supabase/ssr).
 * Reason: @supabase/ssr attaches auth cookies -> Supabase runs under the authenticated role
 * instead of service_role -> causing "permission denied for table users".
 * A pure cookieless client ensures Supabase correctly resolves to service_role and bypasses all RLS.
 */
export async function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Please add it to your .env.local file.');
    }

    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
