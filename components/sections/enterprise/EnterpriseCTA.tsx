'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

export function EnterpriseCTA({ data }: { data?: BlockConfig }) {
    return (
        <section className="py-24 bg-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            <div className="container px-4 mx-auto max-w-4xl relative z-10 text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight"
                >
                    Sẵn sàng chuyển đổi số cùng system của chúng tôi?
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
                >
                    Triển khai nhanh chóng, security tuyệt đối, và tối ưu hóa performance làm việc cho organization của bạn ngay today.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/lien-he" className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold transition-colors shadow-xl flex items-center justify-center gap-2 group">
                        Contact tư vấn
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

export default EnterpriseCTA;
