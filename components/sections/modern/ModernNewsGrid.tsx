'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

interface NewsItem {
    id: string;
    slug: string;
    title_vi: string;
    excerpt_vi?: string | null;
    thumbnail_url?: string | null;
    published_at?: string | null;
    category?: { name_vi: string; slug: string } | null;
}

interface ModernNewsGridProps {
    news: NewsItem[];
    locale?: string;
    isCompany?: boolean;
}

export function ModernNewsGrid({ news = [], locale = 'vi', isCompany = true }: ModernNewsGridProps) {
    if (!news || news.length === 0) return null;

    const [main, ...rest] = news;
    const sideItems = rest.slice(0, 4);

    return (
        <section className="py-28 bg-[#05080C] px-6 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#a855f7]/3 blur-[140px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#00F2FF]/3 blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FF] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F2FF] shadow-[0_0_8px_#00F2FF]"></span>
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase">
                            {isCompany ? 'Bản Tin & Sự Kiện Vận Hành' : 'Tin Tức Mới Nhất'}
                        </h2>
                    </div>
                    
                    <Link
                        href="/tin-tuc"
                        className="text-[10px] font-extrabold tracking-widest uppercase text-[#00F2FF] hover:bg-[#00F2FF]/10 px-6 py-3 border border-[#00F2FF]/30 hover:border-[#00F2FF]/80 rounded-xl transition-all duration-300 backdrop-blur-sm flex items-center gap-1.5"
                    >
                        View all
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    
                    {/* Bài lớn bên trái */}
                    <Link
                        href={`/tin-tuc/${main.slug}`}
                        className="group relative rounded-2xl overflow-hidden bg-white/[0.01] hover:bg-white/[0.02] border border-[#00F2FF]/20 hover:border-[#00F2FF]/60 transition-all duration-500 shadow-3xl block w-full flex flex-col justify-between"
                        style={{
                            minHeight: 'clamp(320px, 50vh, 460px)',
                        }}
                    >
                        {main.thumbnail_url ? (
                            <Image
                                src={main.thumbnail_url}
                                alt={main.title_vi}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                unoptimized
                            />
                        ) : (
                            <div className="absolute inset-0 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#00F2FF]/10 via-[#05080C] to-indigo-950/20" />
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <Newspaper className="w-16 h-16 text-[#00F2FF]/20 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            </div>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
                            {main.category && (
                                <span
                                    className="inline-block text-[8px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 bg-[#00F2FF]/5 border border-[#00F2FF]/30 rounded-md mb-4 text-[#00F2FF]"
                                >
                                    {main.category.name_vi}
                                </span>
                            )}
                            
                            <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-snug mb-3 line-clamp-3 group-hover:text-[#00F2FF] transition-colors break-words">
                                {main.title_vi}
                            </h3>
                            
                            {main.excerpt_vi && (
                                <p className="text-xs sm:text-sm text-slate-400 font-light line-clamp-2 leading-relaxed mb-4">{main.excerpt_vi}</p>
                            )}
                            
                            {main.published_at && (
                                <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-4">
                                    <Calendar className="w-3.5 h-3.5 text-[#00F2FF]/60" />
                                    {new Date(main.published_at).toLocaleDateString('vi-VN')}
                                </p>
                            )}
                        </div>

                        {/* Glowing bottom line sliding up */}
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00F2FF] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-30" />
                    </Link>

                    {/* 4 bài nhỏ bên phải */}
                    <div className="flex flex-col gap-4">
                        {sideItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/tin-tuc/${item.slug}`}
                                className="group flex gap-4 p-4 rounded-xl transition-all duration-300 w-full overflow-hidden bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-[#a855f7]/40 relative"
                            >
                                {/* Thumbnail nhỏ */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-[#0C121A] border border-white/5 flex items-center justify-center">
                                    {item.thumbnail_url ? (
                                        <Image
                                            src={item.thumbnail_url}
                                            alt={item.title_vi}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="100px"
                                            unoptimized
                                        />
                                    ) : (
                                        <Newspaper className="w-6 h-6 text-slate-600 group-hover:text-[#a855f7] transition-colors" />
                                    )}
                                </div>

                                {/* Text content */}
                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                    {item.category && (
                                        <span
                                            className="text-[8px] font-mono font-extrabold uppercase tracking-widest mb-1 text-[#a855f7]"
                                        >
                                            {item.category.name_vi}
                                        </span>
                                    )}
                                    <h4
                                        className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug mb-2 text-white group-hover:text-[#a855f7] transition-colors break-words"
                                    >
                                        {item.title_vi}
                                    </h4>
                                    {item.published_at && (
                                        <p
                                            className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-1"
                                        >
                                            <Calendar className="w-3 h-3 text-[#a855f7]/60" />
                                            {new Date(item.published_at).toLocaleDateString('vi-VN')}
                                        </p>
                                    )}
                                </div>

                                {/* Glowing highlight on active card */}
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#a855f7] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}

export default ModernNewsGrid;
