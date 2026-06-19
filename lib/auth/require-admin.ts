/**
 * lib/auth/require-admin.ts
 * Helper used in Server Actions to verify session + role.
 *
 * ROLE HIERARCHY (highest → lowest):
 *   super_admin  →  Full system access
 *   admin        →  Post approval, content + user + settings management
 *   moderator    →  Donation management (specialized)
 *   editor       →  Create/edit news, events, image uploads
 *   viewer       →  Read-only
 *
 * Principle: Higher roles ALWAYS inherit all permissions from lower roles.
 * Authorization details by resource -> view role_permissions table on Supabase.
 *
 * @important Prefer using `lib/permissions.ts` for new logic to better support multi-tenancy.
 */

import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/permissions';
import type { User } from '@supabase/supabase-js';

export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized: You are not authorized to perform this operation') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

// Hierarchy order — the higher the index, the greater the permission
// Matches the role_permissions table in Supabase
const ROLE_HIERARCHY: Record<string, number> = {
    viewer: 1,
    volunteer: 2,  // Extended feature: Only drafts news pending approval
    editor: 3,
    tenant_editor: 3, // New role: Branch-level editor
    moderator: 4,  // Specialized: donation management
    tenant_accountant: 4, // New role: Branch-level accountant
    admin: 5,
    tenant_admin: 5, // New role: Branch-level admin
    company_editor: 5.5, // New role: Company-level editor (higher than branch admin)
    super_admin: 6,
};


async function getCurrentRole(): Promise<{ user: User; role: string }> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new UnauthorizedError('Sign in session has expired. Please sign in again.');
    }

    const activeRole = await getUserRole();
    if (activeRole && ROLE_HIERARCHY[activeRole]) {
        return { user, role: activeRole };
    }

    // ── Fallback: read from app_metadata ─
    const metadataRole = (user.app_metadata?.role as string);
    if (metadataRole && ROLE_HIERARCHY[metadataRole]) {
        return { user, role: metadataRole };
    }

    // ── Default: treat as volunteer (can access collaborator zone only) ─────────
    return { user, role: 'volunteer' };
}

/**
 * Require the user to have AT LEAST the required role (inheriting all lower permissions).
 * Example: requireMinRole('admin') -> allows both 'admin' and 'super_admin'.
 *
 * @param minRole The minimum required role
 */
export async function requireMinRole(minRole: string): Promise<User> {
    const { user, role } = await getCurrentRole();

    const userLevel = ROLE_HIERARCHY[role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 99;

    if (userLevel < requiredLevel) {
        throw new UnauthorizedError(
            `Insufficient permissions (minimum required: ${minRole}, current: ${role})`
        );
    }

    return user;
}

/**
 * Require exactly one of the listed roles (no inheritance).
 * Used when specific role control is needed, not commonly used.
 */
export async function requireRole(allowedRoles: string[]): Promise<User> {
    const { user, role } = await getCurrentRole();

    if (!allowedRoles.includes(role)) {
        throw new UnauthorizedError(
            `Insufficient permissions (required: ${allowedRoles.join(' or ')}, current: ${role})`
        );
    }

    return user;
}

// ─── Shortcuts for each permission level (recommended) ───────────────────────

/** 
 * Super admin only 
 * @deprecated Use requireSuperAdmin from '@/lib/permissions' to unify RBAC and Tenant Isolation logic.
 */
export async function requireSuperAdmin(): Promise<User> {
    return requireMinRole('super_admin');
}

/** 
 * From admin and above (admin, super_admin) 
 * @deprecated Use requirePermission('resource', 'action') from '@/lib/permissions' to manage permission details.
 */
export async function requireAdmin(): Promise<User> {
    return requireMinRole('admin');
}

/** From editor and above (editor, admin, super_admin) */
export async function requireEditor(): Promise<User> {
    return requireMinRole('editor');
}

/** From viewer and above — meaning just signed in */
export async function requireViewer(): Promise<User> {
    return requireMinRole('viewer');
}

/** Volunteer and above only (used for Collaborator Portal pages) */
export async function requireVolunteer(): Promise<User> {
    return requireMinRole('volunteer');
}

// ─── Convenient wrappers ──────────────────────────────────────────────────────

/**
 * Safe wrapper for Server Actions — does not throw, returns an error object.
 */
export async function withAuth<T>(
    fn: (user: User) => Promise<T>,
    minRole: string = 'admin'
): Promise<T | { success: false; error: string; unauthorized: true }> {
    try {
        const user = await requireMinRole(minRole);
        return await fn(user);
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            return { success: false, error: err.message, unauthorized: true };
        }
        throw err;
    }
}

/** @deprecated Use withAuth(fn, 'admin') instead */
export async function withAdminAuth<T>(
    fn: (user: User) => Promise<T>
): Promise<T | { success: false; error: string; unauthorized: true }> {
    return withAuth(fn, 'admin');
}

/** Get standard display name from user metadata */
export function getAuthorName(user: any): string {
    return user?.user_metadata?.full_name
        || user?.user_metadata?.name
        || user?.email?.split('@')[0]
        || 'Unknown';
}
