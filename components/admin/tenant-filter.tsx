'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Store } from 'lucide-react';

interface TenantFilterProps {
    tenants: Array<{ id: string; name: string }>;
    placeholder?: string;
}

export function TenantFilter({ tenants, placeholder = "All Branches" }: TenantFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentTenantId = searchParams.get('tenantId') || 'all';

    const handleTenantChange = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id && id !== 'all') {
            params.set('tenantId', id);
        } else {
            params.delete('tenantId');
        }
        params.set('page', '1'); // Reset to page 1 when filter changes
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                value={currentTenantId}
                onValueChange={handleTenantChange}
            >
                <SelectTrigger className="w-[220px] bg-white border-gray-200">
                    <div className="flex items-center gap-2 truncate">
                        <Store className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder={placeholder} />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{placeholder}</SelectItem>
                    {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                            {t.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
