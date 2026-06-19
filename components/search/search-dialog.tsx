'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Calendar, FileText } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';
import { searchContent } from '@/app/actions/search';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import debounce from 'lodash/debounce';

interface SearchResult {
    news: Array<{
        id: string;
        title_vi: string;
        excerpt_vi?: string;
        slug: string;
        published_at: string;
    }>;
    events: Array<{
        id: string;
        title_vi: string;
        description_vi?: string;
        start_date: string;
    }>;
}

export function SearchDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({ news: [], events: [] });
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.trim().length < 2) {
                setResults({ news: [], events: [] });
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const data = await searchContent(searchQuery);
                setResults(data as any);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    const handleResultClick = (type: 'news' | 'event', slug: string) => {
        onOpenChange(false);
        if (type === 'news') {
            router.push(`/tin-tuc/${slug}`);
        } else {
            router.push('/lich-le');
        }
    };

    const totalResults = results.news.length + results.events.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Search</DialogTitle>
                </DialogHeader>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm news, event..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                        autoFocus
                    />
                    {isLoading && (
                        <InlineSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-primary" />
                    )}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto mt-4 space-y-6">
                    {query.trim().length < 2 ? (
                        <p className="text-center text-gray-500 py-8">Nhập ít nhất 2 characters để search</p>
                    ) : totalResults === 0 && !isLoading ? (
                        <p className="text-center text-gray-500 py-8">Not found results</p>
                    ) : (
                        <>
                            {/* News Results */}
                            {results.news.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        News ({results.news.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.news.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleResultClick('news', item.slug)}
                                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gold-primary"
                                            >
                                                <h4 className="font-medium text-sm mb-1">{item.title_vi}</h4>
                                                {item.excerpt_vi && (
                                                    <p className="text-xs text-gray-600 line-clamp-1">{item.excerpt_vi}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {format(new Date(item.published_at), 'dd MMM yyyy', { locale: vi })}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Events Results */}
                            {results.events.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Event ({results.events.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.events.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleResultClick('event', item.id)}
                                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gold-primary"
                                            >
                                                <h4 className="font-medium text-sm mb-1">{item.title_vi}</h4>
                                                {item.description_vi && (
                                                    <p className="text-xs text-gray-600 line-clamp-1">{item.description_vi}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {format(new Date(item.start_date), 'dd MMM yyyy', { locale: vi })}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
