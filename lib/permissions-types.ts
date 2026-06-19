// Client-safe type definitions only
// NO server imports allowed in this file
// Synced with lib/permissions.ts Role union

export type Role =
    | 'super_admin'
    | 'company_editor'
    | 'tenant_admin'
    | 'tenant_editor'
    | 'tenant_accountant'
    | 'agency_admin'
    // Legacy roles (kept for backward compat)
    | 'admin'
    | 'moderator'
    | 'editor'
    | 'volunteer'
    | 'viewer';

export type Resource = 'users' | 'news' | 'events' | 'media' | 'transactions' | 'registrations' | 'settings' | 'analytics' | 'tenants' | 'categories' | 'knowledge-base' | 'mobile_app' | 'finance';
export type Action = 'create' | 'read' | 'update' | 'delete';

/**
 * Display names for roles
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
 * Badge color classes for roles
 */
export function getRoleBadgeColor(role: Role): string {
    const colors: Partial<Record<Role, string>> = {
        super_admin: 'bg-purple-100 text-purple-800',
        company_editor: 'bg-indigo-100 text-indigo-800',
        tenant_admin: 'bg-blue-100 text-blue-800',
        tenant_editor: 'bg-green-100 text-green-800',
        tenant_accountant: 'bg-teal-100 text-teal-800',
        agency_admin: 'bg-blue-100 text-blue-800 border-blue-200 border',
        admin: 'bg-blue-100 text-blue-800',
        moderator: 'bg-orange-100 text-orange-800',
        editor: 'bg-green-100 text-green-800',
        volunteer: 'bg-teal-100 text-teal-800',
        viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] ?? 'bg-gray-100 text-gray-800';
}

