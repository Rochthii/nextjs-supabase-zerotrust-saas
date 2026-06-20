import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { requireTenantAccess, requirePermission, Role } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Activity, Users, AlertTriangle, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import { SecuritySettingsForm } from './security-settings-form';
import { AnomalyActionButtons } from '@/components/admin/audit/anomaly-action-buttons';

interface TenantSecurityPageProps {
    params: Promise<{ tenant_id: string }>;
}

interface EmployeeData {
    id: string;
    email: string;
    role: string;
    is2faEnabled: boolean;
}

export default async function TenantSecurityPage(props: TenantSecurityPageProps) {
    const { tenant_id } = await props.params;

    // Validate access to this tenant and reading permissions
    await requireTenantAccess(tenant_id);
    await requirePermission('users', 'read');

    const supabaseAdmin = await createAdminClient();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    // 1. Fetch Tenant Config
    const { data: tenant } = await (supabaseAdmin as any)
        .from('tenants')
        .select('name, modules_config')
        .eq('id', tenant_id)
        .single();
    
    if (!tenant) return <div className="p-8 text-red-500 font-bold">Organization not found</div>;
    const securitySettings = tenant.modules_config?.security_settings || {};
    const require2FA = securitySettings.require_2fa || false;

    // 2. Fetch KPIs (24h Logs)
    const { count: last24hLogs } = await (supabaseAdmin as any)
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant_id)
        .gte('created_at', last24h);

    // 3. Anomaly Detection (>20 actions/hour)
    const { data: recentLogs } = await (supabaseAdmin as any)
        .from('audit_logs')
        .select('user_email, user_id')
        .eq('tenant_id', tenant_id)
        .gte('created_at', lastHour);

    const hourlyUserCounts: Record<string, { count: number; user_id?: string }> = {};
    (recentLogs || []).forEach((l: any) => {
        if (l.user_email && l.user_email !== 'guest@anonymous') {
            if (!hourlyUserCounts[l.user_email]) {
                hourlyUserCounts[l.user_email] = { count: 0, user_id: l.user_id };
            }
            hourlyUserCounts[l.user_email].count += 1;
        }
    });

    const anomalyAlerts = Object.entries(hourlyUserCounts)
        .filter(([_, data]) => data.count > 20)
        .map(([email, data]) => ({
            user_email: email,
            user_id: data.user_id,
            action_count: data.count,
            description: `${email} performed ${data.count} operations within 1 hour`,
        }));

    // Fetch tenant_members and roles for this tenant
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

    const { data: { users: allAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();
    
    let totalEmployees = 0;
    let mfaEnabledCount = 0;

    const employees: EmployeeData[] = (memberRoles || []).map((mr: any) => {
        const authUser = allAuthUsers?.find((u: any) => u.id === mr.user_id);
        
        // Check MFA actual: has verified totp factor
        const is2faEnabled = authUser?.factors?.some((f: any) => f.factor_type === 'totp' && f.status === 'verified') || false;
        
        totalEmployees++;
        if (is2faEnabled) mfaEnabledCount++;

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
            role: activeRole,
            is2faEnabled,
        };
    });

    const complianceRate = totalEmployees > 0 ? Math.round((mfaEnabledCount / totalEmployees) * 100) : 100;

    return (
        <div className="space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 dark:bg-slate-950/80 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-500/20 rounded-xl backdrop-blur-sm border border-indigo-500/30">
                            <ShieldAlert className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-playfair font-black tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                            Branch Security Center
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl text-sm">
                        SOC Authorization: Configure internal security policies, monitor two-factor authentication (MFA) compliance, and react swiftly to suspicious activity for {tenant.name}.
                    </p>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden group transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Operations (24h)</p>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{last24hLogs || 0}</h3>
                                <p className="text-xs text-slate-500 mt-2 flex items-center font-medium">
                                    <Activity className="w-3.5 h-3.5 mr-1 text-slate-400" /> Logged actions
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform duration-300">
                                <Fingerprint className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden group transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Anomaly Warnings</p>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{anomalyAlerts.length}</h3>
                                <p className={`text-xs mt-2 flex items-center font-medium ${anomalyAlerts.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Abnormal access
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-950/90 dark:bg-slate-950/60 border border-emerald-500/30 text-white backdrop-blur-xl shadow-xl overflow-hidden relative group transition-all duration-300 hover:border-emerald-500/60">
                     <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">2FA (MFA) Compliance</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-black text-emerald-400">{complianceRate}%</h3>
                                    <span className="text-sm text-slate-400">({mfaEnabledCount}/{totalEmployees})</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 flex items-center font-medium">
                                    <Lock className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Secure Identities
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form configuration & Warning */}
                <div className="space-y-8 lg:col-span-1">
                    <SecuritySettingsForm tenantId={tenant_id} initialConfig={securitySettings} />

                    <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-200 dark:border-rose-900/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-rose-500/5 dark:bg-rose-950/10 border-b border-rose-100/50 dark:border-rose-900/20 pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="w-5 h-5 text-rose-500" /> Anomaly Warnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {anomalyAlerts.length === 0 ? (
                                <div className="text-center py-6 text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold text-sm">No suspicious activity detected</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {anomalyAlerts.map((alert, i) => (
                                        <div key={i} className="p-3 rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-955/30 flex flex-col gap-2 relative overflow-hidden group">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{alert.user_email}</p>
                                                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{alert.description}</p>
                                            </div>
                                            <div className="pt-2 border-t border-rose-200/50 dark:border-rose-900/50 flex justify-end">
                                                <AnomalyActionButtons userEmail={alert.user_email} userId={alert.user_id} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: 2FA Compliance Monitor */}
                <div className="lg:col-span-2">
                    <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-full flex flex-col">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-slate-100">
                                <Users className="w-5 h-5 text-indigo-500" /> 2FA Compliance Monitor
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
                                List of personnel and their security status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-550 dark:text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Employee / Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">2FA Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {employees.map((emp, i) => {
                                        const isViolating = require2FA && !emp.is2faEnabled;
                                        return (
                                            <tr key={i} className={`hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors ${isViolating ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                                                        {emp.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded">
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {emp.is2faEnabled ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                                            <ShieldCheck className="w-3.5 h-3.5" /> 2FA Enabled
                                                        </span>
                                                    ) : isViolating ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-xs px-2.5 py-1 bg-rose-50 dark:bg-rose-500/10 rounded-full border border-rose-200 dark:border-rose-500/20 animate-pulse">
                                                                <AlertTriangle className="w-3.5 h-3.5" /> 2FA Disabled (Violating)
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                            Optional
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
