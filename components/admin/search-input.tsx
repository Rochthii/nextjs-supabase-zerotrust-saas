'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export function SearchInput({ placeholder = 'Search...' }: { placeholder?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [text, setText] = useState(searchParams.get('q') || '');
    const query = useDebounce(text, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }
        params.set('page', '1'); // Reset to page 1 on search
        router.push(`?${params.toString()}`);
    }, [query, router, searchParams]);

    return (
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="pl-8 w-[300px]"
            />
        </div>
    );
}
