import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';

export type Role =
    | 'super_admin'
    | 'company_editor'
    | 'tenant_admin'
    | 'tenant_editor'
    | 'tenant_accountant'
    | 'agency_admin' // Reseller / Company Admin with restricted access
    // Legacy roles (kept for backward compat with existing app_metadata)
    | 'admin'
    | 'moderator'
    | 'editor'
    | 'volunteer'
    | 'viewer';

/** Roles that have global access across all tenants (no tenant isolation) */
export const GLOBAL_ADMIN_ROLES: Role[] = ['super_admin', 'company_editor', 'admin', 'agency_admin', 'tenant_accountant'];

/** Roles that belong to a specific tenant only */
export const TENANT_ROLES: Role[] = ['tenant_admin', 'tenant_editor', 'moderator', 'editor'];

export type Resource = 'users' | 'news' | 'events' | 'media' | 'transactions' | 'registrations' | 'settings' | 'analytics' | 'tenants' | 'categories' | 'knowledge-base' | 'mobile_app' | 'finance';
export type Action = 'create' | 'read' | 'update' | 'delete';

export interface Permission {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
}

export interface UserContext {
    userId: string;
    email: string | undefined;
    role: Role;
    tenantId: string | null;   // null = global (super_admin, company_editor)
    tenantName: string | null;
    customPermissions?: Record<string, Partial<Permission>>;
}

// ─── Request-scoped cache via React.cache() ───────────────────────────────────
// Deduplicates all calls within the SAME server render request.
const getCachedUserContext = cache(async (): Promise<UserContext | null> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get preferred tenant
    const { data: profile } = await (supabase as any)
        .from('user_profiles')
        .select('preferred_tenant_id')
        .eq('id', user.id)
        .maybeSingle();
    const preferredTenantId = profile?.preferred_tenant_id;

    // Extract active tenant from x-pathname header
    let activeTenantId: string | null = null;
    try {
        const headerList = await headers();
        const pathname = headerList.get('x-pathname') || '';
        const match = pathname.match(/^\/(?:[a-z]{2}\/)?admin\/t\/([^\/]+)/);
        if (match) {
            activeTenantId = match[1];
        }
    } catch (e) {
        // Fallback for non-request contexts
    }

    // Get all memberships and roles for this user
    const { data: memberships } = await (supabase as any)
        .from('tenant_members')
        .select(`
            id,
            tenant_id,
            tenants (
                name
            ),
            tenant_member_roles (
                role_id
            )
        `)
        .eq('user_id', user.id);

    let activeMembership = null;
    if (memberships && memberships.length > 0) {
        // 1. Try matching the active tenant from the URL
        if (activeTenantId) {
            activeMembership = memberships.find((m: any) => m.tenant_id === activeTenantId);
        }
        // 2. Try global membership (tenant_id is NULL)
        if (!activeMembership) {
            activeMembership = memberships.find((m: any) => m.tenant_id === null);
        }
        // 3. Try preferred tenant membership
        if (!activeMembership && preferredTenantId) {
            activeMembership = memberships.find((m: any) => m.tenant_id === preferredTenantId);
        }
        // 4. Default to first membership
        if (!activeMembership) {
            activeMembership = memberships[0];
        }
    }

    if (activeMembership) {
        const rolesList = (activeMembership.tenant_member_roles || []).map((r: any) => r.role_id);
        
        const rolePriority: Record<Role, number> = {
            super_admin: 100,
            company_editor: 90,
            tenant_admin: 85,
            tenant_editor: 75,
            tenant_accountant: 65,
            agency_admin: 55,
            admin: 45,
            moderator: 35,
            editor: 25,
            volunteer: 15,
            viewer: 5
        };

        let activeRole: Role = 'viewer';
        let maxPriority = -1;
        for (const r of rolesList) {
            const role = r as Role;
            const priority = rolePriority[role] ?? 0;
            if (priority > maxPriority) {
                maxPriority = priority;
                activeRole = role;
            }
        }

        // Determine tenant context
        const resolvedTenantId = activeMembership.tenant_id ?? activeTenantId ?? null;
        let tenantName = null;
        if (activeMembership.tenant_id) {
            tenantName = (activeMembership.tenants as any)?.name ?? null;
        } else if (resolvedTenantId) {
            const { data: tenant } = await (supabase as any)
                .from('tenants')
                .select('name')
                .eq('id', resolvedTenantId)
                .maybeSingle();
            tenantName = tenant?.name ?? null;
        }

        return {
            userId: user.id,
            email: user.email,
            role: activeRole,
            tenantId: resolvedTenantId,
            tenantName,
        };
    }

    // 2. Fallback: read from app_metadata (trusted backend metadata)
    const legacyRole = (user.app_metadata?.role) as Role | undefined;
    if (legacyRole) {
        return {
            userId: user.id,
            email: user.email,
            role: legacyRole,
            tenantId: activeTenantId || null,
            tenantName: null,
        };
    }

    // Default: restricted access
    return {
        userId: user.id,
        email: user.email,
        role: 'viewer',
        tenantId: activeTenantId || null,
        tenantName: null,
    };
});

/**
 * Get the full user context (role + tenant) — deduplicated per request.
 */
export async function getUserContext(): Promise<UserContext | null> {
    return getCachedUserContext();
}

/**
 * Get the current user's role — deduplicated per request via React.cache()
 */
export async function getUserRole(): Promise<Role | null> {
    const ctx = await getCachedUserContext();
    return ctx?.role ?? null;
}

/**
 * Get current user tenant ID. Returns null for super_admin / company_editor (global scope).
 */
export async function getUserTenantId(): Promise<string | null> {
    const ctx = await getCachedUserContext();
    return ctx?.tenantId ?? null;
}

/**
 * Helper to get the tenant scope for queries. 
 * If the user is a global admin, returns undefined (no scope limit).
 * If the user is a tenant admin/editor, returns their tenant_id. 
 */
export async function getTenantScope(): Promise<string | undefined> {
    const ctx = await getUserContext();
    if (!ctx) throw new Error("Unauthorized");
    if (GLOBAL_ADMIN_ROLES.includes(ctx.role as Role)) {
        return undefined; // Global scope
    }
    if (!ctx.tenantId) {
        throw new Error("UnauthorizedError: Your tenant branch could not be resolved");
    }
    return ctx.tenantId;
}

/**
 * Enforces that a specific record belongs to the user's tenant before allowing update/delete.
 * Validates the UUID against the table. Throws Error if unauthorized or not found.
 */
export async function enforceTenantScopeForRecord(tableName: string, recordId: string) {
    const scope = await getTenantScope();
    if (!scope) return; // Global admins can edit anything

    const supabase = await createClient();
    const { data, error } = await (supabase as any).from(tableName).select('tenant_id').eq('id', recordId).maybeSingle();
    if (error || !data) {
        throw new Error("Record not found");
    }
    if (data.tenant_id && data.tenant_id !== scope) {
        throw new Error("UnauthorizedError: You do not have permission to modify data of another tenant branch");
    }
}

/**
 * Returns true if the user has global scope (sees all tenants).
 */
export async function isGlobalAdmin(): Promise<boolean> {
    const role = await getUserRole();
    return GLOBAL_ADMIN_ROLES.includes(role as Role);
}

/**
 * ─── TENANT ISOLATION GUARD ───────────────────────────────────────────────────
 * Verify that the current user is allowed to access a specific tenant.
 *
 * Usage in any /admin/t/[tenant_id]/* page:
 *   await requireTenantAccess(params.tenant_id);
 *
 * Rules:
 *   - GLOBAL_ADMIN_ROLES (super_admin, admin, company_editor) → always allowed
 *   - TENANT_ROLES (tenant_admin, editor, accountant...) → only if their tenantId matches
 *   - Others (volunteer, viewer) → notFound()
 *
 * Raises notFound() instead of redirect to avoid exposing whether a tenant exists.
 */
export async function requireTenantAccess(tenantIdFromUrl: string): Promise<void> {
    const ctx = await getUserContext();

    if (!ctx) {
        redirect('/login');
    }

    const { role, tenantId } = ctx;

    // Global admins can access any tenant
    if (GLOBAL_ADMIN_ROLES.includes(role as Role)) {
        return;
    }

    // Tenant-scoped users must match the tenant in the URL
    if (TENANT_ROLES.includes(role as Role)) {
        if (tenantId === tenantIdFromUrl) {
            return;
        }
        // Mismatch — return 404 to avoid leaking existence of other tenants
        notFound();
    }

    // All other roles (volunteer, viewer, null) → denied
    notFound();
}

/**
 * ─── SUPER ADMIN ONLY GUARD ────────────────────────────────────────────────────
 * Only allow 'super_admin' role. Any other role (including company_editor, tenant_admin)
 * will be blocked with notFound() to avoid leaking information.
 *
 * Used for the highest system privileges:
 *   - Visual Page Builder (changes home page structure)
 *   - Layout & Theme Management
 */
export async function requireSuperAdmin(): Promise<void> {
    const ctx = await getUserContext();

    if (!ctx) {
        redirect('/login');
    }

    if (ctx.role !== 'super_admin') {
        notFound();
    }
}


// Module-level cache for base role_permissions (resets on server restart)
const basePermissionsCache = new Map<string, Record<Resource, Permission>>();

/**
 * Check if current user has permission for an action on a resource.
 */
export async function checkPermission(resource: Resource, action: Action): Promise<boolean> {
    // Rely on the fully merged permissions matrix which includes custom overrides.
    // The matrix generation itself relies on getCachedUserContext which deduplicates DB calls.
    const matrix = await getUserPermissions();
    if (!matrix || !matrix[resource]) return false;

    return matrix[resource][`can_${action}` as keyof Permission] ?? false;
}

/**
 * Require permission — throws if not authorized. Use in Server Components to protect pages.
 */
export async function requirePermission(resource: Resource, action: Action): Promise<void> {
    const allowed = await checkPermission(resource, action);
    if (!allowed) {
        const role = await getUserRole();
        throw new Error(`Permission denied: ${role || 'no_role'} cannot ${action} ${resource}`);
    }
}

export async function getBasePermissionsByRole(role: Role): Promise<Record<Resource, Permission>> {
    const allTrue: Permission = { can_create: true, can_read: true, can_update: true, can_delete: true };
    const readOnly: Permission = { can_create: false, can_read: true, can_update: false, can_delete: false };
    const emptyPerm: Permission = { can_create: false, can_read: false, can_update: false, can_delete: false };

    let basePermissions: Record<Resource, Permission> = {} as any;

    if (role === 'super_admin' || role === 'company_editor' || role === 'tenant_admin' || role === 'admin' || role === 'agency_admin' || role === 'tenant_accountant') {
        basePermissions = {
            users: role === 'tenant_accountant' ? readOnly : allTrue,
            news: role === 'tenant_accountant' ? readOnly : allTrue,
            events: role === 'tenant_accountant' ? readOnly : allTrue,
            media: role === 'tenant_accountant' ? readOnly : allTrue,
            transactions: allTrue,
            registrations: allTrue,
            settings: role === 'tenant_accountant' ? readOnly : allTrue,
            analytics: allTrue,
            tenants: role === 'tenant_accountant' ? readOnly : allTrue,
            categories: allTrue,
            'knowledge-base': allTrue,
            'mobile_app': (role === 'agency_admin' || role === 'tenant_accountant') ? emptyPerm : allTrue,
            finance: allTrue,
        };
    } else {
        if (basePermissionsCache.has(role)) {
            basePermissions = basePermissionsCache.get(role)!;
        } else {
            const supabase = await createClient();
            const { data } = await (supabase as any).from('role_permissions').select('*').eq('role_id', role);
            basePermissions = Object.fromEntries((data || []).map((p: any) => [p.resource, p])) as Record<Resource, Permission>;
            if (Object.keys(basePermissions).length > 0) {
                basePermissionsCache.set(role, basePermissions);
            }
        }
    }

    let permissions = { ...basePermissions };

    // Fallback logic if DB is empty to prevent locking out valid users
    if (Object.keys(permissions).length === 0) {
        if (role === 'tenant_accountant') {
            permissions = {
                transactions: readOnly,
                registrations: allTrue,
            } as Record<Resource, Permission>;
        } else if (role === 'tenant_editor' || role === 'editor') {
            permissions = {
                news: allTrue,
                events: allTrue,
                media: allTrue,
                categories: allTrue,
                analytics: readOnly,
            } as Record<Resource, Permission>;
        } else if (role === 'moderator' || role === 'tenant_admin') {
            permissions = {
                transactions: readOnly,
                registrations: allTrue,
                news: role === 'tenant_admin' ? allTrue : readOnly,
                events: role === 'tenant_admin' ? allTrue : readOnly,
            } as Record<Resource, Permission>;
        }
    }

    // Ensure all resources exist in the object to avoid undefined errors
    const defaultResources: Resource[] = ['users', 'news', 'events', 'media', 'transactions', 'registrations', 'settings', 'analytics', 'tenants', 'categories', 'knowledge-base', 'mobile_app'];
    for (const res of defaultResources) {
        if (!permissions[res]) permissions[res] = { ...emptyPerm };
    }

    return permissions;
}

export async function getUserPermissions(): Promise<Record<Resource, Permission>> {
    const ctx = await getUserContext();
    if (!ctx || !ctx.role) return {} as any;

    let permissions = await getBasePermissionsByRole(ctx.role);

    // Apply custom overrides
    if (ctx.customPermissions) {
        for (const [res, overrides] of Object.entries(ctx.customPermissions)) {
            const resource = res as Resource;
            if (permissions[resource]) {
                permissions[resource] = { ...permissions[resource], ...overrides };
            }
        }
    }

    return permissions;
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role: Role): string {
    const names: Partial<Record<Role, string>> = {
        super_admin: '⚡ System Admin (Board of Directors)',
        company_editor: '📢 Head of PR & Media',
        tenant_admin: '🏛️ Branch Director',
        tenant_editor: '✍️ Head of Content',
        tenant_accountant: '💰 Chief Financial Officer (CFO)',
        admin: '🔧 IT Admin',
        moderator: '👁️ Mid-level Manager',
        editor: '✏️ Content Specialist',
        volunteer: '🤝 Intern / Contributor',
        viewer: '👤 Staff Member',
        agency_admin: '🏢 Technology Partner',
    };
    return names[role] ?? role;
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: Role): string {
    const colors: Partial<Record<Role, string>> = {
        super_admin: 'bg-purple-100 text-purple-800',
        company_editor: 'bg-indigo-100 text-indigo-800',
        tenant_admin: 'bg-blue-100 text-blue-800',
        tenant_editor: 'bg-green-100 text-green-800',
        tenant_accountant: 'bg-teal-100 text-teal-800',
        admin: 'bg-blue-100 text-blue-800',
        moderator: 'bg-orange-100 text-orange-800',
        editor: 'bg-green-100 text-green-800',
        volunteer: 'bg-teal-100 text-teal-800',
        viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] ?? 'bg-gray-100 text-gray-800';
}
