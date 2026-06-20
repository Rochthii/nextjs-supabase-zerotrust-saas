import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { requirePermission, getRoleBadgeColor, Role, getUserContext } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Users, UserPlus, Shield, ShieldCheck, UserX, Settings } from 'lucide-react';
import { TenantUsersFilters } from '@/components/admin/tenant-users-filters';

interface TenantUsersPageProps {
    params: Promise<{ tenant_id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'System Admin',
    admin: 'IT Admin',
    agency_admin: 'Technology Partner',
    company_editor: 'Communications Manager',
    tenant_admin: 'Branch Director',
    tenant_editor: 'Content Manager',
    tenant_accountant: 'Finance Director (CFO)',
    moderator: 'Mid-level Manager',
    editor: 'Content Specialist',
    volunteer: 'Intern / Contributor',
    viewer: 'Employee (Staff)',
};

// Role badge component
function RoleBadge({ role }: { role: string }) {
    const badgeColor = getRoleBadgeColor(role as Role);
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
            {ROLE_LABELS[role] || role.toUpperCase()}
        </span>
    );
}

function StatusBadge({ isBanned }: { isBanned: boolean }) {
    if (isBanned) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/25">
                <UserX className="w-3.5 h-3.5" /> Blocked
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <ShieldCheck className="w-3.5 h-3.5" /> Active
        </span>
    );
}

export default async function TenantUsersPage(props: TenantUsersPageProps) {
    const { tenant_id } = await props.params;
    const searchParams = await props.searchParams;
    
    const q = (searchParams.q as string) || '';
    const roleFilter = (searchParams.role as string) || '';
    const statusFilter = (searchParams.status as string) || '';

    // Check permission — tenant_admin or admin required
    await requirePermission('users', 'read');
    const ctx = await getUserContext();

    // Use admin client to fetch users
    const supabaseAdmin = await createAdminClient();

    // Fetch tenant info
    const { data: tenant } = await (supabaseAdmin as any)
        .from('tenants')
        .select('id, name, domain, tenant_type')
        .eq('id', tenant_id)
        .single();

    if (!tenant) {
        return <div className="p-8 text-red-500 font-bold">Organization not found.</div>;
    }

    const isCompany = tenant.tenant_type !== 'tenant';

    // Fetch tenant_members for this tenant only
    const { data: memberRoles } = await (supabaseAdmin as any)
        .from('tenant_members')
        .select(`
            user_id,
            tenant_id,
            tenant_member_roles (
                role_id
            )
        `)
        .eq('tenant_id', tenant_id);

    if (!memberRoles || memberRoles.length === 0) {
        return (
            <div className="space-y-6 text-slate-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Users className="w-8 h-8 text-amber-400" />
                            {isCompany ? 'Personnel Management' : 'Member Management'}
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm">{tenant.name}</p>
                    </div>
                </div>
                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl">
                    <CardContent className="p-12 text-center">
                        <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No personnel registered yet</h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                            This organization does not have any assigned personnel accounts yet. 
                            Contact the system administrator to invite staff members to the organization.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fetch auth users
    const { data: { users: allAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();

    // Map tenant members and roles → auth users
    let users = memberRoles.map((mr: any) => {
        const authUser = allAuthUsers?.find((u: any) => u.id === mr.user_id);
        
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

        const rolesList = (mr.tenant_member_roles || []).map((r: any) => r.role_id);
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

        return {
            id: mr.user_id,
            email: authUser?.email || 'Unknown',
            full_name: authUser?.user_metadata?.full_name || null,
            role: activeRole,
            created_at: authUser?.created_at || null,
            last_sign_in_at: authUser?.last_sign_in_at || null,
            banned_until: authUser?.banned_until || null,
        };
    });

    // Stats before filtering
    const totalUsers = users.length;
    const adminCount = users.filter((u: any) => ['admin', 'tenant_admin', 'agency_admin'].includes(u.role)).length;
    const editorCount = users.filter((u: any) => ['editor', 'moderator', 'tenant_editor'].includes(u.role)).length;
    const bannedCount = users.filter((u: any) => !!u.banned_until).length;

    // Filter by search query
    if (q) {
        const lowerQ = q.toLowerCase();
        users = users.filter((u: any) =>
            u.email?.toLowerCase().includes(lowerQ) ||
            u.full_name?.toLowerCase().includes(lowerQ)
        );
    }

    // Filter by role
    if (roleFilter) {
        users = users.filter((u: any) => u.role === roleFilter);
    }

    // Filter by status
    if (statusFilter) {
        users = users.filter((u: any) => {
            const isBanned = !!u.banned_until;
            return statusFilter === 'banned' ? isBanned : !isBanned;
        });
    }

    // Available roles list for filters dropdown
    const availableRoles = Object.entries(ROLE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <div className="space-y-6 text-slate-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Users className="w-8 h-8 text-amber-400" />
                        {isCompany ? 'Personnel Management' : 'Member Management'}
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        {tenant.name} — Internal RBAC authorization by branch role
                    </p>
                </div>
                <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
                    <Link href={`/admin/users/invite?tenant_id=${tenant_id}`}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isCompany ? 'Invite New Employee' : 'Add Member'}
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl rounded-2xl relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Total Personnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{totalUsers}</div>
                    </CardContent>
                </Card>

                <Card className="border-white/[0.08] bg-amber-500/10 backdrop-blur-xl rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                            Administrator
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-300">{adminCount}</div>
                    </CardContent>
                </Card>

                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl rounded-2xl relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Editors & Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{editorCount}</div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20 bg-red-500/10 backdrop-blur-xl rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl -mr-6 -mt-6" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                            Blocked Accounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-red-400">{bannedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Filters */}
            <TenantUsersFilters
                currentSearch={q}
                currentRole={roleFilter}
                currentStatus={statusFilter}
                roles={availableRoles}
            />

            {/* Users Table */}
            <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {isCompany ? 'Employee' : 'Member'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Role (RBAC)
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Join Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Last Sign In
                                    </th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                            No personnel found matching the filters.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-white/[0.02] group transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                                                        {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                                                            {user.full_name || 'No name set'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge isBanned={!!user.banned_until} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                                                {user.created_at
                                                    ? formatDate(new Date(user.created_at), 'dd/MM/yyyy', { locale: enUS })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                                                {user.last_sign_in_at
                                                    ? formatDate(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: enUS })
                                                    : 'Not authenticated'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Link href={`/admin/t/${tenant_id}/users/${user.id}`}>
                                                    <Button variant="outline" size="sm" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-950/20 gap-1.5 rounded-xl">
                                                        <Settings className="w-3.5 h-3.5 text-amber-400" />
                                                        Manage
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="border-amber-500/20 bg-amber-500/5 rounded-2xl shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-200/80 leading-relaxed">
                        <span className="font-bold text-amber-400">RBAC Authorization & Isolation:</span>{' '}
                        The list of personnel displayed on this page is completely isolated using Row-Level Security (RLS) at the database layer.
                        Administrators of <strong>{tenant.name}</strong> can only view and manage employees belonging to their own organization and cannot access the personnel of other organizations on the platform.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
