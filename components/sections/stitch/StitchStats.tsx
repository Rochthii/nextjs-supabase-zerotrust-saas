'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Activity, Cpu, Layers } from 'lucide-react';

interface StitchStatsProps {
  stats?: {
    label: string;
    value: string | number;
    suffix?: string;
    icon?: React.ComponentType<any>;
  }[];
}

export const StitchStats: React.FC<StitchStatsProps> = ({ stats }) => {
  const defaultStats = [
    { label: "Chi Nhánh Hoạt Động", value: "85", suffix: "+", icon: Globe },
    { label: "Giao Dịch Đã Kiểm Toán", value: "124,200", suffix: "", icon: Activity },
    { label: "Độ Trễ Phân Tích (Edge)", value: "3.6", suffix: "ms", icon: Cpu },
    { label: "Thời Gian Hoạt Động (SLA)", value: "99.99", suffix: "%", icon: Layers },
  ];

  const displayStats = stats || defaultStats;

  return (
    <section className="py-20 bg-[#070A0F] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat, idx) => {
            const StatIcon = stat.icon || Cpu;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative"
              >
                {/* Glowing Background Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00F2FF]/5 to-[#a855f7]/5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none" />

                {/* Glassmorphic Card Container */}
                <div className="relative h-full p-8 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-[#00F2FF]/40 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    {/* Top line with title and high-tech icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="block text-[10px] font-extrabold tracking-[0.25em] uppercase text-slate-400 group-hover:text-[#00F2FF] transition-colors duration-300 leading-none">
                        {stat.label}
                      </span>
                      
                      <div className="p-2 bg-white/[0.02] border border-white/5 rounded-lg group-hover:border-[#00F2FF]/20 group-hover:bg-[#00F2FF]/5 transition-colors duration-300">
                        <StatIcon className="w-4 h-4 text-slate-500 group-hover:text-[#00F2FF] transition-colors duration-300" />
                      </div>
                    </div>
                    
                    {/* Value with gradient text */}
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl md:text-5xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00F2FF] group-hover:to-[#a855f7] transition-all duration-300 tabular-nums">
                        {stat.value}
                      </span>
                      {stat.suffix && (
                        <span className="text-xl font-bold text-[#00F2FF]/70 tracking-tight group-hover:text-[#a855f7] transition-colors">
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Micro tech accent at the card's bottom */}
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-white/10 group-hover:bg-[#00F2FF] rounded-full transition-colors duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Decorative Grid Separator */}
        <div className="mt-20 h-[1px] w-full bg-white/5 relative">
          <div className="absolute top-0 left-1/3 w-32 h-[1px] bg-[#00F2FF]/50" />
          <div className="absolute top-0 right-1/3 w-32 h-[1px] bg-indigo-500/30" />
        </div>
      </div>
    </section>
  );
};

export default StitchStats;
