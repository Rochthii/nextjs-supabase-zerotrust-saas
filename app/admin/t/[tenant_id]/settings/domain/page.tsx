import React from 'react';
import { getTenant } from '@/app/actions/admin/tenants';
import { DomainForm } from './domain-form';
import { requireTenantAccess } from '@/lib/permissions';

export default async function DomainManagementPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;

    // Bảo vệ page: user phải có quyền với tenant này
    await requireTenantAccess(tenant_id);

    // Lấy thông tin tenant (bao gồm domain current)
    const { tenant, error } = await getTenant(tenant_id);

    if (error || !tenant) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Không thể tải thông tin branch: {error || 'Not found branch'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-playfair font-bold text-gray-900">Quản lý Name miền</h1>
                <p className="text-gray-500 mt-1">Configuration address truy cập (domain) riêng cho ngôi branch này</p>
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
