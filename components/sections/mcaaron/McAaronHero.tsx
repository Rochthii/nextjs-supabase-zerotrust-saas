'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Link } from '@/i18n/routing';
import { BRAND_NAME_VI } from '@/lib/constants';

interface McAaronHeroProps {
    data?: BlockConfig;
}

export function McAaronHero({ data }: McAaronHeroProps) {
    const t = useTranslations('mcaaron');
    const content = data?.settings || {};

    const badgeText = content.badge || 'Doanh Nghiệp Xã Hội';
    // Đổi title gradient thành dải màu cao cấp tinh tế
    const titleHtml = content.title || 'Kiến Tạo Giá Trị <br /> <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Cộng Đồng Bền Vững</span>';
    const descriptionText = content.description || `${BRAND_NAME_VI} là doanh nghiệp xã hội công nghệ tiên phong, cung cấp nền tảng quản trị mạng lưới toàn diện, minh bạch và an toàn.`;
    const primaryButtonText = content.primaryButton || 'Khám Phá Hệ Sinh Thế';
    const secondaryButtonText = content.secondaryButton || `Về ${BRAND_NAME_VI}`;
    const primaryLink = content.primaryLink || '/lien-he';
    const secondaryLink = content.secondaryLink || '/gioi-thieu';
    const backgroundImage = content.backgroundImage || '';
    const overlayOpacity = parseFloat(content.overlayOpacity || '0.75');

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#070A0F] text-white">
            
            {/* 1. Background Effects & Grids */}
            <div className="absolute inset-0 z-0">
                {backgroundImage ? (
                    <div className="absolute inset-0">
                        <Image
                            src={backgroundImage}
                            alt="Background"
                            fill
                            className="object-cover object-center"
                            priority
                            sizes="100vw"
                            quality={85}
                        />
                        <div
                            className="absolute inset-0 bg-[#070A0F]"
                            style={{ opacity: overlayOpacity }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#060D17] via-[#070A0F] to-[#04080D]" />

                        {/* Beautiful Soft Ambient Lighting (Teal and Amber) */}
                        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-600/10 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                    </>
                )}

                {/* Micro tech accent grid */}
                <div 
                    className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                    style={{ 
                        backgroundImage: `
                            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px' 
                    }} 
                />
            </div>

            {/* 2. Content */}
            <div className="container relative z-10 px-6 mx-auto max-w-7xl py-20 md:py-0">
                <div className="flex flex-col items-center text-center">

                    {/* Badge Pill with soft glow */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-md mb-8.5 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                    >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-300">{badgeText}</span>
                    </motion.div>

                    {/* Main Content Area */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-4xl mx-auto mb-10 md:mb-12"
                    >
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tight leading-[1.12] mb-8 break-words"
                            dangerouslySetInnerHTML={{ __html: titleHtml }}
                        />

                        <motion.p
                            variants={itemVariants}
                            className="text-base md:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto"
                        >
                            {descriptionText}
                        </motion.p>
                    </motion.div>

                    {/* Modern Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
                    >
                        <Link href={primaryLink} className="w-full sm:w-auto">
                            <button className="group w-full sm:w-auto px-10 py-4 bg-white text-black font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all duration-300 shadow-[0_4px_25px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_25px_rgba(52,211,153,0.3)] hover:-translate-y-0.5 active:scale-95">
                                <span className="flex items-center justify-center gap-2">
                                    {primaryButtonText}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </Link>

                        <Link href={secondaryLink} className="w-full sm:w-auto">
                            <button className="group w-full sm:w-auto px-10 py-4 bg-transparent text-white font-extrabold rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:border-emerald-500/40 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm active:scale-95 flex items-center justify-center gap-2">
                                <Globe className="w-4 h-4 text-emerald-400" />
                                {secondaryButtonText}
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Bottom smooth fade to content section */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#070A0F] to-transparent pointer-events-none z-10" />
        </section>
    );
}

export default McAaronHero;
