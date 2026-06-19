'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Cpu, Terminal, ArrowRight } from 'lucide-react';

interface ModernMoonCTAProps {
  modulesConfig?: Record<string, boolean>;
}

export function ModernMoonCTA({ modulesConfig }: ModernMoonCTAProps) {
  // If transaction module is disabled, we still show the SaaS CTA as it's the main homepage anchor
  return (
    <section className="py-28 bg-[#05080C] border-t border-white/5 relative overflow-hidden flex items-center justify-center">
      
      {/* 1. Large Glowing Neon Cyan Moon/Aura in the center background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] sm:w-[600px] sm:h-[600px] rounded-full opacity-[0.04] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #00F2FF 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />
      
      {/* Dynamic Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #00F2FF 1px, transparent 1px), linear-gradient(to bottom, #00F2FF 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
        
        {/* Simplified High-tech Cyber Circle Icon */}
        <div className="relative inline-flex items-center justify-center mb-10 group">
          
          {/* Inner Glowing rings */}
          <div className="absolute inset-0 rounded-full border border-[#00F2FF]/10 scale-125 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 rounded-full border border-dashed border-[#00F2FF]/30 animate-spin" style={{ animationDuration: '25s' }} />
          
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border border-white/10 bg-[#0A1017] group-hover:border-[#00F2FF]/40 transition-colors duration-500 shadow-2xl relative"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center bg-[#00F2FF]/5 border border-[#00F2FF]/10 group-hover:bg-[#00F2FF]/10 transition-colors duration-500"
            >
              <ShieldCheck className="w-8 h-8 text-[#00F2FF] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Console Pill */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00F2FF]/5 border border-[#00F2FF]/20 text-[#00F2FF] text-[9px] font-mono font-extrabold tracking-widest uppercase">
            <Cpu className="w-3 h-3 text-[#00F2FF]" />
            SOAR CORE ENGINE ACTIVE
          </span>
        </div>

        {/* Title with Gradient and Cyberpunk Text */}
        <h2 className="text-3xl sm:text-5xl font-black leading-tight text-white mb-6 uppercase tracking-tight">
          Sẵn Sàng Chuyển Đổi Số
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FF] to-indigo-400">
            Nâng Tầm Bảo Mật SaaS
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light max-w-2xl mx-auto leading-relaxed mb-12">
          Trải nghiệm system quản trị SaaS đa branch với khả năng audit mã hóa bất biến WORM, cô lập rủi ro tự động tại Edge Middleware và quản lý authorization Granular RBAC API chặt chẽ.
        </p>

        {/* Modern Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
          <Link
            href="/admin"
            className="group w-full sm:w-auto px-10 py-4 bg-[#00F2FF] text-black font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_4px_25px_rgba(0,242,255,0.25)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            Trải Nghiệm Dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="/documents"
            className="w-full sm:w-auto px-10 py-4 border border-white/10 text-white hover:text-[#00F2FF] font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-white/5 hover:border-[#00F2FF]/30 transition-all duration-300 backdrop-blur-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-slate-500 group-hover:text-[#00F2FF] transition-colors" />
            Tài Liệu Kỹ Thuật
          </Link>
        </div>

      </div>
    </section>
  );
}

export default ModernMoonCTA;
