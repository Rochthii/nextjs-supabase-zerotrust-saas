'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface MinimalHeroTextProps {
    siteName?: string;
    siteDescription?: string;
    locale?: string;
    modulesConfig?: Record<string, boolean>;
}

/**
 * MinimalHeroText — Hero section KHÔNG dùng ảnh nền.
 * Chỉ typography thuần: name branch lớn, gạch dưới vàng đơn giản, một câu description, time current.
 * Phong cách: Tokyo editorial / Swiss typography.
 */
export function MinimalHeroText({ siteName, siteDescription, locale = 'vi', modulesConfig }: MinimalHeroTextProps) {
    const [timeData, setTimeData] = useState({ time: '', date: '' });

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Ho_Chi_Minh'
            });
            const dateStr = now.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'Asia/Ho_Chi_Minh'
            });
            setTimeData({ time: timeStr, date: dateStr });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <section
            className="min-h-[70vh] flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-24 relative overflow-hidden"
            style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}
        >
            <div className="max-w-4xl">

                {/* Name branch — cực to, font bold */}
                <h1
                    className="text-5xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6"
                    style={{ color: 'rgb(var(--theme-text))' }}
                >
                    {siteName || 'Branch Phật Giáo'}
                </h1>

                {/* Gạch ngang accent */}
                <div
                    className="h-1 w-20 mb-8"
                    style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                />

                {/* Description ngắn */}
                <p
                    className="text-lg sm:text-xl font-light leading-relaxed max-w-2xl mb-12"
                    style={{ color: 'rgb(var(--theme-text) / 0.6)' }}
                >
                    {siteDescription || 'Không gian thanh tịnh — nơi Chánh Pháp save truyền, văn hóa Khmer hội tụ.'}
                </p>

                {/* CTA links kiểu text */}
                <div className="flex flex-wrap gap-8">
                    <Link
                        href="/tin-tuc"
                        className="flex items-center gap-2 text-[14px] font-bold tracking-wider uppercase group"
                        style={{ color: 'rgb(var(--theme-text))' }}
                    >
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                        Tin Tức
                    </Link>
                    <Link
                        href="/documents"
                        className="flex items-center gap-2 text-[14px] font-bold tracking-wider uppercase group"
                        style={{ color: 'rgb(var(--theme-text) / 0.5)' }}
                    >
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                        Pháp Thoại
                    </Link>
                    {modulesConfig?.transactions !== false && (
                        <Link
                            href="/transactions"
                            className="flex items-center gap-2 text-[14px] font-bold tracking-wider uppercase group"
                            style={{ color: 'rgb(var(--theme-text) / 0.5)' }}
                        >
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                            Payment
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
