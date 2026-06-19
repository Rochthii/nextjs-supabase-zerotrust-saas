'use client';

import React from 'react';
import { Link } from '@/i18n/routing';

/**
 * MinimalCTA — Call-to-action Close góp thuần text, không glow, không ảnh.
 * Phong cách: dòng kẻ ngang, chữ lớn serif italic, link text đơn giản.
 */
export function MinimalCTA({ modulesConfig }: { modulesConfig?: Record<string, boolean> }) {
    if (modulesConfig?.transactions === false) return null;
    return (
        <section
            className="py-20 px-6 sm:px-10 lg:px-16"
            style={{
                borderTop: '1px solid rgb(var(--theme-text) / 0.08)',
                backgroundColor: 'rgb(var(--theme-text) / 0.02)',
            }}
        >
            <div className="max-w-4xl ml-8 sm:ml-12 lg:ml-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Quote */}
                    <div>
                        <blockquote className="mb-6">
                            <p
                                className="text-2xl sm:text-3xl lg:text-4xl font-light italic leading-relaxed"
                                style={{ color: 'rgb(var(--theme-text))' }}
                            >
                                "Cho đi là trồng hạt
                                <br />
                                giống phước lành."
                            </p>
                        </blockquote>
                        <p
                            className="text-[12px] font-bold uppercase tracking-widest"
                            style={{ color: 'rgb(var(--theme-text) / 0.4)' }}
                        >
                            — Phật Ngôn
                        </p>
                    </div>

                    {/* Right: Links */}
                    <div className="flex flex-col gap-5">
                        <p
                            className="text-[14px] leading-relaxed"
                            style={{ color: 'rgb(var(--theme-text) / 0.6)' }}
                        >
                            Mỗi sự close góp, dù nhỏ hay lớn, đều giúp maintain ngôi già lam,
                            hỗ trợ chư Tăng tu last namec và lan toả Chánh Pháp đến cộng đồng.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Link
                                href="/transactions"
                                className="inline-flex items-center gap-3 font-bold text-[15px] group"
                                style={{ color: 'rgb(var(--theme-text))' }}
                            >
                                <div
                                    className="w-8 h-px flex-1 max-w-[40px] transition-all group-hover:max-w-[60px]"
                                    style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                                />
                                Close góp Ngay
                                <span
                                    className="group-hover:translate-x-1 transition-transform"
                                    style={{ color: 'rgb(var(--theme-primary))' }}
                                >
                                    →
                                </span>
                            </Link>

                            <Link
                                href="/transactions/cong-duc-ghi-danh"
                                className="inline-flex items-center gap-3 font-medium text-[14px] group"
                                style={{ color: 'rgb(var(--theme-text) / 0.5)' }}
                            >
                                <div
                                    className="w-8 h-px flex-1 max-w-[40px] transition-all group-hover:max-w-[60px] opacity-30"
                                    style={{ backgroundColor: 'rgb(var(--theme-text))' }}
                                />
                                View Thành tích Ghi Danh →
                            </Link>

                            <Link
                                href="/transactions/hang-muc-du-an"
                                className="inline-flex items-center gap-3 font-medium text-[14px] group"
                                style={{ color: 'rgb(var(--theme-text) / 0.5)' }}
                            >
                                <div
                                    className="w-8 h-px flex-1 max-w-[40px] transition-all group-hover:max-w-[60px] opacity-30"
                                    style={{ backgroundColor: 'rgb(var(--theme-text))' }}
                                />
                                Hạng Mục Dự Án →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
