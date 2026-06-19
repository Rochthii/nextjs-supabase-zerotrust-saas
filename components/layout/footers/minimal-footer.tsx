'use client';
import { getVietnamTime } from '@/lib/utils/date';

import React from 'react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

// Dynamic import — defer analytics polling from critical path
const VisitorCounter = dynamic(
    () => import('@/components/analytics/VisitorCounter').then(m => ({ default: m.VisitorCounter })),
    { ssr: false }
);

import { DEFAULT_SITE_NAME } from '@/lib/constants';
import { TenantLogo } from '@/components/layout/tenant-logo';

export function MinimalFooter({ settings = {}, domain, isCompany }: { settings?: Record<string, string>, domain?: string,
    isCompany?: boolean }) {
    const t = useTranslations('common');
    const tNav = useTranslations('navigation');
    const currentYear = getVietnamTime().getFullYear();
    const [email, setEmail] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        setMessage('');

        try {
            const locale = document.documentElement.lang || 'vi';
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Registration successfully! Cảm ơn bạn đã quan tâm.');
                setEmail('');
            } else {
                setMessage(data.error || 'An error occurred. Please try again sau.');
            }
        } catch (error) {
            setMessage('Không thể connect server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="relative bg-white border-t border-gray-100" style={{ backgroundColor: 'var(--theme-footer-bg, #ffffff)' }}>
            {/* ── Newsletter strip ── */}
            <div className="border-b border-gray-50 bg-gray-50/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left flex-shrink-0">
                            <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                                Registration nhận news
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Update các event & pháp thoại latest.
                            </p>
                        </div>
                        <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Address email..."
                                required
                                disabled={isSubmitting}
                                className="px-4 py-2.5 min-h-[44px] w-full sm:w-80 bg-white border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 min-h-[44px] bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isSubmitting ? 'Registration' : 'Registration'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-3 text-sm text-center md:text-right font-medium ${message.includes('successfully') ? 'text-primary' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* 1. About & Logo */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                size="md" 
                                variant="adaptive" 
                                className="bg-gray-50/50"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </h3>
                                <span className="text-[10px] text-gray-500 tracking-widest uppercase">{settings['site_name_en'] || 'Buddhist Tenant'}</span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-6 max-w-sm leading-relaxed" suppressHydrationWarning>
                            Nơi gìn giữ và phát huy các giá trị di sản văn hóa, tâm linh, mang đến không gian thiền định bình an cho mọi người.
                        </div>

                        <div className="mt-4 mb-6 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" suppressHydrationWarning>
                            <VisitorCounter />
                        </div>

                        {/* Social links */}
                        <div className="flex gap-3">
                            <a
                                href={settings['facebook_url'] || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-900 transition-colors"
                                aria-label="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            {settings['youtube_url'] && (
                                <a
                                    href={settings['youtube_url']}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-900 transition-colors"
                                    aria-label="YouTube"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 2. Giờ open cửa */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-5">
                            Giờ open cửa
                        </h4>
                        <div className="flex flex-col gap-2 mb-6 text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">Hằng ngày</span>
                            <span>5:00 – 20:00</span>
                        </div>
                        <a
                            href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            View bản đồ
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>

                    {/* 3. Contact */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-5">
                            Contact
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900">Address</span>
                                <span>{settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900">Điện thoại</span>
                                <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">
                                    {settings['contact_phone'] || '(028) 1234 5678'}
                                </a>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900">Email</span>
                                <a href={`mailto:${settings['contact_email'] || ''}`} className="hover:text-primary transition-colors">
                                    {settings['contact_email'] || ''}
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        © {currentYear} {settings['site_name_vi'] || DEFAULT_SITE_NAME}. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-400">
                        {t('developed_by')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
