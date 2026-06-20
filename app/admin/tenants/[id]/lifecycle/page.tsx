import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTenant } from '@/app/actions/admin/tenants';
import { requireSuperAdmin } from '@/lib/permissions';
import { ArrowLeft, HeartPulse, ShieldCheck, ShieldOff, Clock } from 'lucide-react';
import { LifecycleActions } from './LifecycleActions';

export default async function TenantLifecyclePage({ params }: { params: Promise<{ id: string }> }) {
    await requireSuperAdmin();

    const { id } = await params;
    const { tenant, error } = await getTenant(id);

    if (!tenant || error) notFound();

    const lifecycleStatus = (tenant.modules_config as any)?.lifecycle_status || 'active';
    const isSuspended = lifecycleStatus === 'suspended';

    const statusConfig = {
        active: {
            label: 'Active',
            description: 'Workspace is active. All users can access normally.',
            Icon: ShieldCheck,
            iconClass: 'text-emerald-400',
            cardClass: 'bg-emerald-950/20 border-emerald-500/20',
            badgeClass: 'bg-emerald-900/40 text-emerald-300 border-emerald-600/30',
            dotClass: 'bg-emerald-400 shadow-emerald-400/50',
        },
        suspended: {
            label: 'Suspended',
            description: 'Workspace is suspended. Reactivation is required to allow user access.',
            Icon: ShieldOff,
            iconClass: 'text-red-400',
            cardClass: 'bg-red-950/20 border-red-500/20',
            badgeClass: 'bg-red-900/40 text-red-300 border-red-600/30',
            dotClass: 'bg-red-400 shadow-red-400/50',
        },
    };

    const config = statusConfig[lifecycleStatus as keyof typeof statusConfig] || statusConfig.active;
    const { Icon } = config;

    return (
        <div className="space-y-6 max-w-2xl text-slate-300">
            {/* Header */}
            <div className="flex items-center gap-4 pb-2">
                <Link href={`/admin/tenants/${id}`}>
                    <button className="p-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-900/40 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <HeartPulse className="w-7 h-7 text-rose-400" />
                        Lifecycle & Status
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">{tenant.name}</p>
                </div>
            </div>

            {/* Current Status Card */}
            <div className={`rounded-2xl border p-6 backdrop-blur-xl ${config.cardClass}`}>
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${isSuspended ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                        <Icon className={`h-6 w-6 ${config.iconClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-bold text-white text-lg">Current Status</h2>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-md ${config.dotClass}`} />
                                {config.label}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400">{config.description}</p>
                    </div>
                </div>
            </div>

            {/* Tenant Info Summary */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 space-y-3">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Workspace Information
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="text-slate-500">Workspace Name</div>
                    <div className="text-slate-200 font-medium">{tenant.name}</div>
                    <div className="text-slate-500">Domain</div>
                    <div className="text-slate-200 font-mono">{tenant.domain}</div>
                    <div className="text-slate-500">Service Plan</div>
                    <div className="text-slate-200 capitalize">{tenant.plan_type || 'free'}</div>
                    <div className="text-slate-500">Lifecycle Status</div>
                    <div className={`font-semibold capitalize ${isSuspended ? 'text-red-300' : 'text-emerald-300'}`}>
                        {lifecycleStatus}
                    </div>
                </div>
            </div>

            {/* Action Panel */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-5 space-y-4">
                <div>
                    <h3 className="font-bold text-white text-sm mb-1">Lifecycle Actions</h3>
                    <p className="text-xs text-slate-400">
                        All status changes will be written to immutable audit logs with detailed information about who, when, and from where.
                        Only Super Admin has permission to execute this operation.
                    </p>
                </div>

                <div className="border-t border-white/5 pt-4">
                    <LifecycleActions
                        tenantId={id}
                        currentStatus={lifecycleStatus}
                        tenantName={tenant.name}
                    />
                </div>

                {/* Warning notice */}
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 mt-2">
                    <p className="text-xs text-amber-300/80 leading-relaxed">
                        <strong className="text-amber-300">Note:</strong> Suspending a workspace does not automatically sign out active users.
                        This status is saved in <code className="font-mono text-amber-200 bg-amber-900/30 px-1 rounded">modules_config.lifecycle_status</code> and
                        can be checked by middleware to restrict access.
                    </p>
                </div>
            </div>
        </div>
    );
}
