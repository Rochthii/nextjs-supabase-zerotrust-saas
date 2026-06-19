'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Code2, Palette, ArrowRight, User, Users, Briefcase, Star, Heart, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { BRAND_NAME_VI } from '@/lib/constants';

const ICONS: Record<string, LucideIcon> = {
    ShieldCheck, Code2, Palette, User, Users, Briefcase, Star, Heart
};

interface Member {
    name: string;
    role: string;
    desc: string;
    link?: string;
    icon?: string;
}

interface FounderSectionProps {
    data?: BlockConfig;
}

export function FounderSection({ data }: FounderSectionProps) {
    const content = data?.settings || {};

    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(containerRef, {
        freezeOnceVisible: true,
        rootMargin: '600px',
    });
    const isVisible = !!entry?.isIntersecting;

    useEffect(() => {
        if (isVisible && !mounted) {
            setMounted(true);
        }
    }, [isVisible, mounted]);

    const sectionBadge = content.sectionBadge || 'Đội Ngũ Sáng Lập';
    const sectionTitle = content.sectionTitle || 'Trái Tim & Block Óc Của Doanh Nghiệp.';
    const sectionDesc = content.sectionDesc || `Những con người tâm huyết định hướng ${BRAND_NAME_VI} trên con đường trở thành doanh nghiệp xã hội tiên phong, kết hợp công nghệ cốt lõi và sứ mệnh phụng sự cộng đồng.`;

    // Construct members list: use settings.members if available, otherwise fall back to the original 3
    let members: Member[] = content.members || [
        {
            name: content.founder2Name || 'NGUYỄN NGỌC MINH CHÂU',
            role: content.founder2Role || 'Tổng Giám đốc',
            desc: content.founder2Desc || `Tầm nhìn chiến lược và khát vọng phụng sự, dẫn dắt ${BRAND_NAME_VI} trở thành hạt nhân connect công nghệ.`,
            icon: 'ShieldCheck',
            link: content.founder2Link
        },
        {
            name: content.founder1Name || '...',
            role: content.founder1Role || 'Giám đốc Công nghệ',
            desc: content.founder1Desc || 'Xây dựng lõi engine mạnh mẽ, security và công nghệ cross-aggregation vượt trội.',
            icon: 'Code2',
            link: content.founder1Link
        },
        {
            name: content.founder3Name || 'Anh Đạm',
            role: content.founder3Role || 'Giám đốc Sáng tạo',
            desc: content.founder3Desc || 'Định hình phong cách đẳng cấp, tinh tế. Truyền tải thông điệp vì cộng đồng sâu sắc.',
            icon: 'Palette',
            link: content.founder3Link
        },
    ];

    // Robust Featured logic: Find CEO or default to first
    const ceoIndex = members.findIndex(m =>
        m.role?.toLowerCase().includes('tổng giám đốc') ||
        m.role?.toLowerCase() === 'ceo'
    );

    let featuredMember: Member;
    let otherMembers: Member[];

    if (ceoIndex !== -1) {
        featuredMember = members[ceoIndex];
        otherMembers = [...members.slice(0, ceoIndex), ...members.slice(ceoIndex + 1)];
    } else {
        featuredMember = members[0];
        otherMembers = members.slice(1);
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
    };

    if (!mounted) {
        return <div ref={containerRef} className="py-24 min-h-[600px] bg-[#FAF8F5] flex items-center justify-center text-gray-400 animate-pulse">Loading ban sáng lập...</div>;
    }


    return (
        <section ref={containerRef} className="relative py-24 overflow-hidden bg-[#FAF8F5]">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00D2FF]/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#FFD700]/10 blur-[150px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm mb-6"
                    >
                        <ShieldCheck className="w-5 h-5 text-[#002B5B]" />
                        <span className="text-sm font-bold tracking-widest uppercase text-[#002B5B]">{sectionBadge}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-[#002B5B] tracking-tight mb-6"
                    >
                        {sectionTitle}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        {sectionDesc}
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto lg:auto-rows-[420px]"
                >
                    {/* Featured Member Card (CEO) */}
                    {featuredMember && (() => {
                        const Icon = featuredMember.icon && ICONS[featuredMember.icon] ? ICONS[featuredMember.icon] : ShieldCheck;
                        return (
                            <motion.div
                                variants={itemVariants}
                                className="order-1 lg:order-2 group relative flex flex-col justify-end p-8 rounded-[2.5rem] bg-gradient-to-br from-[#002B5B] to-[#001936] text-white shadow-[0_20px_50px_rgba(0,43,91,0.2)] hover:shadow-[0_30px_70px_rgba(0,43,91,0.3)] transition-all duration-500 overflow-hidden md:col-span-2 lg:col-span-1 lg:-mt-10 lg:mb-10 lg:scale-[1.05] z-20 min-h-[420px]"
                            >
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 z-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                                    <Icon className="w-7 h-7 text-[#FFD700]" />
                                </div>
                                <div className="relative z-10 mt-auto">
                                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/30">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">{featuredMember.role}</span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">{featuredMember.name}</h3>
                                    <p className="text-gray-300 font-medium leading-relaxed mb-6 line-clamp-3">{featuredMember.desc}</p>
                                    <a
                                        href={featuredMember.link || '#'}
                                        target={(featuredMember.link || '').startsWith('http') ? '_blank' : undefined}
                                        className="w-12 h-12 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center group-hover:border-solid group-hover:bg-white transition-all duration-300"
                                    >
                                        <ArrowRight className="w-5 h-5 text-white group-hover:text-[#002B5B] transition-colors" />
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })()}

                    {/* Other Members Cards */}
                    {otherMembers.map((member, idx) => {
                        const Icon = member.icon && ICONS[member.icon] ? ICONS[member.icon] : User;
                        // For layout logic correctly: 
                        // If idx is 0, it was the first 'other' member, which on desktop should be lg:order-1 (Left)
                        // If idx is 1, it should be lg:order-3 (Right)
                        // If idx > 1, it should just follow normally
                        let orderClass = "order-2";
                        if (idx === 0) orderClass = "lg:order-1";
                        else if (idx === 1) orderClass = "lg:order-3";
                        else orderClass = `lg:order-${idx + 3}`;

                        return (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className={cn(
                                    "group relative flex flex-col justify-end p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,136,170,0.12)] transition-all duration-500 overflow-hidden min-h-[420px]",
                                    orderClass
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00D2FF]/5 to-transparent z-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    <Icon className="w-7 h-7 text-[#00D2FF]" />
                                </div>
                                <div className="relative z-10 mt-auto">
                                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/20">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#0088AA]">{member.role}</span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 truncate">{member.name}</h3>
                                    <p className="text-gray-600 font-medium leading-relaxed mb-6 line-clamp-3">{member.desc}</p>
                                    <a
                                        href={member.link || '#'}
                                        target={(member.link || '').startsWith('http') ? '_blank' : undefined}
                                        className="w-12 h-12 rounded-full border-2 border-dashed border-[#0088AA]/30 flex items-center justify-center group-hover:border-solid group-hover:bg-[#00D2FF] transition-all duration-300"
                                    >
                                        <ArrowRight className="w-5 h-5 text-[#0088AA] group-hover:text-white transition-colors" />
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

export default FounderSection;
