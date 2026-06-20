import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { getTenant } from '@/app/actions/admin/tenants';
import { getSiteSettings } from '@/lib/site-settings';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Palette, Settings, AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ThemeSettingsClient } from './theme-settings-client';

export default async function TenantThemePage({ params }: { params: Promise<{ id: string }> }) {
    // SECURITY: Only Super Admin / Company Editor is allowed to update global themes
    await requirePermission('tenants', 'update');

    const { id } = await params;
    const { tenant, error } = await getTenant(id);

    if (!tenant || error) notFound();

    const settings = await getSiteSettings(id);

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header & Navigation */}
            <div className="flex items-center gap-4">
                <Link href={`/admin/tenants/${id}`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-playfair font-bold">Settings Interface (Theme)</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-gold-primary" />
                        Branch: <span className="font-semibold text-gray-700">{tenant.name}</span>
                    </p>
                </div>
                <Link href={`/admin/tenants/${id}`}>
                    <Button variant="ghost" size="sm" className="text-gray-500 gap-2">
                        <Settings className="h-4 w-4" />
                        Branch Info
                    </Button>
                </Link>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold">High Privilege Action — Super Admin Only</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                        Changes to colors will apply immediately to all web pages of this branch. Please check the Preview section carefully before saving.
                    </p>
                </div>
            </div>

            {/* Theme Editor (Client Component) */}
            <ThemeSettingsClient initialSettings={settings} tenantId={id} tenantName={tenant.name} tenantType={tenant.tenant_type} />
        </div>
    );
}

