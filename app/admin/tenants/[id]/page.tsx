import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { getTenant } from '@/app/actions/admin/tenants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Palette, HeartPulse } from 'lucide-react';
import { notFound } from 'next/navigation';
// @ts-ignore
import { TenantForm } from '@/components/admin/tenant-form';

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
    await requirePermission('users', 'update');

    const { id } = await params;
    const { tenant, error } = await getTenant(id);
    const { getUserRole } = await import('@/lib/permissions');
    const role = await getUserRole();

    if (!tenant || error) notFound();

    return (
        <div className="space-y-6 max-w-2xl text-slate-300">
            <div className="flex items-center gap-4 pb-2">
                <Link href="/admin/tenants">
                    <Button variant="outline" size="icon" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-900/40">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Configuration Workspace</h1>
                    <p className="text-slate-400 mt-1 text-sm">{tenant.name}</p>
                </div>
            </div>

            {/* Theme shortcut */}
            <Link href={`/admin/tenants/${id}/theme`}>
                <div className="flex items-center gap-4 p-5 bg-violet-950/20 border border-violet-500/20 rounded-2xl hover:bg-violet-950/40 transition-all duration-200 cursor-pointer group backdrop-blur-xl">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center group-hover:bg-violet-500/20 transition-colors flex-shrink-0 border border-violet-500/20">
                        <Palette className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-violet-200 text-sm">Settings Interface (Theme)</p>
                        <p className="text-xs text-slate-400 mt-0.5">Tùy chỉnh hệ màu thương hiệu, hình nền và kiểu display cho cổng thông tin Web & App của unit</p>
                    </div>
                    <span className="text-violet-400 group-hover:translate-x-1.5 transition-transform font-bold font-mono">→</span>
                </div>
            </Link>

            {/* Features shortcut */}
            <Link href={`/admin/tenants/${id}/features`}>
                <div className="flex items-center gap-4 p-5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl hover:bg-emerald-950/40 transition-all duration-200 cursor-pointer group backdrop-blur-xl">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0 border border-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-emerald-200 text-sm">Quản lý Modules (Feature Toggles)</p>
                        <p className="text-xs text-slate-400 mt-0.5">Enable/disable nóng các phân hệ chức năng (News, Payment, Registration...) cho tenant này.</p>
                    </div>
                    <span className="text-emerald-400 group-hover:translate-x-1.5 transition-transform font-bold font-mono">→</span>
                </div>
            </Link>

            {/* Lifecycle shortcut */}
            <Link href={`/admin/tenants/${id}/lifecycle`}>
                <div className="flex items-center gap-4 p-5 bg-rose-950/20 border border-rose-500/20 rounded-2xl hover:bg-rose-950/40 transition-all duration-200 cursor-pointer group backdrop-blur-xl">
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center group-hover:bg-rose-500/20 transition-colors flex-shrink-0 border border-rose-500/20">
                        <HeartPulse className="h-5 w-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-rose-200 text-sm">Vòng đời &amp; Status</p>
                        <p className="text-xs text-slate-400 mt-0.5">Đình chỉ hoặc activate lại workspace. Quản lý status hoạt động theo vòng đời tenant.</p>
                    </div>
                    <span className="text-rose-400 group-hover:translate-x-1.5 transition-transform font-bold font-mono">→</span>
                </div>
            </Link>

            <TenantForm mode="edit" tenant={tenant} role={role || undefined} />
        </div>
    );
}
