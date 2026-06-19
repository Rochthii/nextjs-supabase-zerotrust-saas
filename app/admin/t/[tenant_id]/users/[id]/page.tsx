import React from 'react';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { requirePermission, getUserRole, Role, getUserContext } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// @ts-ignore - Module import cache
import { UserForm } from '@/components/admin/user-form';
import Link from 'next/link';
import { ArrowLeft, Settings, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

interface TenantUserEditPageProps {
    params: Promise<{ tenant_id: string; id: string }>;
}

export default async function TenantUserEditPage({ params }: TenantUserEditPageProps) {
    const { tenant_id, id } = await params;

    // Check permission
    await requirePermission('users', 'update');

    let supabaseAdmin: any;
    try {
        supabaseAdmin = await createAdminClient();
    } catch {
        supabaseAdmin = await createClient();
    }
    const currentUserRole = await getUserRole();

    // Fetch user details from auth.users (requires service role)
    let user: any = null;
    let fetchError: any = null;
    try {
        const result = await supabaseAdmin.auth.admin.getUserById(id);
        user = result.data?.user;
        fetchError = result.error;
    } catch {
        fetchError = new Error('Service role key required to fetch user details');
    }

    if (fetchError || !user) {
        notFound();
    }

    // Fetch active membership and roles from tenant_members and tenant_member_roles
    const { data: membershipData } = await (supabaseAdmin as any)
        .from('tenant_members')
        .select(`
            id,
            tenant_id,
            tenant_member_roles (
                role_id
            )
        `)
        .eq('user_id', id)
        .eq('tenant_id', tenant_id)
        .maybeSingle();

    const rolesList = (membershipData?.tenant_member_roles || []).map((r: any) => r.role_id);
    
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

    const activeTenantId = membershipData?.tenant_id ?? null;
    const customPermissions = null;

    // Security Guard: tenant_admin can ONLY edit users within their own tenant
    const ctx = await getUserContext();
    if (ctx?.role === 'tenant_admin') {
        if (!activeTenantId || activeTenantId !== ctx.tenantId || tenant_id !== ctx.tenantId) {
            notFound(); // Hide the existence of other users from local admins
        }
    }

    // Ensure the user edit page tenant parameter matches the user's tenant
    if (activeTenantId !== tenant_id) {
        notFound();
    }

    // Fetch tenants for dropdown
    const { data: tenants } = await supabaseAdmin
        .from('tenants')
        .select('id, name')
        .order('name');

    return (
        <div className="space-y-6 text-slate-300">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <Link href={`/admin/t/${tenant_id}/users`}>
                    <Button variant="outline" size="icon" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-950/20 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Settings className="w-8 h-8 text-amber-400" />
                        Quản lý Account
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">{user.email}</p>
                </div>
            </div>

            {/* User Details Card */}
            <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl">
                <CardHeader className="flex flex-row justify-between items-center border-b border-white/5 pb-4">
                    <CardTitle className="text-white font-bold text-lg">Thông tin account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-400">Email sign in</Label>
                            <Input value={user.email || ''} disabled className="mt-1.5 bg-slate-950/40 border-white/[0.08] text-slate-300 rounded-xl" />
                        </div>
                        <div>
                            <Label className="text-slate-400">Mã định danh (User ID)</Label>
                            <Input value={user.id} disabled className="mt-1.5 bg-slate-950/40 border-white/[0.08] text-slate-300 rounded-xl font-mono text-xs" />
                        </div>
                        <div>
                            <Label className="text-slate-400">Ngày initialize</Label>
                            <Input
                                value={new Date(user.created_at).toLocaleString('vi-VN')}
                                disabled
                                className="mt-1.5 bg-slate-950/40 border-white/[0.08] text-slate-300 rounded-xl"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-400 font-sans">Sign in cuối</Label>
                            <Input
                                value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('vi-VN') : 'Chưa từng sign in'}
                                disabled
                                className="mt-1.5 bg-slate-950/40 border-white/[0.08] text-slate-300 rounded-xl"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Wrap UserForm with dark mode classes in context */}
            <div className="dark-form-wrapper">
                <UserForm
                    userId={user.id}
                    currentRole={activeRole}
                    currentTenantId={activeTenantId}
                    tenants={tenants || []}
                    isBanned={!!user.banned_until}
                    canEdit={['super_admin', 'admin', 'company_editor', 'tenant_admin'].includes(currentUserRole || '')}
                    metadata={user.user_metadata}
                    currentUserRole={currentUserRole}
                />
            </div>
        </div>
    );
}
