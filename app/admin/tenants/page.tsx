import React from 'react';
import { getTenants } from '@/app/actions/admin/tenants';
import { requirePermission } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Building2, Globe, Pencil, Layers, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PLAN_TYPE_BADGES: Record<string, { label: string; className: string }> = {
    free: { label: 'Free', className: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
    pro: { label: 'Pro', className: 'bg-amber-900/60 text-amber-300 border-amber-600/40' },
    enterprise: { label: 'Enterprise', className: 'bg-purple-900/60 text-purple-300 border-purple-600/40' },
};


const LAYOUT_LABELS: Record<string, string> = {
    // Chỉ giữ lại các layout standard doanh nghiệp
    saas_violet: '⚡ Violet Premium SaaS',
    corp_navy: '🛡️ Corporate Navy Premium',
    modern_tech: '🌌 Cyberpunk Neon Tech',
    charity_green: '🌱 Social Green Sustainable',
    creative_amber: '☀️ Creative Amber Studio',
    minimal_white: '❄️ Clean Minimalist Elite',
};


export default async function TenantsPage() {
    await requirePermission('tenants', 'read');

    const { tenants, error } = await getTenants();

    return (
        <div className="space-y-6 text-slate-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Building2 className="w-8 h-8 text-amber-400" />
                        Quản lý Workspace & Unit member
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Danh sách các doanh nghiệp, đối tác và unit member sử dụng system ({tenants.length} unit)
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 font-sans">
                    <Link href="/admin/tenants/new">
                        <Button className="gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-900/10">
                            <Plus className="w-4 h-4" />
                            Initialize Workspace mới
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-950/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <span>Error tải dữ liệu: {error}</span>
                </div>
            )}

            {/* Tenant List */}
            {tenants.length === 0 ? (
                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl">
                    <CardContent className="py-16 text-center text-slate-500">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30 text-amber-400" />
                        <p className="text-slate-400">Chưa có Workspace nào trong system.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tenants.map(tenant => (
                        <Card key={tenant.id} className="border-white/[0.08] bg-slate-900/60 backdrop-blur-xl hover:bg-slate-900/80 transition-all duration-200">
                            <CardContent className="p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar colors theo theme */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 border border-white/10"
                                            style={{ backgroundColor: tenant.theme_colors?.primary || '#8B5CF6' }}
                                        >
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-base text-white">{tenant.name}</h3>
                                                {/* Plan type badge */}
                                                {(() => {
                                                    const plan = tenant.plan_type || 'free';
                                                    const badge = PLAN_TYPE_BADGES[plan] || PLAN_TYPE_BADGES.free;
                                                    return (
                                                        <Badge variant="outline" className={`text-[10px] font-bold py-0.5 px-2 uppercase tracking-wide border ${badge.className}`}>
                                                            {badge.label}
                                                        </Badge>
                                                    );
                                                })()}
                                                {/* Suspended badge */}
                                                {(tenant.modules_config as any)?.lifecycle_status === 'suspended' && (
                                                    <Badge variant="outline" className="text-[10px] font-bold py-0.5 px-2 uppercase tracking-wide bg-red-950/60 text-red-300 border-red-600/40">
                                                        Đình chỉ
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-slate-300 font-bold py-0.5 px-2 uppercase tracking-wide">
                                                    {LAYOUT_LABELS[tenant.layout_style || 'saas_violet'] || '⚡ Violet Premium SaaS'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                                                    {tenant.domain}
                                                </span>
                                                {tenant.subdomain && (
                                                    <span className="text-slate-500">
                                                        subdomain: <strong className="text-slate-400">{tenant.subdomain}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/admin/tenants/${tenant.id}`} className="sm:self-center">
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1.5 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-950/20">
                                            <Pencil className="w-3.5 h-3.5 text-amber-400" />
                                            Chỉnh edit configuration
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
