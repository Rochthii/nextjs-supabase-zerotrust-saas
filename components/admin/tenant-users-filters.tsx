'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, UserX, UserCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TenantUsersFiltersProps {
    currentSearch: string;
    currentRole: string;
    currentStatus: string;
    roles: { value: string; label: string }[];
}

export function TenantUsersFilters({
    currentSearch,
    currentRole,
    currentStatus,
    roles,
}: TenantUsersFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(currentSearch);
    const [role, setRole] = useState(currentRole);
    const [status, setStatus] = useState(currentStatus);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== currentSearch) {
                updateQueries({ q: search });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const updateQueries = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleClear = () => {
        setSearch('');
        setRole('');
        setStatus('');
        startTransition(() => {
            router.push(pathname);
        });
    };

    const hasActiveFilters = search || role || status;

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl gap-4 flex flex-col md:flex-row items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-950/40 border-white/[0.08] text-white placeholder-slate-500 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Role select */}
                <div className="w-full sm:w-48">
                    <Select
                        value={role}
                        onValueChange={(val) => {
                            const actualVal = val === 'all' ? '' : val;
                            setRole(actualVal);
                            updateQueries({ role: actualVal });
                        }}
                    >
                        <SelectTrigger className="bg-slate-950/40 border-white/[0.08] text-slate-300 rounded-xl">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-white/[0.08] text-slate-300 rounded-xl">
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                    {r.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status select */}
                <div className="w-full sm:w-48">
                    <Select
                        value={status}
                        onValueChange={(val) => {
                            const actualVal = val === 'all' ? '' : val;
                            setStatus(actualVal);
                            updateQueries({ status: actualVal });
                        }}
                    >
                        <SelectTrigger className="bg-slate-950/40 border-white/[0.08] text-slate-300 rounded-xl">
                            <SelectValue placeholder="All status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-white/[0.08] text-slate-300 rounded-xl">
                            <SelectItem value="all">All status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={handleClear}
                        className="text-slate-400 hover:text-white gap-1.5 px-3 rounded-xl hover:bg-white/5 h-10 w-full sm:w-auto shrink-0"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
