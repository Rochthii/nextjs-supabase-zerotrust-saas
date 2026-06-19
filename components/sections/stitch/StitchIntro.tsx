'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShieldCheck, Globe, BarChart3 } from 'lucide-react';
import type { AboutSectionRow } from '@/lib/cache/queries';

interface StitchIntroProps {
    introSection?: AboutSectionRow | null;
}

export function StitchIntro({ introSection }: StitchIntroProps) {
    const t = useTranslations('home.intro');

    const title = "Tối Ưu Vận Hành, Minh Bạch Tài Chính Chuỗi";
    const excerpt = introSection?.summary_vi ||
        "Giải pháp kiến tạo nền tảng vững vàng cho sự liên kết và thống nhất dữ liệu giữa các unit member doanh nghiệp. Cho phép authorization truy cập, CMS đa ngôn ngữ, tự động hóa report finance và audit security dữ liệu ở cấp độ cao nhất.";

    return (
        <section className="bg-[#070A0F] py-28 relative overflow-hidden border-y border-white/5">
            {/* Soft Ambient Light Behind Visual */}
            <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-[#00F2FF]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    
                    {/* Visual Side */}
                    <div className="lg:w-1/2 relative">
                        {/* Decorative Outer Ring */}
                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#00F2FF]/20 to-indigo-500/0 rounded-[28px] opacity-60 blur-sm pointer-events-none" />
                        
                        <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_40px_rgba(0,242,255,0.06)] group">
                            {introSection?.image_url ? (
                                <img 
                                    src={introSection.image_url} 
                                    alt={title}
                                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full aspect-[4/3] bg-[#0C121A] flex items-center justify-center">
                                    <ShieldCheck className="w-24 h-24 text-[#00F2FF]/25 animate-pulse" />
                                </div>
                            )}
                        </div>

                        {/* Professional Floating Icons */}
                        <div className="absolute -top-5 -right-5 p-4 bg-[#0A0F15]/95 border border-white/10 hover:border-[#00F2FF]/40 rounded-2xl z-20 hidden md:block shadow-2xl transition-colors duration-300">
                            <BarChart3 className="w-5.5 h-5.5 text-[#00F2FF]" />
                        </div>
                        <div className="absolute -bottom-5 -left-5 p-4 bg-[#0A0F15]/95 border border-white/10 hover:border-[#00F2FF]/40 rounded-2xl z-20 hidden md:block shadow-2xl transition-colors duration-300">
                            <Globe className="w-5.5 h-5.5 text-[#00F2FF]" />
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="lg:w-1/2">
                        <span className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-[#00F2FF]/5 border border-[#00F2FF]/25 text-[#00F2FF] text-[10px] font-bold tracking-wider mb-8 uppercase shadow-[0_0_10px_rgba(0,242,255,0.05)]">
                          📊 HỆ THỐNG QUẢN TRỊ TẬP TRUNG (SAAS MULTI-TENANT)
                        </span>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.12] tracking-tight">
                          {title}
                          <span className="text-[#00F2FF]">.</span>
                        </h2>

                        <div className="space-y-8 mb-12">
                            <p className="text-slate-400 text-lg leading-relaxed font-light">
                                {excerpt}
                            </p>
                            
                            {/* Value Grid with Glassmorphic Design */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] hover:border-[#00F2FF]/30 transition-all duration-300">
                                    <div className="text-[#00F2FF] font-extrabold text-[10px] mb-2 uppercase tracking-widest leading-none">
                                      01. Kiểm Toán Minh Bạch
                                    </div>
                                    <div className="text-white font-extrabold text-base mb-1">
                                      Immutable Audit Trail
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">Bảo vệ tính toàn vẹn dữ liệu.</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] hover:border-[#00F2FF]/30 transition-all duration-300">
                                    <div className="text-[#00F2FF] font-extrabold text-[10px] mb-2 uppercase tracking-widest leading-none">
                                      02. Dashboard Thời Gian Thực
                                    </div>
                                    <div className="text-white font-extrabold text-base mb-1">
                                      Real-time Analytics
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">Theo dõi dữ liệu tức thì.</span>
                                </div>
                            </div>
                        </div>

                        <Link href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}>
                            <button className="group px-10 py-4.5 bg-[#00F2FF] text-black font-extrabold rounded-xl transition-all duration-300 hover:bg-white active:scale-95 shadow-[0_4px_25px_rgba(0,242,255,0.2)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.2)]">
                                <div className="flex items-center gap-2.5 text-xs uppercase tracking-widest">
                                    {t('readMore') || "Tìm Hiểu Add"}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StitchIntro;
