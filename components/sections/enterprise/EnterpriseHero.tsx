'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { type BlockConfig } from '@/lib/types/layout-blocks';

export function EnterpriseHero({ data }: { data?: BlockConfig }) {
    const content = data?.settings || {};
    const title = content.title || 'Nền Tảng Quản Trị & Vận Hành Toàn Diện';
    const description = content.description || 'Giải pháp SaaS security cao, tối ưu quy trình làm việc và connect mạng lưới đa branch cho organization của bạn.';
    const primaryCta = content.primaryCta || 'Bắt đầu ngay';
    const secondaryCta = content.secondaryCta || 'Tìm hiểu add';

    return (
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 overflow-hidden bg-[#05080E] text-white">
            
            {/* 1. Fine Corporate Grid Background */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                    style={{ 
                        backgroundImage: `
                            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
                        `,
                        backgroundSize: '48px 48px' 
                    }} 
                />
                
                {/* Steel Blue & Deep Indigo Ambient Lights */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none animate-pulse" />
            </div>

            <div className="container relative z-10 px-6 mx-auto max-w-6xl text-center">
                
                {/* Tech Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-md mb-8.5 shadow-[0_0_15px_rgba(255,255,255,0.01)]"
                >
                    <ShieldCheck className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-300">System standard Enterprise</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-6xl lg:text-7.5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-[#93c5fd] tracking-tight mb-8 leading-[1.12]"
                >
                    {title}
                </motion.h1>

                {/* Description text */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    {description}
                </motion.p>

                {/* Modern CTA Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
                >
                    <Link href="/lien-he" className="w-full sm:w-auto">
                        <button className="group w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:scale-95">
                            {primaryCta}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    
                    <Link href="/gioi-thieu" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-10 py-4 bg-transparent text-white font-extrabold rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:border-blue-500/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm active:scale-95">
                            {secondaryCta}
                        </button>
                    </Link>
                </motion.div>

                {/* Compliance / Certifications */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-16 flex flex-wrap justify-center gap-6 md:gap-8 text-xs text-slate-500"
                >
                    <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" /> Security đa lớp nâng cấp
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" /> Interface Site động time thực
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" /> Standard mã hóa dữ liệu đầu cuối
                    </div>
                </motion.div>
            </div>
            
            {/* Bottom soft gradient blend */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#05080E] to-transparent pointer-events-none z-10" />
        </section>
    );
}

export default EnterpriseHero;
