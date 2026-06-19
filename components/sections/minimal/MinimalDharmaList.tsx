'use client';

import React from 'react';
import { Link } from '@/i18n/routing';

interface DharmaTalk {
    id: string;
    slug?: string | null;
    title_vi: string;
    speaker_name?: string | null;
    duration?: string | null;
    youtube_url?: string | null;
    video_url?: string | null;
    thumbnail_url?: string | null;
}

interface MinimalDharmaListProps {
    talks?: DharmaTalk[];
    isCompany?: boolean;
}

/**
 * MinimalDharmaList — Pháp Thoại dạng list text thuần, không ảnh.
 * Phong cách tối giản: mỗi pháp thoại là 1 dòng với icon play nhỏ.
 */
export function MinimalDharmaList({ talks = [], isCompany }: MinimalDharmaListProps) {
    if (!talks || talks.length === 0) return null;

    const handlePlay = (talk: DharmaTalk) => {
        const url = talk.youtube_url || talk.video_url;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <section
            className="py-16 px-6 sm:px-10 lg:px-16 overflow-hidden"
            style={{ borderTop: '1px solid rgb(var(--theme-text) / 0.08)' }}
        >
            <div className="max-w-4xl ml-8 sm:ml-12 lg:ml-16">
                {/* Label */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1 h-5" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgb(var(--theme-text) / 0.5)' }}>
                        {isCompany ? 'Bài đào create nhất' : 'Pháp Thoại Gần Đây'}
                    </h2>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.08)' }} />
                    <Link href="/documents" className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'rgb(var(--theme-primary))' }}>
                        All →
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    {talks.slice(0, 6).map((talk, i) => (
                        <button
                            key={talk.id}
                            onClick={() => handlePlay(talk)}
                            className="group flex items-center gap-4 py-5 text-left transition-all"
                            style={{
                                borderBottom: '1px solid rgb(var(--theme-text) / 0.06)',
                                borderRight: i % 2 === 0 ? '1px solid rgb(var(--theme-text) / 0.06)' : 'none',
                                paddingRight: i % 2 === 0 ? '2rem' : '0',
                                paddingLeft: i % 2 === 1 ? '2rem' : '0',
                            }}
                        >
                            {/* Play circle */}
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                                style={{
                                    backgroundColor: 'rgb(var(--theme-primary) / 0.12)',
                                    border: '1px solid rgb(var(--theme-primary) / 0.25)',
                                }}
                            >
                                <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgb(var(--theme-primary))' }}>
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>

                            {/* Text */}
                            <div className="min-w-0 flex-1">
                                <p
                                    className="text-[14px] font-medium line-clamp-2 leading-snug group-hover:opacity-60 transition-opacity"
                                    style={{ color: 'rgb(var(--theme-text))' }}
                                >
                                    {talk.title_vi}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    {talk.speaker_name && (
                                        <span className="text-[11px]" style={{ color: 'rgb(var(--theme-text) / 0.4)' }}>
                                            {talk.speaker_name}
                                        </span>
                                    )}
                                    {talk.duration && (
                                        <span className="text-[11px] font-mono" style={{ color: 'rgb(var(--theme-text) / 0.3)' }}>
                                            {talk.duration}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
