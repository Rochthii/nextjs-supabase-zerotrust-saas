import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/permissions';

/**
 * Guard protecting all /api/admin/* routes.
 * Reuses getUserContext() from lib/permissions to:
 *  1. Authenticate JWT (Supabase Auth)
 *  2. Verify RBAC role from user_roles table (or app_metadata fallback)
 *
 * @example
 * const guard = await requireAdmin();
 * if (guard.error) return guard.error;
 */
const ALLOWED_ADMIN_ROLES = [
    'super_admin',
    'company_editor',
    'tenant_admin',
    'tenant_editor',
    'tenant_accountant',
    'agency_admin',
    'admin',
    'moderator',
    'editor',
] as const;

export async function requireAdmin(): Promise<
    { userCtx: Awaited<ReturnType<typeof getUserContext>>; error: null } |
    { userCtx: null; error: NextResponse }
> {
    try {
        const userCtx = await getUserContext();

        if (!userCtx) {
            return {
                userCtx: null,
                error: NextResponse.json(
                    { error: 'Unauthorized. Please log in to the administrative portal.' },
                    { status: 401 }
                ),
            };
        }

        if (!ALLOWED_ADMIN_ROLES.includes(userCtx.role as any)) {
            return {
                userCtx: null,
                error: NextResponse.json(
                    { error: 'Forbidden. You do not have permission to perform this action.' },
                    { status: 403 }
                ),
            };
        }

        return { userCtx, error: null };
    } catch (err) {
        console.error('[requireAdmin] Unexpected error:', err);
        return {
            userCtx: null,
            error: NextResponse.json(
                { error: 'Internal authentication system error.' },
                { status: 500 }
            ),
        };
    }
}
