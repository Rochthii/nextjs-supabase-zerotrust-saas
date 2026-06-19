'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.replace(`?${params.toString()}`);
    }, 300);

    return (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('q')?.toString()}
                className="pl-8 bg-white"
            />
        </div>
    );
}

export function FilterSelect({
    options,
    paramName,
    label
}: {
    options: { label: string; value: string }[],
    paramName: string,
    label?: string
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentValue = searchParams.get(paramName) || '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams);
        const value = e.target.value;
        if (value && value !== 'all') {
            params.set(paramName, value);
        } else {
            params.delete(paramName);
        }
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            {label && <span className="text-sm font-medium text-gray-700">{label}:</span>}
            <select
                className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={currentValue}
                onChange={handleChange}
            >
                <option value="all">All</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
