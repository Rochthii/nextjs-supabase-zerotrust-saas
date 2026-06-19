'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Network, Fingerprint, LayoutDashboard, Globe } from 'lucide-react';

const FEATURES = [
    {
        title: 'Security Cấp Enterprise',
        description: 'Tích hợp validate đa yếu tố, authorization chặt chẽ RBAC, và mã hóa dữ liệu đầu cuối. Đạt standard ISO 27001.',
        icon: Fingerprint,
        colSpan: 'md:col-span-2 lg:col-span-2',
        rowSpan: 'row-span-1',
        bg: 'bg-white/[0.01]',
        border: 'border-white/[0.04]',
        glow: 'group-hover:border-blue-500/40 group-hover:bg-blue-500/[0.02]'
    },
    {
        title: 'Mạng lưới Đa branch',
        description: 'Quản lý centralized hàng trăm branch, tối ưu hóa nguồn lực và dòng thông tin thông suốt.',
        icon: Network,
        colSpan: 'md:col-span-1 lg:col-span-1',
        rowSpan: 'row-span-1',
        bg: 'bg-white/[0.01]',
        border: 'border-white/[0.04]',
        glow: 'group-hover:border-blue-500/40 group-hover:bg-blue-500/[0.02]'
    },
    {
        title: 'Dashboard Thông minh',
        description: 'Report time thực, analytics chuyên sâu với interface trực quan.',
        icon: LayoutDashboard,
        colSpan: 'md:col-span-1 lg:col-span-1',
        rowSpan: 'row-span-1',
        bg: 'bg-white/[0.01]',
        border: 'border-white/[0.04]',
        glow: 'group-hover:border-blue-500/40 group-hover:bg-blue-500/[0.02]'
    },
    {
        title: 'Hạ tầng Toàn cầu',
        description: 'Triển khai trên Edge Network, mang lại tốc độ load siêu tốc bất kể user ở đâu.',
        icon: Globe,
        colSpan: 'md:col-span-2 lg:col-span-2',
        rowSpan: 'row-span-1',
        bg: 'bg-white/[0.01]',
        border: 'border-white/[0.04]',
        glow: 'group-hover:border-blue-500/40 group-hover:bg-blue-500/[0.02]'
    },
];

export function EnterpriseFeatures({ data }: { data?: BlockConfig }) {
    return (
        <section className="py-28 bg-[#05080E] relative overflow-hidden">
            {/* Fine Tech Grid Background */}
            <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" 
                style={{ 
                    backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px' 
                }} 
            />

            {/* Ambient Lighting Background */}
            <div className="absolute top-1/3 left-1/3 w-[800px] h-[400px] bg-blue-500/3 blur-[140px] rounded-full pointer-events-none" />
            
            <div className="container px-6 mx-auto max-w-6xl relative z-10">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight"
                    >
                        Được thiết kế cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-300">Quy mô lớn</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 font-light leading-relaxed text-sm md:text-base"
                    >
                        Cung cấp complete các tính năng mạnh mẽ để organization của bạn vận hành trơn tru và phát triển bền vững trên môi trường số.
                    </motion.p>
                </div>

                {/* Mosaic Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                className={`group p-8 md:p-10 rounded-[2rem] border backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 shadow-2xl relative overflow-hidden ${feat.colSpan} ${feat.rowSpan} ${feat.bg} ${feat.border} ${feat.glow}`}
                            >
                                {/* Glowing backdrop on hover */}
                                <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none" />

                                <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-lg">
                                    <Icon className="w-5.5 h-5.5 text-blue-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                                
                                <h3 className="text-2xl font-extrabold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300 leading-snug">{feat.title}</h3>
                                
                                <p className="text-slate-400 leading-relaxed font-light text-sm">
                                    {feat.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default EnterpriseFeatures;
