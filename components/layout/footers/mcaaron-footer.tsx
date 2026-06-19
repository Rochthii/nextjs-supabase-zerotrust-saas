'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { getVietnamTime } from '@/lib/utils/date';
import { DEFAULT_SITE_NAME, BRAND_NAME_VI } from '@/lib/constants';
import { TenantLogo } from '@/components/layout/tenant-logo';

const FOOTER_LINKS = {
    company: {
        title: 'Công ty',
        items: [
            { label: 'Về ' + BRAND_NAME_VI, href: '/gioi-thieu' },
            { label: 'News & Thông cáo', href: '/tin-tuc' },
            { label: 'Tuyển dụng', href: '/lien-he' },
        ],
    },
    connect: {
        title: 'Connect',
        items: [
            { label: 'Contact hợp tác', href: '/lien-he' },
            { label: 'Chính sách security', href: '#' },
            { label: 'Điều khoản sử dụng', href: '#' },
        ],
    },
};

// Social icons
const SocialLinks = ({ settings }: { settings: Record<string, string> }) => (
    <div className="flex gap-3 mt-4">
        {/* Facebook */}
        <a
            href={settings['facebook_url'] || 'https://facebook.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-[#00D2FF]/15 border border-white/8 hover:border-[#00D2FF]/30 rounded-full text-gray-400 hover:text-[#00D2FF] transition-all"
            aria-label="Facebook"
        >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        </a>
        {/* YouTube */}
        {settings['youtube_url'] && (
            <a
                href={settings['youtube_url']}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-[#00D2FF]/15 border border-white/8 hover:border-[#00D2FF]/30 rounded-full text-gray-400 hover:text-[#00D2FF] transition-all"
                aria-label="YouTube"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            </a>
        )}
        {/* Email */}
        <a
            href={`mailto:${settings['contact_email'] || ''}`}
            className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-[#00D2FF]/15 border border-white/8 hover:border-[#00D2FF]/30 rounded-full text-gray-400 hover:text-[#00D2FF] transition-all"
            aria-label="Email"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        </a>
    </div>
);

export function McAaronFooter({ settings = {} }: { settings?: Record<string, string>; domain?: string,
    isCompany?: boolean }) {
    const currentYear = getVietnamTime().getFullYear();
    const siteName = settings['site_name_vi'] || BRAND_NAME_VI;

    return (
        <div className="pt-0 pb-4 px-4 lg:px-6 relative z-10">
            <footer className="relative bg-[#050A14] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mx-auto max-w-7xl shadow-[0_-8px_64px_rgba(0,0,0,0.5)]" style={{ backgroundColor: 'var(--theme-footer-bg, #050A14)' }}>

                {/* Background glow effects */}
                <div className="absolute top-0 left-1/4 w-[40rem] h-[20rem] bg-[#00D2FF]/5 blur-[120px] rounded-[100%] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[30rem] h-[15rem] bg-[#004080]/10 blur-[100px] rounded-[100%] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                {/* CTA Strip */}
                <div className="relative border-b border-white/5 px-8 sm:px-12 py-10 lg:py-12">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                Sẵn sàng <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#FFD700]">đồng hành</span> cùng chúng tôi?
                            </h3>
                            <p className="text-[15px] text-gray-400 mt-2 font-medium">
                                Connect để cùng tạo ra tác động xã hội bền vững.
                            </p>
                        </div>
                        <Link
                            href="/lien-he"
                            className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-[#00D2FF] text-[#0A0F1A] text-[15px] font-extrabold rounded-full shadow-[0_4px_24px_rgba(0,210,255,0.3)] hover:shadow-[0_6px_32px_rgba(0,210,255,0.5)] hover:-translate-y-0.5 transition-all"
                        >
                            Hợp tác ngay
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Main footer grid */}
                <div className="relative px-8 sm:px-12 py-12 lg:py-14">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Brand column (2 cols) */}
                        <div className="lg:col-span-2 flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                                <TenantLogo 
                                    src={settings['site_logo']} 
                                    alt={siteName} 
                                    size="md" 
                                    variant="adaptive" 
                                    className="bg-white/5 border border-white/10 p-1 rounded-2xl"
                                />
                                <div>
                                    <div className="text-[16px] font-black text-white">{siteName}</div>
                                    <div className="text-[10px] font-bold tracking-[0.2em] text-[#00D2FF]/60 uppercase">Social Enterprise</div>
                                </div>
                            </div>

                            <p className="text-[14px] text-gray-400 leading-relaxed">
                                {settings['site_description_vi'] || 'Cầu nối chuyển đổi số và bảo tồn giá trị cho các organization cộng đồng, tôn giáo và NGO.'}
                            </p>

                            {/* DNXH badge */}
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00D2FF]/8 border border-[#00D2FF]/15 rounded-full w-fit">
                                <svg className="w-3.5 h-3.5 text-[#00D2FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                                </svg>
                                <span className="text-[11px] font-bold text-[#00D2FF] tracking-wide">Doanh Nghiệp Xã Hội</span>
                            </div>

                            <SocialLinks settings={settings} />
                        </div>

                        {/* Link columns (4 cols) */}
                        {Object.values(FOOTER_LINKS).map((col) => (
                            <div key={col.title} className="lg:col-span-1 flex flex-col gap-4">
                                <h4 className="text-[11px] font-extrabold text-white uppercase tracking-[0.15em] flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#00D2FF]" />
                                    {col.title}
                                </h4>
                                <ul className="flex flex-col gap-2.5">
                                    {col.items.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-[13px] font-medium text-gray-500 hover:text-[#00D2FF] transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse" />
                            <p className="text-[12px] font-medium text-gray-500">
                                © {currentYear} {siteName}. All rights reserved.
                            </p>
                        </div>
                        <p className="text-[11px] font-medium text-gray-600">
                            Được vận hành bởi nền tảng <span className="text-[#00D2FF]/70">Minh Châu Tech Platform</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default McAaronFooter;
