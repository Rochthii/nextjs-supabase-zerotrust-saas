import React from 'react';
import { getTenants } from '@/app/actions/admin/tenants';
import { isGlobalAdmin } from '@/lib/permissions';
import Link from 'next/link';
import { Building2, Globe, ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function SelectTenantPage() {
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    const { tenants, error } = await getTenants();

    return (
        <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-start px-6 py-16">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="w-full max-w-4xl mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-violet-600/20 rounded-2xl border border-violet-500/30">
                        <Layers className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Control Center</p>
                        <h1 className="text-3xl font-black text-white tracking-tight">Select Workspace</h1>
                    </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                    You are signed in as a <span className="text-violet-400 font-bold">Super Admin</span>. Select a workspace below to manage content, settings, and data for that organization.
                </p>

                {/* Security indicator */}
                <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">RLS Enforced — All access is audit logged</span>
                </div>
            </div>

            {/* ── Error ──────────────────────────────────────────────────── */}
            {error && (
                <div className="w-full max-w-4xl mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-xl text-sm font-medium">
                    Error loading data: {error}
                </div>
            )}

            {/* ── Workspace Grid ─────────────────────────────────────────── */}
            <div className="w-full max-w-4xl">
                {tenants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/[0.06] rounded-3xl text-slate-500">
                        <Building2 className="w-12 h-12 mb-4 opacity-30" />
                        <p className="font-medium">No workspaces found in the system.</p>
                        <Link href="/admin/tenants/new" className="mt-4 text-violet-400 hover:text-violet-300 text-sm font-bold hover:underline transition-colors">
                            + Create your first workspace
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {tenants.map(tenant => {
                            const accentColor = tenant.theme_colors?.primary || '#7C3AED';
                            const isEnterprise = tenant.tenant_type && tenant.tenant_type !== 'tenant';
                            return (
                                <Link
                                    key={tenant.id}
                                    href={`/admin/t/${tenant.id}/dashboard`}
                                    className="group relative block p-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)]"
                                >
                                    {/* Enterprise badge */}
                                    {isEnterprise && (
                                        <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-black bg-violet-600/20 text-violet-400 border border-violet-500/30 uppercase tracking-widest">
                                            Enterprise
                                        </span>
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0 border border-white/10 transition-transform group-hover:scale-105 duration-300"
                                            style={{ backgroundColor: accentColor + 'cc', boxShadow: `0 0 20px ${accentColor}40` }}
                                        >
                                            {tenant.name.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white text-[15px] truncate group-hover:text-violet-200 transition-colors">
                                                {tenant.name}
                                            </h3>
                                            {tenant.domain && (
                                                <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-slate-500 truncate">
                                                    <Globe className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">{tenant.domain}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <div className="shrink-0 mt-1 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-300">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Accent line */}
                                    <div
                                        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full rounded-b-2xl transition-all duration-500"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Back to Control Center */}
                <div className="mt-8 text-center">
                    <Link
                        href="/admin/dashboard"
                        className="text-xs text-slate-600 hover:text-slate-400 transition-colors font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
