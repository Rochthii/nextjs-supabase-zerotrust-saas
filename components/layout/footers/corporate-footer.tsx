'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { getVietnamTime } from '@/lib/utils/date';
import { DEFAULT_SITE_NAME, BRAND_NAME_VI } from '@/lib/constants';
import { TenantLogo } from '@/components/layout/tenant-logo';
import { Building2, Shield, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const FOOTER_LINKS = {
    company: {
        title: 'Enterprise',
        items: [
            { label: 'About chung', href: '/gioi-thieu' },
            { label: 'News & Thông cáo', href: '/tin-tuc' },
            { label: 'Contact hợp tác', href: '/lien-he' },
        ],
    },
    legal: {
        title: 'Pháp lý',
        items: [
            { label: 'Điều khoản sử dụng', href: '#' },
            { label: 'Chính sách security', href: '#' },
            { label: 'Quy chế hoạt động', href: '#' },
        ],
    },
};

export function CorporateFooter({ settings = {} }: { settings?: Record<string, string>; domain?: string; isCompany?: boolean }) {
    const currentYear = getVietnamTime().getFullYear();
    const siteName = settings['site_name_vi'] || BRAND_NAME_VI;
    const siteLogo = settings['site_logo'];

    return (
        <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 relative overflow-hidden" suppressHydrationWarning>
            {/* Top gradient blur element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="absolute -top-40 left-1/3 w-[500px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
                {/* Upper grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
                    
                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <TenantLogo 
                                src={siteLogo} 
                                alt={siteName} 
                                variant="circle" 
                                size="md" 
                                className="bg-slate-800 ring-2 ring-slate-700/50 shadow-md"
                            />
                            <div>
                                <span className="block text-[15px] font-extrabold text-white tracking-tight leading-tight">
                                    {siteName}
                                </span>
                                <span className="block text-[9px] font-bold text-indigo-400 tracking-wider uppercase mt-0.5">
                                    Enterprise Platform
                                </span>
                            </div>
                        </Link>
                        
                        <p className="text-slate-400 text-[13px] leading-relaxed max-w-sm">
                            System quản lý nguồn lực doanh nghiệp tích hợp cổng minh bạch dữ liệu, hỗ trợ chuyển đổi số và nâng cao trách nhiệm giải trình xã hội.
                        </p>

                        <div className="space-y-3 pt-2 text-[13px]">
                            {settings['contact_address'] && (
                                <div className="flex items-start gap-2.5">
                                    <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                    <span>{settings['contact_address']}</span>
                                </div>
                            )}
                            {settings['contact_phone'] && (
                                <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                                    <a href={`tel:${settings['contact_phone']}`} className="hover:text-indigo-400 transition-colors">
                                        {settings['contact_phone']}
                                    </a>
                                </div>
                            )}
                            {settings['contact_email'] && (
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                                    <a href={`mailto:${settings['contact_email']}`} className="hover:text-indigo-400 transition-colors">
                                        {settings['contact_email']}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Links columns */}
                    {Object.values(FOOTER_LINKS).map((group, idx) => (
                        <div key={idx} className="space-y-4">
                            <h4 className="text-[12px] font-bold text-slate-100 uppercase tracking-widest">
                                {group.title}
                            </h4>
                            <ul className="space-y-2.5 text-[13px]">
                                {group.items.map((item, i) => (
                                    <li key={i}>
                                        <Link href={item.href} className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center group/link">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/link:bg-indigo-500 mr-2 transition-colors duration-200" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>

                {/* Bottom section */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
                    <div>
                        &copy; {currentYear} {siteName}. All rights reserved. Powered by TenantShield.
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-500" />
                            ISO 27001 Certified
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                            Multi-tenant SLA Isolated
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
