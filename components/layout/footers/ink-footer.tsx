'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { getVietnamTime } from '@/lib/utils/date';
import { TenantLogo } from '@/components/layout/tenant-logo';

const VisitorCounter = dynamic(
    () => import('@/components/analytics/VisitorCounter').then(m => ({ default: m.VisitorCounter })),
    { ssr: false }
);

// ──────────────────────────────────────────────────────────
// Style: Ink Footer — Avant-Garde Minimalism
// ──────────────────────────────────────────────────────────

export function InkFooter({ settings = {} }: any) {
    const t = useTranslations('common');
    const currentYear = getVietnamTime().getFullYear();

    return (
        <footer className="bg-white text-black py-20 px-6 border-t border-black/5" style={{ backgroundColor: 'var(--theme-footer-bg, #ffffff)' }}>
            <div className="mx-auto max-w-[1400px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="flex items-start gap-6 border-l-4 border-black pl-8">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                size="lg" 
                                variant="adaptive" 
                                className="grayscale contrast-125"
                            />
                            <div className="flex flex-col">
                                <h2 className="text-3xl font-serif font-black uppercase tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {settings['site_name_vi'] || 'Minh Châu'}
                                </h2>
                                <p className="text-[11px] font-bold tracking-[0.4em] uppercase opacity-40 mt-1">
                                    Digital Dharma & Art
                                </p>
                            </div>
                        </div>
                        <p className="max-w-xs text-sm leading-relaxed opacity-60">
                            {settings['site_description_vi'] || 'Một project thử nghiệm connect tinh hoa truyền thống với ngôn ngữ thiết kế đương đại.'}
                        </p>
                        <div className="pt-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                            <VisitorCounter />
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest">Connect</h3>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><a href={settings['facebook_url'] || "#"} className="hover:underline">Facebook</a></li>
                                <li><a href={settings['youtube_url'] || "#"} className="hover:underline">Youtube</a></li>
                                <li><a href="#" className="hover:underline">Newsletter</a></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest">Platform</h3>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="/gioi-thieu" className="hover:underline">Về Dự Án</Link></li>
                                <li><Link href="/lien-he" className="hover:underline">Liên Hệ</Link></li>
                                <li><Link href="/tin-tuc" className="hover:underline">Báo Chí</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter / Contact Vertical */}
                    <div className="lg:col-span-3 space-y-12">
                        <div className="group relative">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Newsletter</h3>
                            <div className="flex border-b border-black py-2">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="bg-transparent w-full text-sm focus:outline-none focus:placeholder-transparent"
                                />
                                <button className="font-black text-xs uppercase tracking-tighter">Join</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest">Address</h3>
                            <p className="text-sm leading-relaxed font-bold">
                                {settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final Stripe */}
                <div className="mt-32 pt-10 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                    <p>© {currentYear} Ink & Digital</p>
                    <p>Designed for Peace & Clarity</p>
                    <p>Powered by Advanced Agentic Coding</p>
                </div>
            </div>
        </footer>
    );
}
