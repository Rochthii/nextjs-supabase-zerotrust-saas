import React from 'react';
import { getSiteSettings } from '@/lib/site-settings';
import { SettingsForm } from '@/components/admin/settings-form';
import { requireTenantAccess } from '@/lib/permissions';
import { getTenantConfig } from '@/lib/tenant';

export default async function SettingsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    // SECURITY: Settings page — only tenant admins for their own tenant
    await requireTenantAccess(tenant_id);
    const settings = await getSiteSettings(tenant_id);

    const tenantConfig = await getTenantConfig(tenant_id);

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-playfair font-bold mb-8">Settings system</h1>

            <SettingsForm initialSettings={settings} contextTenantId={tenant_id} isCompany={tenantConfig?.tenant_type !== 'tenant'} />
        </div>
    );
}
