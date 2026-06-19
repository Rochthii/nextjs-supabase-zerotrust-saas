'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';

const SESSION_KEY = 'cache_minimal_news_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * MinimalNewsList — News dạng danh sách báo đơn giản cho Minimal Layout.
 * None ảnh thumbnail, chỉ số order, title, category, ngày.
 * Phong cách: Financial Times / Nikkei typography.
 */
export function MinimalNewsList({ locale = 'vi' }: { locale?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [news, setNews] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
                    setNews(parsed.news);
                    return;
                }
                sessionStorage.removeItem(SESSION_KEY);
            }
        } catch { }

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !fetchedRef.current) {
                fetchedRef.current = true;
                observer.disconnect();
                setLoading(true);
                fetch('/api/sections/news-events')
                    .then(r => r.json())
                    .then(j => {
                        const items = j.news ?? [];
                        setNews(items);
                        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ news: items, fetchedAt: Date.now() })); } catch { }
                    })
                    .catch(() => setNews([]))
                    .finally(() => setLoading(false));
            }
        }, { rootMargin: '200px' });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            className="py-16 px-6 sm:px-10 lg:px-16 overflow-hidden"
            style={{ borderTop: '1px solid rgb(var(--theme-text) / 0.08)' }}
        >
            <div className="max-w-4xl ml-8 sm:ml-12 lg:ml-16">
                {/* Section label */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1 h-5" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgb(var(--theme-text) / 0.5)' }}>
                        Tin Tức Gần Đây
                    </h2>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.08)' }} />
                    <Link href="/tin-tuc" className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'rgb(var(--theme-primary))' }}>
                        All →
                    </Link>
                </div>

                {loading && (
                    <div className="space-y-6 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-6 py-5 border-b" style={{ borderColor: 'rgb(var(--theme-text) / 0.06)' }}>
                                <div className="w-8 h-5 rounded" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.08)' }} />
                                <div className="flex-1 h-5 rounded" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.08)' }} />
                            </div>
                        ))}
                    </div>
                )}

                {news && news.length > 0 && (
                    <ol className="space-y-0">
                        {news.slice(0, 8).map((item, i) => (
                            <li
                                key={item.id}
                                className="group"
                                style={{ borderBottom: '1px solid rgb(var(--theme-text) / 0.06)' }}
                            >
                                <Link
                                    href={`/tin-tuc/${item.slug}`}
                                    className="flex items-start gap-6 py-5 transition-all"
                                >
                                    {/* Index number */}
                                    <span
                                        className="text-[28px] font-black leading-none shrink-0 w-10 text-right"
                                        style={{ color: 'rgb(var(--theme-text) / 0.08)', fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </span>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            {item.category && (
                                                <span
                                                    className="text-[10px] font-bold uppercase tracking-widest"
                                                    style={{ color: 'rgb(var(--theme-primary))' }}
                                                >
                                                    {item.category.name_vi}
                                                </span>
                                            )}
                                            {item.published_at && (
                                                <span
                                                    className="text-[10px] font-mono"
                                                    style={{ color: 'rgb(var(--theme-text) / 0.3)' }}
                                                >
                                                    {new Date(item.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3
                                            className="text-[15px] sm:text-[17px] font-semibold leading-snug group-hover:opacity-60 transition-opacity"
                                            style={{ color: 'rgb(var(--theme-text))' }}
                                        >
                                            {item.title_vi}
                                        </h3>
                                    </div>

                                    {/* Arrow */}
                                    <span
                                        className="shrink-0 text-[18px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                                        style={{ color: 'rgb(var(--theme-primary))' }}
                                    >
                                        →
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}
