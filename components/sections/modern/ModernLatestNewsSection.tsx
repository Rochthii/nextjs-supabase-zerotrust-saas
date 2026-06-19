'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ModernNewsGrid } from './ModernNewsGrid';

/**
 * ModernLatestNewsSection
 * - Khi có `news` từ server (DynamicPageBuilder): render ngay, không gọi API.
 * - Khi none: dùng IntersectionObserver để lazy-load từ API.
 */
export function ModernLatestNewsSection({
    locale = 'vi',
    news: prefetchedNews,
    isCompany,
}: {
    locale?: string;
    news?: any[];
    upcomingEvents?: any[];
    isCompany?: boolean;
}) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [news, setNews] = useState<any[] | null>(prefetchedNews ?? null);
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(prefetchedNews !== undefined);

    useEffect(() => {
        // Skip API call if server already provided data
        if (prefetchedNews !== undefined) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !fetchedRef.current) {
                    fetchedRef.current = true;
                    observer.disconnect();
                    setLoading(true);

                    fetch('/api/sections/news-events')
                        .then(res => res.json())
                        .then(json => setNews(json.news ?? []))
                        .catch(() => setNews([]))
                        .finally(() => setLoading(false));
                }
            },
            { rootMargin: '200px' }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, [prefetchedNews]);

    // Skeleton khi đang load
    if (loading || news === null) {
        return (
            <div ref={sectionRef} className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div className="h-7 rounded-full w-48 mb-8" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.08)' }} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-2xl aspect-[4/3] lg:aspect-auto" style={{ minHeight: 380, backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (news.length === 0) return <div ref={sectionRef} />;

    return (
        <div ref={sectionRef} className="overflow-hidden">
            <ModernNewsGrid news={news} locale={locale} isCompany={isCompany} />
        </div>
    );
}
