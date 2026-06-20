import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenant';

/**
 * /admin — Smart Router
 *
 * This is the central HUB page for the entire system administration.
 * No content — only reads user role and redirects to the correct page:
 *
 * 1. If the current domain matches a tenant and the user has permission -> enters that tenant directly.
 * 2. super_admin / admin / company_editor → /admin/select-tenant
 * 3. tenant_admin / tenant_editor / ... → /admin/t/[tenantId]/dashboard (their tenant dashboard)
 * 4. volunteer → /collaborator/news-manager
 * 5. Not authenticated → /login
 */
export default async function AdminRootPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Not authenticated
    if (!user) {
        redirect('/login');
    }

    const ctx = await getUserContext();
    const role = ctx?.role ?? 'viewer';

    // --- NEW: Domain-aware routing ---
    const headerList = await headers();
    const host = headerList.get('host') || '';
    const currentTenant = await getTenantConfig(host);

    if (currentTenant) {
        // If super_admin or tenant_admin of this tenant
        const isGlobal = role === 'super_admin' || role === 'admin' || role === 'company_editor';
        const isThisTenantAdmin = ctx?.tenantId === currentTenant.id;

        if (isGlobal || isThisTenantAdmin) {
            redirect(`/admin/t/${currentTenant.id}/dashboard`);
        }
    }

    // Global admins → page dashboard system
    if (role === 'super_admin' || role === 'company_editor' || role === 'admin') {
        redirect('/admin/dashboard');
    }

    // Tenant staff -> enter tenant dashboard directly
    const tenantRoles = ['tenant_admin', 'tenant_editor', 'tenant_accountant', 'editor', 'moderator'];
    if (tenantRoles.includes(role) && ctx?.tenantId) {
        redirect(`/admin/t/${ctx.tenantId}/dashboard`);
    }

    // Volunteer or Viewer -> Not authorized to enter Admin
    // Redirect them back to the internal web portal to view documents/news
    if (role === 'volunteer' || role === 'viewer') {
        if (currentTenant) {
            redirect('/');
        } else if (ctx?.tenantId) {
            redirect(`/?tenant_id=${ctx.tenantId}`);
        } else {
            redirect('/');
        }
    }

    // Fallback: no tenant assigned yet -> redirect to select-tenant
    redirect('/admin/select-tenant');
}
