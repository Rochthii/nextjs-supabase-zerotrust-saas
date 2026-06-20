import React from 'react';
import { getTenant } from '@/app/actions/admin/tenants';
import { DomainForm } from './domain-form';
import { requireTenantAccess } from '@/lib/permissions';

export default async function DomainManagementPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;

    // Page protection: user must have permission for this tenant
    await requireTenantAccess(tenant_id);

    // Get tenant information (including current domain)
    const { tenant, error } = await getTenant(tenant_id);

    if (error || !tenant) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Could not load branch information: {error || 'Branch not found'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-playfair font-bold text-gray-900">Domain Management</h1>
                <p className="text-gray-500 mt-1">Configure a custom domain name (access address) for this branch</p>
            </div>

            <div className="mt-8">
                <DomainForm
                    tenantId={tenant_id}
                    currentDomain={tenant.domain || ''}
                />
            </div>
        </div>
    );
}
