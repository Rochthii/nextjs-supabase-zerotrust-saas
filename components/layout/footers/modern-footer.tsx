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

export function ModernFooter({ settings = {}, domain, isCompany }: { settings?: Record<string, string>, domain?: string,
    isCompany?: boolean }) {
    const isMCAaron = isCompany;
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
        // Floating wrapper padding setup for Modern Look
        <div className="pt-8 pb-4 px-4 lg:px-6 z-10 relative">

            {/* Main Floating Footer Card */}
            <footer className="relative bg-gradient-to-b from-gray-900 to-black rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 mx-auto max-w-7xl" style={{ background: 'var(--theme-footer-bg, linear-gradient(to bottom, #111827, #000000))' }}>

                {/* ── Background Glow Effects ── */}
                <div className="absolute top-0 right-1/4 w-[40rem] h-[20rem] bg-primary/20 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
                <div className="absolute bottom-0 left-1/4 w-[30rem] h-[15rem] bg-orange-500/10 blur-[100px] rounded-[100%] pointer-events-none opacity-50" />

                {/* ── Newsletter strip ── */}
                <div className="relative border-b border-white/5 bg-white/5 backdrop-blur-3xl p-8 sm:p-10 lg:p-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto w-full">
                        <div className="text-center md:text-left flex-shrink-0 relative z-10">
                            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                Update news
                            </h3>
                            <p className="text-sm text-gray-400 mt-2 max-w-md">
                                {isMCAaron
                                    ? 'Để lại email để nhận thông tin về các hoạt động cộng đồng và report minh bạch latest.'
                                    : 'Để lại email để nhận thông tin về các event lễ hội và chuỗi bài giảng pháp thoại latest.'
                                }
                            </p>
                        </div>
                        <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3 relative z-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@email.com"
                                    required
                                    disabled={isSubmitting}
                                    className="relative px-6 py-4 min-h-[56px] w-full sm:w-80 bg-black/40 backdrop-blur-md border border-white/10 focus:border-white/30 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 text-[15px] font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="relative px-8 min-h-[56px] bg-white text-black text-[15px] font-bold rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isSubmitting ? 'Đang submit...' : 'Registration ngay'}
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-4 text-sm font-medium text-center relative z-10 ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                            {message}
                        </p>
                    )}
                </div>

                {/* ── Main content ── */}
                <div className="relative px-8 sm:px-12 py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">

                        {/* 1. About & Logo */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 group">
                                    <TenantLogo 
                                        src={settings['site_logo']} 
                                        alt={settings['site_name_vi']} 
                                        size="lg" 
                                        variant="adaptive" 
                                        className="bg-white/10 border border-white/10 group-hover:border-primary/50 backdrop-blur-sm rounded-2xl"
                                    />
                                    <div className="flex flex-col justify-center">
                                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                                            {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                        </h3>
                                        <span className="text-[11px] text-gray-400 tracking-[0.2em] font-medium uppercase mt-1">
                                            {settings['site_name_en'] || 'Buddhist Tenant'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[15px] text-gray-400 leading-relaxed font-medium">
                                    {isMCAaron
                                        ? (settings['site_description_vi'] || 'Enterprise xã hội định hướng cộng đồng, ưu tiên tính minhạch, phát triển bền vững và phụng sự con người.')
                                        : 'Không gian thanh tịnh bình an, nơi save giữ tinh hoa Phật Giáo Nguyên Tcancel và văn hóa dân tộc. Cửa branch luôn luôn rộng open đón bước chân thiện nam tín nữ.'
                                    }
                                </p>
                            </div>

                            <div className="mt-2 bg-white/5 border border-white/10 rounded-2xl p-4 w-fit backdrop-blur-sm" suppressHydrationWarning>
                                <VisitorCounter />
                            </div>

                            {/* Social links */}
                            <div className="flex gap-3 mt-2">
                                <a
                                    href={settings['facebook_url'] || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/5 rounded-full text-white hover:text-white transition-all hover:scale-105"
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
                                        className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/5 rounded-full text-white hover:text-white transition-all hover:scale-105"
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
                        <div className="lg:col-span-3 flex flex-col gap-5 bg-white/5 border border-white/10 rounded-3xl p-6 h-fit backdrop-blur-md">
                            <h4 className="text-[13px] font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                {isMCAaron ? 'Giờ làm việc' : 'Giờ thờ tự'}
                            </h4>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center bg-black/20 px-4 py-3 rounded-xl">
                                    <span className="text-[14px] font-medium text-gray-300">Hằng ngày</span>
                                    <span className="text-[14px] font-bold text-white bg-white/10 px-3 py-1 rounded-lg">5:00 – 20:00</span>
                                </div>
                            </div>

                            <a
                                href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex items-center justify-center gap-2 px-5 py-3.5 text-[14px] font-bold text-white bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Chỉ đường Google Maps
                            </a>
                        </div>

                        {/* 3. Contact */}
                        <div className="lg:col-span-4 flex flex-col gap-5 pl-0 lg:pl-4">
                            <h4 className="text-[13px] font-extrabold text-white uppercase tracking-wider mb-2">
                                Thông tin contact
                            </h4>

                            <ul className="space-y-4">
                                <li>
                                    <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="group flex items-start gap-4 p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-all">
                                        <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 text-white group-hover:text-primary transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[12px] font-bold text-gray-500 uppercase">Điện thoại</span>
                                            <span className="text-[16px] font-semibold text-white group-hover:text-primary transition-colors">
                                                {settings['contact_phone'] || '(028) 1234 5678'}
                                            </span>
                                        </div>
                                    </a>
                                </li>

                                <li>
                                    <a href={`mailto:${settings['contact_email'] || ''}`} className="group flex items-start gap-4 p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-all">
                                        <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 text-white group-hover:text-primary transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col gap-0.5 max-w-full">
                                            <span className="text-[12px] font-bold text-gray-500 uppercase">Hộp thư điện tử</span>
                                            <span className="text-[15px] font-semibold text-white group-hover:text-primary transition-colors break-all">
                                                {settings['contact_email'] || ''}
                                            </span>
                                        </div>
                                    </a>
                                </li>

                                <li className="flex items-start gap-4 p-3 -mx-3 rounded-2xl">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-gray-400">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[280px]">
                                        <span className="text-[12px] font-bold text-gray-500 uppercase">Address</span>
                                        <span className="text-[14px] font-medium text-gray-300 leading-relaxed">
                                            {settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* ── Bottom Copyright bar ── */}
                    <div className="mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-white/10 max-w-6xl mx-auto">
                        <div className="flex gap-6">
                            <span className="text-[13px] font-medium text-gray-500 hover:text-white transition-colors cursor-pointer">Chính sách security</span>
                            <span className="text-[13px] font-medium text-gray-500 hover:text-white transition-colors cursor-pointer">Điều khoản</span>
                        </div>

                        <div className="text-center sm:text-right flex flex-col gap-1">
                            <p className="text-[13px] font-medium text-white/70">
                                © {currentYear} {settings['site_name_vi'] || DEFAULT_SITE_NAME}.
                            </p>
                            <p className="text-[11px] font-medium text-gray-500">
                                {t('developed_by')}
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
