import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isGlobalAdmin, getUserContext } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
    const globalAccess = await isGlobalAdmin();
    const ctx = await getUserContext();
    
    if (!ctx) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, tenantId } = ctx;

    // Only Global Admin or Tenant Admin are allowed to perform this action
    if (!globalAccess && role !== 'tenant_admin') {
        return NextResponse.json({ error: 'Unauthorized: You are not authorized to perform this action' }, { status: 401 });
    }
    
    try {
        const { userId, userEmail } = await req.json();
        
        if (!userId && !userEmail) {
            return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
        }

        const supabase = await createAdminClient();
        let targetUserId = userId;

        // If userId is missing but email is provided, lookup userId from auth.users
        if (!targetUserId && userEmail) {
            const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
            if (!usersError && usersData?.users) {
                const user = usersData.users.find((u: any) => u.email === userEmail);
                if (user) targetUserId = user.id;
            }
        }

        if (!targetUserId) {
            return NextResponse.json({ error: 'Unable to resolve user_id for logout' }, { status: 404 });
        }

        // Check security integrity (Tenant Isolation & RBAC) for Tenant Admin
        if (!globalAccess) {
            if (!tenantId) {
                return NextResponse.json({ error: 'Your branch could not be resolved' }, { status: 400 });
            }

            // Check if targetUserId belongs to the same branch (tenantId)
            const { data: memberRoleData, error: checkError } = await (supabase as any)
                .from('tenant_members')
                .select(`
                    id,
                    tenant_member_roles (
                        role_id
                    )
                `)
                .eq('user_id', targetUserId)
                .eq('tenant_id', tenantId)
                .maybeSingle();

            if (checkError || !memberRoleData) {
                // Return 403 Forbidden if the user does not belong to this branch
                return NextResponse.json({ 
                    error: 'Forbidden: You are not authorized to force sign out employees from another branch' 
                }, { status: 403 });
            }

            // Prevent Tenant Admin from force logging out higher-level system administrators
            const rolesList = (memberRoleData.tenant_member_roles || []).map((r: any) => r.role_id);
            const isHigherAdmin = rolesList.some((r: string) => ['super_admin', 'company_editor', 'admin'].includes(r));
            if (isHigherAdmin) {
                return NextResponse.json({ 
                    error: 'Forbidden: You cannot force sign out a higher-level administrator' 
                }, { status: 403 });
            }
        }

        // Force logout using admin signOut (revoke sessions)
        const { error } = await supabase.auth.admin.signOut(targetUserId);
        
        if (error) {
            throw error;
        }

        // Ghi log audit an ninh
        await (supabase as any).from('audit_logs').insert({
            user_id: ctx.userId,
            user_email: ctx.email || 'system@soc',
            tenant_id: tenantId, // Record which tenant this log belongs to
            action: 'security:force_logout',
            resource: 'auth.users',
            table_name: 'auth.users',
            new_data: { targetUserId, userEmail, timestamp: new Date().toISOString(), forced_by: ctx.email }
        });

        try {
            revalidatePath('/admin/security-center');
            revalidatePath('/admin/audit-logs');
            if (tenantId) {
                revalidatePath(`/admin/t/${tenantId}/security`);
                revalidatePath(`/admin/t/${tenantId}/audit-logs`);
                revalidatePath(`/admin/t/${tenantId}/dashboard`);
            }
        } catch (e) {
            console.error('[Revalidate Error]:', e);
        }

        return NextResponse.json({ success: true, message: `Successfully forced sign out of account ${userEmail || targetUserId}` });
    } catch (err: any) {
        console.error('[Force Logout Error]:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
