'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, ArrowUpRight } from 'lucide-react';

export function EnterpriseNews({ data }: { data?: BlockConfig }) {
    // For demo purposes, we can render placeholders or map through `data.news` if it existed.
    const news = [
        {
            id: 1,
            title: 'Phát hành version 2.0 với kiến trúc Microservices',
            date: '20 Month 5, 2026',
            category: 'Product Update',
            href: '/tin-tuc/release-2-0'
        },
        {
            id: 2,
            title: 'Đạt chứng nhận security quốc tế ISO 27001',
            date: '15 Month 5, 2026',
            category: 'Company News',
            href: '/tin-tuc/iso-27001'
        },
        {
            id: 3,
            title: 'Open rộng đối tác chiến lược tại khu vực Đông Nam Á',
            date: '02 Month 5, 2026',
            category: 'Partnership',
            href: '/tin-tuc/sea-partnership'
        }
    ];

    return (
        <section className="py-24 bg-slate-900 border-t border-slate-800">
            <div className="container px-4 mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">News & Report</h2>
                        <p className="text-slate-400 text-lg">Update những thông tin latest từ system và organization.</p>
                    </div>
                    <Link href="/tin-tuc" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors group">
                        View all bản tin
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {news.map((item, idx) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Link href={item.href} className="block group h-full p-8 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-500/20">
                                        {item.category}
                                    </span>
                                    <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-auto pt-4 border-t border-slate-700/50">
                                    <Calendar className="w-4 h-4" />
                                    {item.date}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default EnterpriseNews;
