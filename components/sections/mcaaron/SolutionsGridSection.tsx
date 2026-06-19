'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { BRAND_NAME_VI } from '@/lib/constants';

const SOLUTIONS = [
    {
        slug: 'chuyen-doi-so',
        num: '01',
        label: 'Digital Transformation',
        title: 'Chuyển đổi số Organization',
        desc: 'Xây dựng website, system quản trị và nền tảng số hóa toàn diện cho organization tôn giáo, NGO và cộng đồng.',
        accent: '#00D2FF',
        border: 'rgba(0,210,255,0.18)',
        glow: 'rgba(0,210,255,0.10)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
        ),
    },
    {
        slug: 'truyen-thong',
        num: '02',
        label: 'Community Communications',
        title: 'Truyền thông Cộng đồng',
        desc: 'Chiến lược content, quản lý mạng xã hội và sản xuất video giúp organization tiếp cận sâu rộng hơn.',
        accent: '#A855F7',
        border: 'rgba(168,85,247,0.18)',
        glow: 'rgba(168,85,247,0.10)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
        ),
    },
    {
        slug: 'van-hoa',
        num: '03',
        label: 'Culture & Heritage',
        title: 'Văn hóa & Bảo tồn',
        desc: 'Số hóa và gìn giữ di sản văn hóa, kinh điển và tri thức truyền thống bằng công nghệ save trữ hiện đại.',
        accent: '#F59E0B',
        border: 'rgba(245,158,11,0.18)',
        glow: 'rgba(245,158,11,0.10)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
        ),
    },
    {
        slug: 'su-kien',
        num: '04',
        label: 'Social Events',
        title: 'Event Xã hội',
        desc: 'Organization và quản lý event từ thiện, lễ hội văn hóa và hoạt động cộng đồng từ A đến Z.',
        accent: '#10B981',
        border: 'rgba(16,185,129,0.18)',
        glow: 'rgba(16,185,129,0.10)',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
    },
] as const;

interface Props {
    data?: BlockConfig;
}

export function SolutionsGridSection({ data }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(containerRef, { freezeOnceVisible: true, rootMargin: '200px' });
    const isVisible = !!entry?.isIntersecting;

    const content = data?.settings || {};
    const sectionBadge = content.sectionBadge || 'Giải pháp của chúng tôi';
    const sectionTitle = content.sectionTitle || 'Công nghệ phục vụ';
    const sectionTitleAccent = content.sectionTitleAccent || 'con người';
    const sectionDesc = content.sectionDesc || `${BRAND_NAME_VI} mang đến các giải pháp toàn diện giúp organization cộng đồng, tôn giáo và NGO chuyển đổi số bền vững.`;
    const ctaLabel = content.ctaLabel || 'View all giải pháp';

    return (
        <section ref={containerRef} className="relative py-32 overflow-hidden bg-gradient-to-b from-white to-slate-50">
            {/* Ambient glows - Lightened */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-[600px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.03) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            </div>

            <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8 backdrop-blur-md bg-white border border-slate-200 shadow-sm"
                        style={{ border: '1px solid rgba(0,210,255,0.15)' }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D2FF' }} />
                        <span className="text-[12px] font-bold tracking-[0.22em] uppercase" style={{ color: '#00D2FF' }}>
                            {sectionBadge}
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6"
                    >
                        <span className="text-slate-900">{sectionTitle}</span>
                        {' '}
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(135deg, #00D2FF 0%, #7B61FF 50%, #FFD700 100%)' }}>
                            {sectionTitleAccent}
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-600 max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed"
                    >
                        {sectionDesc}
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {SOLUTIONS.map((sol, idx) => (
                        <motion.div
                            key={sol.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.15 + idx * 0.08 }}
                        >
                            <Link
                                href={idx === 0 ? '/gioi-thieu' : '/lien-he'}
                                className="group block relative rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full bg-white border border-slate-200 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]"
                                    style={{ background: `radial-gradient(circle at 30% 50%, ${sol.glow} 0%, transparent 60%)` }} />
                                
                                {/* Refined border glow */}
                                <div className="absolute inset-0 border border-transparent group-hover:border-black/5 transition-colors duration-700 rounded-[2.5rem]" />

                                {/* Top border accent */}
                                <div className="absolute top-0 left-12 right-12 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-full"
                                    style={{ background: `linear-gradient(90deg, transparent, ${sol.accent}, transparent)` }} />

                                <div className="relative z-10 p-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-white shadow-sm"
                                            style={{ border: `1px solid ${sol.border}`, color: sol.accent }}>
                                            {React.cloneElement(sol.icon as any, { className: 'w-8 h-8' })}
                                        </div>
                                        <span className="text-6xl font-black leading-none select-none opacity-5 group-hover:opacity-10 transition-opacity"
                                            style={{ color: sol.accent }}>{sol.num}</span>
                                    </div>
                                    <div className="text-[12px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: sol.accent }}>
                                        {sol.label}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 transition-colors leading-tight group-hover:text-[#00D2FF]">{sol.title}</h3>
                                    <p className="text-[15px] text-slate-600 leading-relaxed mb-8 font-medium">{sol.desc}</p>
                                    <div className="flex items-center gap-2.5 text-[14px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors duration-300">
                                        <span>Khám phá details</span>
                                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#00D2FF] group-hover:bg-[#00D2FF]/10 transition-all">
                                            <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:text-[#00D2FF] transition-all duration-300"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.55 }}
                    className="text-center"
                >
                    <Link
                        href="/lien-he"
                        className="group inline-flex items-center gap-4 px-10 py-5 font-black rounded-full transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,210,255,0.4)] text-[16px] relative overflow-hidden"
                        style={{ background: '#00D2FF', color: '#030812' }}
                    >
                        <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10">{ctaLabel}</span>
                        <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

export default SolutionsGridSection;
