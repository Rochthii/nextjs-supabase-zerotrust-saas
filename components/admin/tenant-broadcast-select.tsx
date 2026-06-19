'use client';

import React from 'react';
import { Globe, Building2, CheckSquare } from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    domain: string | null;
}

interface TenantBroadcastSelectProps {
    tenants: Tenant[];
    selectedTenantIds: string[];
    onChange: (ids: string[]) => void;
    ownerTenantId?: string | null;
}

export function TenantBroadcastSelect({
    tenants,
    selectedTenantIds,
    onChange,
    ownerTenantId,
}: TenantBroadcastSelectProps) {
    const toggle = (id: string) => {
        if (selectedTenantIds.includes(id)) {
            onChange(selectedTenantIds.filter(x => x !== id));
        } else {
            onChange([...selectedTenantIds, id]);
        }
    };

    const selectAll = () => onChange(tenants.map(t => t.id));
    const clearAll = () => onChange(ownerTenantId ? [ownerTenantId] : []);

    const sortedTenants = [...tenants].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    Xuất bản đến branch
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                        Super Admin
                    </span>
                </label>
                <div className="flex gap-2 text-xs">
                    <button
                        type="button"
                        onClick={selectAll}
                        className="text-indigo-600 hover:text-indigo-800 font-medium underline-offset-2 hover:underline"
                    >
                        All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-gray-500 hover:text-gray-700 font-medium underline-offset-2 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {sortedTenants.map(tenant => {
                    const isOwner = tenant.id === ownerTenantId;
                    const isSelected = selectedTenantIds.includes(tenant.id);

                    return (
                        <label
                            key={tenant.id}
                            className={`
                                flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer
                                transition-all duration-150 select-none group
                                ${isSelected
                                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                                }
                                ${isOwner ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-indigo-600 shrink-0 cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggle(tenant.id)}
                                />
                                <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                                    <span className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                        {tenant.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 truncate font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                        {tenant.domain}
                                    </span>
                                </div>
                            </div>

                            {isOwner && (
                                <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Sở hữu
                                </span>
                            )}

                            {isSelected && !isOwner && (
                                <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                            )}
                        </label>
                    );
                })}
            </div>

            {selectedTenantIds.length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                    ⚠️ Chưa select branch nào — bài sẽ không display ở bất kỳ đâu!
                </p>
            )}
        </div>
    );
}
