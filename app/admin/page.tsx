import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenant';

/**
 * /admin — Smart Router
 *
 * Đây là page HUB trung tâm của toàn bộ system admin.
 * None content — chỉ đọc role và redirect về đúng page:
 *
 * 1. Nếu domain current khớp với một branch và user có quyền -> vào luôn branch đó.
 * 2. super_admin / admin / company_editor → /admin/select-tenant
 * 3. tenant_admin / tenant_editor / ... → /admin/t/[tenantId]/dashboard (page branch của last name)
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
        // Nếu là super_admin hoặc tenant_admin của đúng branch này
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

    // Tenant staff → vào thẳng page branch của last name
    const tenantRoles = ['tenant_admin', 'tenant_editor', 'tenant_accountant', 'editor', 'moderator'];
    if (tenantRoles.includes(role) && ctx?.tenantId) {
        redirect(`/admin/t/${ctx.tenantId}/dashboard`);
    }

    // Volunteer (Thực tập sinh/CTV) hoặc Viewer (Nhân viên) → Không được vào Admin
    // Đẩy last name về page Web internally (Public site) để last name view document/news
    if (role === 'volunteer' || role === 'viewer') {
        if (currentTenant) {
            redirect('/');
        } else if (ctx?.tenantId) {
            redirect(`/?tenant_id=${ctx.tenantId}`);
        } else {
            redirect('/');
        }
    }

    // Fallback: not yet tenant được gán → về page select hoặc báo error
    redirect('/admin/select-tenant');
}
