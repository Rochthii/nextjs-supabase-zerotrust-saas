import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { getTenant } from '@/app/actions/admin/tenants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { FeatureTogglesClient } from './feature-toggles-client';

export default async function TenantFeaturesPage({ params }: { params: Promise<{ id: string }> }) {
    // Requires high privilege (global admin or company_editor) to toggle modules
    await requirePermission('users', 'update');

    const { id } = await params;
    const { tenant, error } = await getTenant(id);

    if (!tenant || error) notFound();

    // Parse existing modules_config or use default
    let modulesConfig = tenant.modules_config;
    if (!modulesConfig || typeof modulesConfig !== 'object') {
        modulesConfig = {
            news_events: true,
            dharma_talks: true,
            transactions: true,
            digital_library: true,
            registrations: true,
            monk_profiles: true
        };
    }

    return (
        <div className="space-y-6 max-w-2xl text-slate-300">
            <div className="flex items-center gap-4 pb-2 border-b border-white/5">
                <Link href={`/admin/tenants/${id}`}>
                    <Button variant="outline" size="icon" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-900/40">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Settings2 className="w-7 h-7 text-emerald-400" />
                        Quản lý Module (Feature Toggles)
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">{tenant.name}</p>
                </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-sm text-emerald-200">
                <Settings2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <p>Tính năng này (Incident Response / Feature Toggles) allowed SOC và Administrator system <strong>enable/disable nóng</strong> các phân hệ chức năng cho từng tenant. Việc disable phân hệ sẽ hidden nó khỏi interface user và block các API related ngay lập tức.</p>
            </div>

            <FeatureTogglesClient tenantId={id} initialConfig={modulesConfig} />
        </div>
    );
}
