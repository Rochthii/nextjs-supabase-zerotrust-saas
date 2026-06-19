'use client';

import React, { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'cache_minimal_events_v1';
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * MinimalEventCalendar — Event dạng danh sách tháng đơn giản.
 * None calendar grid lớn, chỉ list ngày + name event.
 */
export function MinimalEventCalendar({ locale = 'vi' }: { locale?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) { setEvents(parsed.events); return; }
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
                        const items = j.events ?? [];
                        setEvents(items);
                        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ events: items, fetchedAt: Date.now() })); } catch { }
                    })
                    .catch(() => setEvents([]))
                    .finally(() => setLoading(false));
            }
        }, { rootMargin: '150px' });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    if (!loading && events !== null && events.length === 0) return null;

    return (
        <section
            ref={ref}
            className="py-16 px-6 sm:px-10 lg:px-16"
            style={{ borderTop: '1px solid rgb(var(--theme-text) / 0.08)' }}
        >
            <div className="max-w-4xl ml-8 sm:ml-12 lg:ml-16">
                {/* Label */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1 h-5" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgb(var(--theme-text) / 0.5)' }}>
                        Sự Kiện Sắp Tới
                    </h2>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.08)' }} />
                </div>

                {loading && (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-6 py-4 border-b" style={{ borderColor: 'rgb(var(--theme-text) / 0.06)' }}>
                                <div className="w-16 h-14 rounded" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                                <div className="flex-1 h-10 rounded" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                            </div>
                        ))}
                    </div>
                )}

                {events && events.length > 0 && (
                    <div className="space-y-0">
                        {events.slice(0, 5).map((event: any) => {
                            const date = event.start_date ? new Date(event.start_date) : null;
                            return (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-6 py-5"
                                    style={{ borderBottom: '1px solid rgb(var(--theme-text) / 0.06)' }}
                                >
                                    {/* Date block */}
                                    {date && (
                                        <div className="shrink-0 flex flex-col items-center w-14">
                                            <span
                                                className="text-[28px] font-black leading-none"
                                                style={{ color: 'rgb(var(--theme-primary))' }}
                                            >
                                                {date.getDate()}
                                            </span>
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wider"
                                                style={{ color: 'rgb(var(--theme-text) / 0.4)' }}
                                            >
                                                {date.toLocaleDateString('vi-VN', { month: 'short' })}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0 pt-1">
                                        <p
                                            className="text-[15px] font-semibold leading-snug"
                                            style={{ color: 'rgb(var(--theme-text))' }}
                                        >
                                            {event.title_vi || event.title}
                                        </p>
                                        {event.location && (
                                            <p className="text-[12px] mt-1" style={{ color: 'rgb(var(--theme-text) / 0.4)' }}>
                                                {event.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
