'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { BRAND_NAME_VI } from '@/lib/constants';

interface TimelineItem {
    date: string;
    title: string;
    description: string;
    status: 'done' | 'in-progress' | 'planned';
    link?: string;
}

interface TransparencyTimelineProps {
    data?: BlockConfig;
}

export function TransparencyTimeline({ data }: TransparencyTimelineProps) {
    const content = data?.settings || {};

    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(containerRef, {
        freezeOnceVisible: true,
        rootMargin: '200px',
    });
    const isVisible = !!entry?.isIntersecting;

    useEffect(() => {
        if (isVisible && !mounted) {
            setMounted(true);
        }
    }, [isVisible, mounted]);

    const sectionBadge = content.sectionBadge || 'Lộ Trình Minh Bạch';
    const sectionTitle = content.sectionTitle || 'Hành Trình Kiến Tạo Giá Trị.';
    const sectionDesc = content.sectionDesc || `Theo dõi các cột mốc quan trọng và cam kết của ${BRAND_NAME_VI} trong việc xây dựng hệ sinh thái số minh bạch cho cộng đồng.`;

    const items: TimelineItem[] = content.items || [
        {
            date: 'Month 1, 2024',
            title: `Khởi động Project ${BRAND_NAME_VI}`,
            description: 'Thiết lập đội ngũ nòng cốt và định hình tầm nhìn doanh nghiệp xã hội.',
            status: 'done',
        },
        {
            date: 'Quý 2, 2024',
            title: 'Ra mắt Cổng Minh Bạch v1.0',
            description: 'Triển khai system tra cứu transaction time thực cho 10 unit tiên phong.',
            status: 'in-progress',
        },
        {
            date: 'Năm 2025',
            title: 'Open rộng Hệ sinh thái Toàn quốc',
            description: 'Connect hơn 100 tự viện và organization xã hội trên nền tảng cross-aggregation.',
            status: 'planned',
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    if (!mounted) {
        return <div ref={containerRef} className="py-24 min-h-[400px] bg-[#070A0F] flex items-center justify-center text-gray-400 animate-pulse">Loading lộ trình...</div>;
    }

    return (
        <section ref={containerRef} className="py-28 bg-[#070A0F] overflow-hidden text-white relative">
            {/* Background ambient lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/3 blur-[150px] rounded-full pointer-events-none" />

            <div className="container px-6 mx-auto max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-5 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        {sectionBadge}
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight"
                    >
                        {sectionTitle}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-sm md:text-base"
                    >
                        {sectionDesc}
                    </motion.p>
                </div>

                {/* Timeline Layout */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative"
                >
                    {/* Vertical Line Gradient */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-emerald-500/30 via-white/5 to-transparent md:-ml-px" />

                    <div className="space-y-16">
                        {items.map((item, idx) => {
                            const isEven = idx % 2 === 0;
                            
                            const statusStyles = 
                                item.status === 'done' ? {
                                    color: 'text-emerald-400',
                                    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                                    iconColor: 'text-emerald-400 bg-[#0F1622] border-emerald-500/30'
                                } : item.status === 'in-progress' ? {
                                    color: 'text-amber-400',
                                    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                                    iconColor: 'text-amber-400 bg-[#0F1622] border-amber-500/30'
                                } : {
                                    color: 'text-slate-500',
                                    badge: 'bg-white/5 border-white/10 text-slate-400',
                                    iconColor: 'text-slate-500 bg-[#0F1622] border-white/10'
                                };

                            const StatusIcon =
                                item.status === 'done' ? CheckCircle2 :
                                    item.status === 'in-progress' ? Clock :
                                        Circle;

                            return (
                                <motion.div key={idx} variants={itemVariants} className="relative flex items-center">
                                    <div className={cn(
                                        "flex flex-col md:flex-row w-full items-center",
                                        isEven ? "md:flex-row-reverse" : ""
                                    )}>
                                        {/* Spacer for large screens */}
                                        <div className="hidden md:block w-1/2" />

                                        {/* Timeline Dot Indicator */}
                                        <div className={cn(
                                            "absolute left-4 md:left-1/2 w-8 h-8 rounded-full border-2 z-10 flex items-center justify-center md:-ml-4 shadow-lg",
                                            statusStyles.iconColor
                                        )}>
                                            <StatusIcon className="w-4 h-4" />
                                        </div>

                                        {/* Glassmorphic Card Container */}
                                        <div className={cn(
                                            "w-full md:w-1/2 pl-12 md:pl-0",
                                            isEven ? "md:pr-12" : "md:pl-12"
                                        )}>
                                            <div className={cn(
                                                "p-8 rounded-[2rem] bg-white/[0.01] border border-white/[0.04] hover:border-emerald-500/30 transition-all duration-300 group shadow-2xl flex flex-col relative overflow-hidden",
                                                isEven ? "md:text-right md:items-end" : "md:text-left md:items-start"
                                            )}>
                                                {/* Hover card glow behind */}
                                                <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none" />

                                                <span className={cn("text-xs font-extrabold tracking-widest uppercase mb-2 block", statusStyles.color)}>
                                                    {item.date}
                                                </span>
                                                
                                                <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                                                    {item.title}
                                                </h3>
                                                
                                                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
                                                    {item.description}
                                                </p>

                                                {item.link && (
                                                    <a
                                                        href={item.link}
                                                        target={item.link.startsWith('http') ? '_blank' : undefined}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 tracking-wider uppercase transition-colors mb-4"
                                                    >
                                                        View details <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}

                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border leading-none",
                                                    statusStyles.badge
                                                )}>
                                                    {item.status === 'done' ? 'Đã complete' : item.status === 'in-progress' ? 'Đang thực hiện' : 'Kế hoạch'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default TransparencyTimeline;
