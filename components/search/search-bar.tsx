'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchDialog } from '@/components/search/search-dialog';

export function SearchBar() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gold-primary hover:bg-gray-50 transition-colors"
                aria-label="Search"
            >
                <Search className="h-4 w-4 text-gray-500" />
                <span className="hidden md:inline text-sm text-gray-500">Search...</span>
                <kbd className="hidden md:inline px-2 py-1 text-xs bg-gray-100 rounded border border-gray-300 font-mono">
                    {navigator?.platform?.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}
                </kbd>
            </button>

            <SearchDialog open={open} onOpenChange={setOpen} />
        </>
    );
}
