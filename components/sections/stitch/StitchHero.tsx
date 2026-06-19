'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Cpu, Terminal, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface StitchHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const StitchHero: React.FC<StitchHeroProps> = ({
  title = "Hệ Thống Quản Trị SaaS Đa Khách Hàng",
  description = "Xây dựng system quản trị trung ương centralized cho hàng chục branch và unit member doanh nghiệp. Tích hợp website động, CMS đa ngôn ngữ, system audit finance minh bạch và dashboard analytics time thực.",
  ctaText = "Khám Phá Phân Hệ",
  ctaLink = "#nodes"
}) => {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs'>('metrics');

  // Simulate real-time SOC cyber audit logs for high-tech aesthetics
  useEffect(() => {
    const rawLogs = [
      'SYS: Initializing cryptographic ledger audit...',
      'SEC: WORM ledger integrity verified successfully.',
      'NET: Sync completed with Branch Alpha (ping: 3.6ms).',
      'SOC: Real-time traffic analysis active.',
      'API: Authorization JWT token verified.',
      'SYS: Automated database replication triggered.',
      'SEC: Edge lockdown rules synchronized with Vercel.',
      'SOC: Zero anomalies detected in active sessions.'
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      setConsoleLogs((prev) => {
        const nextLog = `[${new Date().toLocaleTimeString()}] ${rawLogs[currentIdx]}`;
        currentIdx = (currentIdx + 1) % rawLogs.length;
        return [nextLog, ...prev.slice(0, 4)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden bg-[#070A0F] text-white">
      
      {/* 1. Fine Tech Grid Background with 3D perspective effect */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #00F2FF 1px, transparent 1px),
            linear-gradient(to bottom, #00F2FF 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 85%)'
        }} 
      />

      {/* Decorative aurora glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#00F2FF]/10 to-indigo-600/0 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/5 to-[#00F2FF]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* 2. Main Content */}
      <div className="container relative z-10 mx-auto px-6 text-center max-w-6xl flex flex-col items-center">
        
        {/* Title & Actions Content block */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Tag Pill with Glow */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[11px] font-bold tracking-[0.25em] uppercase border border-[#00F2FF]/20 text-[#00F2FF] bg-[#00F2FF]/5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,242,255,0.08)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FF] animate-pulse" />
            Nexus Enterprise SaaS Multi-Tenant Protocol
          </span>

          {/* Title with Gradient Text */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-[#a3f3ff] drop-shadow-2xl uppercase">
            {title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto mb-24">
            <a
              href={ctaLink}
              className="group w-full sm:w-auto px-10 py-4 bg-[#00F2FF] text-black font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_4px_30px_rgba(0,242,255,0.2)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            
            <a
              href="/admin"
              className="w-full sm:w-auto px-10 py-4 border border-white/10 text-white hover:text-[#00F2FF] font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-white/5 hover:border-[#00F2FF]/30 transition-all duration-300 backdrop-blur-sm active:scale-95"
            >
              Kiểm Toán Hệ Thống
            </a>
          </div>
        </motion.div>

        {/* 3. Tech Dashboard Mockup (WOW component) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-5xl bg-[#090F16]/60 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,242,255,0.05)] overflow-hidden backdrop-blur-md relative"
        >
          {/* Top Bar Accent */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F2FF] to-transparent opacity-50" />

          {/* Windows-like Title bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#05090E]/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] font-mono font-extrabold text-slate-500 tracking-widest uppercase ml-4">
                NEXUS-SAAS-CONTROL-CENTER.SYS
              </span>
            </div>
            
            <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
              <button 
                onClick={() => setActiveTab('metrics')}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${activeTab === 'metrics' ? 'bg-[#00F2FF] text-black' : 'text-slate-400 hover:text-white'}`}
              >
                Chỉ số Edge
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${activeTab === 'logs' ? 'bg-[#00F2FF] text-black' : 'text-slate-400 hover:text-white'}`}
              >
                Nhật Ký SOC
              </button>
            </div>
          </div>

          {/* Content Pane */}
          <div className="p-6 sm:p-8 min-h-[260px] bg-[#05080D]/90">
            {activeTab === 'metrics' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Transaction Flow Graph Mockup */}
                <div className="md:col-span-2 p-5 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">
                      Save lượng Transaction Finance (24h)
                    </span>
                    <span className="text-xs font-bold text-[#10b981] flex items-center gap-1">
                      +14.2% <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  
                  {/* Real SVG Chart line */}
                  <div className="h-32 w-full my-2">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="gradient-line" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00F2FF" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#00F2FF" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area */}
                      <path
                        d="M 0 30 L 0 25 Q 15 15, 30 20 T 60 10 T 80 5 L 100 2 L 100 30 Z"
                        fill="url(#gradient-line)"
                      />
                      {/* Grid Lines */}
                      <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                      {/* Curve */}
                      <path
                        d="M 0 25 Q 15 15, 30 20 T 60 10 T 80 5 L 100 2"
                        fill="none"
                        stroke="#00F2FF"
                        strokeWidth="1.2"
                        className="animate-pulse"
                      />
                      {/* End point dot */}
                      <circle cx="100" cy="2" r="1.5" fill="#00F2FF">
                        <animate attributeName="r" values="1.2;2;1.2" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest pt-3 border-t border-white/5">
                    <span>00:00</span>
                    <span>08:00</span>
                    <span>16:00</span>
                    <span>NOW</span>
                  </div>
                </div>

                {/* 2. Security Engine Mockup */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between items-center text-center">
                  <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 mb-4 block w-full text-left">
                    Status Security
                  </span>
                  
                  <div className="relative w-28 h-28 my-2 flex items-center justify-center">
                    {/* Glowing circular tracks */}
                    <div className="absolute inset-0 rounded-full border border-[#00F2FF]/10" />
                    <div className="absolute inset-2 rounded-full border border-dashed border-[#00F2FF]/20 animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute inset-4 rounded-full border border-white/5" />
                    
                    <Cpu className="w-8 h-8 text-[#00F2FF] animate-pulse" />
                  </div>
                  
                  <div className="w-full pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-xs text-[#00F2FF] font-extrabold uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    99.99% UPTIME SLA
                  </div>
                </div>

              </div>
            ) : (
              // 3. Real-time SOC Console logs view
              <div className="bg-[#04060A] border border-white/5 rounded-xl p-5 font-mono text-[10px] sm:text-xs text-slate-400 min-h-[190px] flex flex-col justify-between">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2 text-[#00F2FF] font-bold border-b border-white/5 pb-2 mb-2">
                    <Terminal className="w-4 h-4" />
                    ACTIVE DECOY TRAP MONITOR & SOAR CONTROLLER
                  </div>
                  
                  {consoleLogs.length > 0 ? (
                    consoleLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`truncate tracking-wide ${idx === 0 ? 'text-white border-l-2 border-[#00F2FF] pl-2 font-bold' : ''}`}
                      >
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 italic">Quét database logs...</div>
                  )}
                </div>
                
                <div className="text-[9px] text-slate-500 uppercase tracking-widest border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>SOCKET: ESTABLISHED</span>
                  <span className="animate-pulse">● FEED SECURED</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom fade out to next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#070A0F] to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default StitchHero;
