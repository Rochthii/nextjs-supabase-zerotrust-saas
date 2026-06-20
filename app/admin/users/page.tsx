import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requirePermission, getRoleBadgeColor, Role, getUserContext } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { UserPlus } from 'lucide-react';
// @ts-ignore
import { SearchInput, FilterSelect } from '@/components/admin/data-filters';

interface UsersPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Role badge component
function RoleBadge({ role }: { role: string }) {
    const badgeColor = getRoleBadgeColor(role as Role);
    const displayRole = role.replace('_', ' ').toUpperCase();

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
            {displayRole}
        </span>
    );
}

// Status badge component
function StatusBadge({ isBanned }: { isBanned: boolean }) {
    if (isBanned) {
        return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                BANNED
            </span>
        );
    }
    return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            ACTIVE
        </span>
    );
}

export default async function UsersPage(props: UsersPageProps) {
    const searchParams = await props.searchParams;
    const q = (searchParams.q as string) || '';
    const role = (searchParams.role as string) || '';
    const status = (searchParams.status as string) || '';

    // Check permission
    await requirePermission('users', 'read');

    // Use admin client
    const supabaseAdmin = await createAdminClient();

    // Fetch users - Supabase Auth API doesn't support rich server-side filtering like Postgres tables
    // So we fetch and filter in memory (acceptable for admin user lists typically < 1000)
    const { data: { users: allUsers }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return <div>Error loading users</div>;
    }

    // Fetch tenant memberships and roles
    const { data: memberships } = await (supabaseAdmin as any)
        .from('tenant_members')
        .select(`
            user_id,
            tenant_id,
            tenant_member_roles (
                role_id
            )
        `);

    // Fetch all tenants to resolve names
    const { data: tenantsData } = await (supabaseAdmin as any)
        .from('tenants')
        .select('id, name');

    // Map and combine
    let users = (allUsers || []).map(u => {
        const userMemberships = memberships?.filter((m: any) => m.user_id === u.id) || [];
        
        let activeRole: Role = 'viewer';
        let tenantName = null;
        let tenantId: string | null = null;

        if (userMemberships.length > 0) {
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

            const resolvedMemberships = userMemberships.map((m: any) => {
                const rolesList = (m.tenant_member_roles || []).map((r: any) => r.role_id);
                let highestRole: Role = 'viewer';
                let maxPriority = -1;
                for (const r of rolesList) {
                    const role = r as Role;
                    const priority = rolePriority[role] ?? 0;
                    if (priority > maxPriority) {
                        maxPriority = priority;
                        highestRole = role;
                    }
                }
                return {
                    tenant_id: m.tenant_id,
                    role: highestRole,
                    priority: rolePriority[highestRole] ?? 0
                };
            });

            resolvedMemberships.sort((a: any, b: any) => b.priority - a.priority);
            const highestMem = resolvedMemberships[0];
            activeRole = highestMem.role;
            tenantId = highestMem.tenant_id;
            tenantName = tenantId ? (tenantsData?.find((t: any) => t.id === tenantId)?.name ?? null) : 'Global System';
        } else {
            activeRole = (u.app_metadata?.role ?? u.user_metadata?.role ?? 'viewer') as Role;
        }

        return {
            ...u,
            activeRole,
            tenantName,
            tenant_id: tenantId
        };
    });

    // Filter out super_admin to keep it hidden
    users = users.filter(u => u.activeRole !== 'super_admin');

    // Filter by tenant scope for tenant_admin
    const ctx = await getUserContext();
    if (ctx?.role === 'tenant_admin') {
        users = users.filter(u => u.tenant_id === ctx.tenantId);
    }

    if (q) {
        const lowerQ = q.toLowerCase();
        users = users.filter(u =>
            u.email?.toLowerCase().includes(lowerQ) ||
            u.user_metadata?.full_name?.toLowerCase().includes(lowerQ)
        );
    }

    if (role) {
        users = users.filter(u => u.activeRole === role);
    }

    if (status) {
        if (status === 'banned') {
            users = users.filter(u => !!u.banned_until);
        } else if (status === 'active') {
            users = users.filter(u => !u.banned_until);
        }
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">Identity Management</h1>
                            <p className="text-slate-400 mt-1.5 text-sm">
                                Manage RBAC authorization and control system access for multi-tenants. Total: <strong className="text-amber-400 font-black">{users?.length || 0}</strong> staff.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl shadow-lg shadow-amber-500/25 px-6 transition-all duration-200">
                        <Link href="/admin/users/invite">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add New Staff
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-lg overflow-hidden rounded-2xl">
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                        <SearchInput placeholder="Search by email, name..." />
                    </div>

                    <div className="flex items-center gap-4">
                        <FilterSelect
                            label="Role"
                            paramName="role"
                            options={[
                                { label: 'Workspace Admin (Agency)', value: 'agency_admin' },
                                { label: 'Administrator (Admin)', value: 'admin' },
                                { label: 'Moderator', value: 'moderator' },
                                { label: 'Editor', value: 'editor' },
                                { label: 'Partner', value: 'volunteer' },
                                { label: 'Viewer', value: 'viewer' },
                            ]}
                        />

                        <FilterSelect
                            label="Status"
                            paramName="status"
                            options={[
                                { label: 'Active', value: 'active' },
                                { label: 'Suspended', value: 'banned' },
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden group transition-all duration-300 hover:border-amber-500/30 rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Total Staff
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{users?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 dark:bg-slate-950/80 border border-slate-800 shadow-xl relative overflow-hidden rounded-2xl group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            Administrators
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                            {users?.filter(u => u.activeRole === 'admin' || u.activeRole === 'tenant_admin' || u.activeRole === 'agency_admin').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden group transition-all duration-300 hover:border-amber-500/30 rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Editors & Moderators
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {users?.filter(u => u.activeRole === 'editor' || u.activeRole === 'moderator').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-200 dark:border-rose-950/40 shadow-xl overflow-hidden group transition-all duration-300 hover:border-rose-500/40 rounded-2xl relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl pointer-events-none"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">
                            Suspended Accounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
                            {users?.filter(u => !!u.banned_until).length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[2rem]">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Identity (Email)
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Role (RBAC)
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Workspace Scope
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Joined Date
                                    </th>
                                    <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {users && users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 group transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <RoleBadge role={user.activeRole} />
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium italic">
                                                    {user.tenantName || <span className="text-slate-400 dark:text-slate-600 font-normal">Global System</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <StatusBadge isBanned={!!user.banned_until} />
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">
                                                {formatDate(new Date(user.created_at), 'MM/dd/yyyy', { locale: enUS })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200"
                                                >
                                                    View details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
