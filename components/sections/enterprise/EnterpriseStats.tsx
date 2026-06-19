'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Users, Database, Shield, Zap } from 'lucide-react';

const STATS = [
    { label: 'User tích cực', value: '10,000+', icon: Users },
    { label: 'Dữ liệu được process', value: '500 TB', icon: Database },
    { label: 'Time Uptime', value: '99.99%', icon: Zap },
    { label: 'Tuân thủ security', value: 'ISO 27001', icon: Shield },
];

export function EnterpriseStats({ data }: { data?: BlockConfig }) {
    return (
        <section className="py-20 bg-[#05080E] relative border-t border-white/5 overflow-hidden">
            {/* Ambient Lighting Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-6 mx-auto max-w-6xl relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                className="group relative"
                            >
                                {/* Glow backdrop on hover */}
                                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none" />

                                {/* Glass Card Container */}
                                <div className="relative h-full p-8 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] hover:border-blue-500/40 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.02] border border-white/10 text-blue-400 group-hover:text-white group-hover:bg-blue-600 transition-all duration-300 mb-6 shadow-inner">
                                        <Icon className="w-5.5 h-5.5" />
                                    </div>
                                    
                                    <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2.5 tracking-tight group-hover:text-blue-400 transition-colors duration-300">
                                        {stat.value}
                                    </h3>
                                    
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-none">
                                        {stat.label}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default EnterpriseStats;
