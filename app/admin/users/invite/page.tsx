
import UserInviteForm from './user-invite-form';
import { requirePermission, getUserContext } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/server';

export default async function InviteUserPage() {
    // Ensure user has permission to create users
    await requirePermission('users', 'create');

    const ctx = await getUserContext();
    const supabaseAdmin = await createAdminClient();

    // Fetch tenants for dropdown
    const { data: tenantsData } = await (supabaseAdmin as any)
        .from('tenants')
        .select('id, name')
        .order('name');

    return (
        <div className="container mx-auto py-6">
            <UserInviteForm
                currentUserRole={ctx?.role}
                currentUserTenantId={ctx?.tenantId}
                tenants={tenantsData || []}
            />
        </div>
    );
}
