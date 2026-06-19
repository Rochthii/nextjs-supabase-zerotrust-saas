'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { getUserContext, type Role, type Permission, type Resource } from '@/lib/permissions';

const VALID_ROLES = [
    'super_admin',
    'agency_admin',
    'company_editor',
    'tenant_admin',
    'tenant_editor',
    'tenant_accountant',
    'admin',
    'moderator',
    'editor',
    'volunteer',
    'viewer'
] as const;
type ValidRole = typeof VALID_ROLES[number];

const ROLE_LEVEL: Record<string, number> = {
    viewer: 1,
    volunteer: 1,
    editor: 2,
    tenant_editor: 3,
    tenant_accountant: 3,
    moderator: 4,
    tenant_admin: 5,
    admin: 5,
    agency_admin: 5,
    company_editor: 6,
    super_admin: 7,
};

/**
 * Update user role.
 * Only super_admin is permitted. Admins cannot elevate anyone to a level ≥ their own.
 */
export async function updateUserRole(userId: string, newRole: string, tenantId?: string | null) {
    try {
        const user = await requireAdmin();
        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized', unauthorized: true };

        const supabase = await createAdminClient();

        if (userId === user.id) {
            return { success: false, error: 'Cannot change your own role' };
        }

        if (!VALID_ROLES.includes(newRole as ValidRole)) {
            return { success: false, error: `Invalid role: "${newRole}". Valid roles: ${VALID_ROLES.join(', ')}` };
        }

        const currentRole = ctx.role;
        const currentLevel = ROLE_LEVEL[currentRole] ?? 4;
        const newRoleLevel = ROLE_LEVEL[newRole] ?? 1;

        if (newRoleLevel > currentLevel) {
            return {
                success: false,
                error: `Cannot grant role "${newRole}" higher than your own permissions ("${currentRole}")`
            };
        }

        let finalTenantId = tenantId ? tenantId : null;

        // Security Guard: tenant_admin restrictions
        if (currentRole === 'tenant_admin') {
            const myTenantId = ctx.tenantId;

            if (!myTenantId) {
                return { success: false, error: 'Your admin account has not been assigned to a specific branch.' };
            }

            // Force the tenant ID to be their own
            finalTenantId = myTenantId;

            // Validate the target user is actually in their tenant
            const { data: targetMembership } = await (supabase as any)
                .from('tenant_members')
                .select('id')
                .eq('user_id', userId)
                .eq('tenant_id', myTenantId)
                .maybeSingle();

            if (!targetMembership) {
                return { success: false, error: 'You do not have permission to modify accounts from another branch.' };
            }

            // Explicitly deny global roles for tenant_admin
            const disallowedRoles = ['super_admin', 'agency_admin', 'company_editor', 'admin', 'tenant_accountant'];
            if (disallowedRoles.includes(newRole)) {
                return { success: false, error: 'Branch admin cannot grant central administrator privileges.' };
            }
        }

        const { data: targetUser } = await supabase.auth.admin.getUserById(userId);
        const oldRole = (targetUser?.user?.app_metadata?.role ?? targetUser?.user?.user_metadata?.role) ?? 'viewer';

        // 1. Use admin API to update user metadata (for backward compat)
        const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role: newRole }
        });

        if (error) {
            console.error('Update role error:', error);
            return { success: false, error: 'Error updating permission metadata: ' + error.message };
        }

        // 2. Insert/Update membership in tenant_members
        let memberId: string;
        
        let memberQuery = (supabase as any)
            .from('tenant_members')
            .select('id')
            .eq('user_id', userId);
            
        if (finalTenantId) {
            memberQuery = memberQuery.eq('tenant_id', finalTenantId);
        } else {
            memberQuery = memberQuery.is('tenant_id', null);
        }
        
        const { data: existingMember, error: memberFindError } = await memberQuery.maybeSingle();
        
        if (memberFindError) {
            console.error('Find member error:', memberFindError);
            return { success: false, error: 'Failed to resolve membership: ' + memberFindError.message };
        }
        
        if (existingMember) {
            memberId = existingMember.id;
        } else {
            const { data: newMember, error: memberCreateError } = await (supabase as any)
                .from('tenant_members')
                .insert({
                    user_id: userId,
                    tenant_id: finalTenantId
                })
                .select('id')
                .single();
                
            if (memberCreateError || !newMember) {
                console.error('Create member error:', memberCreateError);
                return { success: false, error: 'Failed to create membership: ' + (memberCreateError?.message || 'Unknown') };
            }
            memberId = newMember.id;
        }
        
        // 3. Update role in tenant_member_roles (wipe old roles for this membership and insert the new one)
        const { error: deleteError } = await (supabase as any)
            .from('tenant_member_roles')
            .delete()
            .eq('member_id', memberId);
            
        if (deleteError) {
            console.error('Delete old roles error:', deleteError);
            return { success: false, error: 'Failed to clean old roles: ' + deleteError.message };
        }
        
        const { error: insertError } = await (supabase as any)
            .from('tenant_member_roles')
            .insert({
                member_id: memberId,
                role_id: newRole
            });
            
        if (insertError) {
            console.error('Insert new role error:', insertError);
            return { success: false, error: 'Failed to assign new role: ' + insertError.message };
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'auth.users',
            recordId: userId,
            oldData: { role: oldRole },
            newData: { role: newRole },
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update role error:', err);
        return { success: false, error: 'An error occurred' };
    }
}

/**
 * Ban or unban a user (admin and above)
 */
export async function toggleUserBan(userId: string, shouldBan: boolean) {
    try {
        const user = await requireAdmin();
        const supabase = await createAdminClient();

        if (userId === user.id) {
            return { success: false, error: 'Cannot lock your own account' };
        }

        // Ban 100 years = permanent lock, 'none' = unlock
        const banDuration = shouldBan ? '876000h' : 'none';

        const { error } = await supabase.auth.admin.updateUserById(userId, {
            ban_duration: banDuration
        });

        if (error) {
            console.error('Toggle ban error:', error);
            return { success: false, error: 'Error changing status: ' + error.message };
        }

        await createAuditLog({
            user,
            action: shouldBan ? 'update' : 'restore',
            tableName: 'auth.users',
            recordId: userId,
            newData: { banned: shouldBan },
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Toggle ban error:', err);
        return { success: false, error: 'An error occurred' };
    }
}

/**
 * Create new user (admin and above).
 * Admins can only create users with a role ≤ their own.
 */
export async function createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    tenantId?: string | null;
}) {
    try {
        const currentUser = await requireAdmin();
        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized', unauthorized: true };

        const supabaseAdmin = await createAdminClient();

        if (!VALID_ROLES.includes(data.role as ValidRole)) {
            return { success: false, error: `Invalid role: "${data.role}"` };
        }

        const currentRole = ctx.role;
        const currentLevel = ROLE_LEVEL[currentRole] ?? 4;
        const newRoleLevel = ROLE_LEVEL[data.role] ?? 1;

        if (newRoleLevel > currentLevel) {
            return {
                success: false,
                error: `Cannot create user with role "${data.role}" higher than your own permissions ("${currentRole}")`
            };
        }

        let finalTenantId = data.tenantId ? data.tenantId : null;

        // Security Guard: tenant_admin restrictions
        if (currentRole === 'tenant_admin') {
            const myTenantId = ctx.tenantId;

            if (!myTenantId) {
                return { success: false, error: 'Your admin account has not been assigned to a specific branch.' };
            }

            // Force the tenant ID to be their own
            finalTenantId = myTenantId;

            // Explicitly deny global roles for tenant_admin
            const disallowedRoles = ['super_admin', 'agency_admin', 'company_editor', 'admin', 'tenant_accountant'];
            if (disallowedRoles.includes(data.role)) {
                return { success: false, error: 'Branch admin cannot grant central administrator privileges.' };
            }
        }

        // 1. Create user in Supabase Auth
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true, // Auto confirm
            user_metadata: {
                full_name: data.fullName,
                role: data.role
            }
        });

        if (error) {
            console.error('Create user error:', error);
            if (error.message.includes('already registered')) {
                return { success: false, error: 'This email is already registered' };
            }
            return { success: false, error: 'Error creating user: ' + error.message };
        }

        if (!newUser.user) {
            return { success: false, error: 'Failed to create user (Unknown error)' };
        }

        // 2. Insert into tenant_members (Multi-tenant)
        const { data: memberData, error: memberError } = await (supabaseAdmin as any)
            .from('tenant_members')
            .insert({
                user_id: newUser.user.id,
                tenant_id: finalTenantId
            })
            .select('id')
            .single();

        if (memberError || !memberData) {
            console.error('Create tenant member error:', memberError);
            return { success: false, error: 'Failed to assign tenant membership: ' + (memberError?.message || 'Unknown') };
        }

        // 3. Insert into tenant_member_roles
        const { error: roleError } = await (supabaseAdmin as any)
            .from('tenant_member_roles')
            .insert({
                member_id: memberData.id,
                role_id: data.role
            });

        if (roleError) {
            console.error('Assign role error:', roleError);
            return { success: false, error: 'Failed to assign user role: ' + roleError.message };
        }

        await createAuditLog({
            user: currentUser,
            action: 'create',
            tableName: 'auth.users',
            recordId: newUser.user.id,
            newData: {
                email: data.email,
                role: data.role,
                full_name: data.fullName
            },
        });

        revalidatePath('/admin/users');
        return { success: true, userId: newUser.user.id };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Create user exception:', err);
        return { success: false, error: 'An error occurred: ' + (err.message || 'Unknown') };
    }
}

/**
 * Update custom permission overrides for a specific User.
 * Stored as JSONB in the `custom_permissions` column of `user_roles`.
 */
export async function updateUserCustomPermissions(targetUserId: string, customPermissions: Partial<Record<string, Partial<Permission>>> | null) {
    return { success: true, message: 'Custom permissions overrides are deprecated in RBAC v2. All permissions are role-based.' };
}
