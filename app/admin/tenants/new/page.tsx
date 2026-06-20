import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// @ts-ignore
import { TenantForm } from '@/components/admin/tenant-form';

export default async function NewTenantPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
    await requirePermission('users', 'create');
    const { mode } = await searchParams;
    const { getUserRole } = await import('@/lib/permissions');
    const role = await getUserRole();

    return (
        <div className="space-y-6 max-w-2xl text-slate-300">
            <div className="flex items-center gap-4 pb-2">
                <Link href="/admin/tenants">
                    <Button variant="outline" size="icon" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-900/40">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create New Workspace</h1>
                    <p className="text-slate-400 mt-1 text-sm">Register a new enterprise or organization workspace into the system</p>
                </div>
            </div>

            <TenantForm mode="create" role={role || undefined} formMode={mode as any} />
        </div>
    );
}
