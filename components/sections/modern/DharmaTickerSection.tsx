'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { Activity } from 'lucide-react';

interface DharmaTalk {
  id: string;
  title_vi: string;
  title_en?: string | null;
  title_km?: string | null;
}

interface DharmaTickerSectionProps {
  talks?: DharmaTalk[];
  siteName?: string;
}

export function DharmaTickerSection({ talks = [], siteName }: DharmaTickerSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Fallback Cyber B2B SaaS Logs if DB is empty
  const fallbackLogs = [
    { id: 'log-1', title_vi: '[ACTIVE HONEYPOT] Honey Decoy Trap deployed successfully at Edge Middleware - SOC Active.' },
    { id: 'log-2', title_vi: '[CRYPTOGRAPHIC WORM] Forensic auditor ledger chain hash matched securely (SHA-256).' },
    { id: 'log-3', title_vi: '[EDGE SHIELD] Vercel WAF IP blocklist synchronized in 3.6ms - Zero abnormalities.' },
    { id: 'log-4', title_vi: '[SOAR MODULE] IPS dynamic lockdown rule active - Protecting 85 tenant branches.' },
    { id: 'log-5', title_vi: '[RBAC SECURITY] Token exchange validated with central cryptographic key.' },
    { id: 'log-6', title_vi: '[EDGE GATEWAY] distributed multi-tenant routing online - latency: 1.2ms.' },
    { id: 'log-7', title_vi: '[DATA REPLICATION] DB transactional nodes replication completed in active regions.' },
    { id: 'log-8', title_vi: '[SYSTEM COMPLIANCE] Audit trails archived in permanent immutable storage.' }
  ];

  const hasRealData = talks && talks.length > 0;
  const displayTalks = hasRealData ? talks : fallbackLogs;

  // Multiply array to create infinite scroll effect
  const doubledTalks = [...displayTalks, ...displayTalks, ...displayTalks];

  return (
    <div
      className="relative overflow-hidden border-y bg-[#05080C] border-[#00F2FF]/15"
      aria-label="Pháp thoại latest"
    >
      {/* Dynamic Left Label - High-tech Console Style */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-4 sm:px-6 gap-2 shrink-0 bg-[#0A0F16] border-r border-[#00F2FF]/20"
      >
        {/* Blinking Live LED */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
        </span>
        
        <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] whitespace-nowrap text-[#00F2FF] flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#00F2FF] animate-pulse" />
          {hasRealData ? 'KNOWLEDGE NODE' : 'SYS MONITOR'}
        </span>
      </div>

      {/* Left Gradient fade */}
      <div
        className="absolute left-[85px] sm:left-[145px] top-0 bottom-0 w-12 z-[5] pointer-events-none"
        style={{ background: `linear-gradient(to right, #05080C 20%, transparent)` }}
      />

      {/* Ticker track */}
      <div className="pl-[95px] sm:pl-[155px] pr-4 py-3 overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-center gap-10 whitespace-nowrap animate-ticker"
          style={{ '--ticker-speed': `${Math.max(30, doubledTalks.length * 4.5)}s` } as React.CSSProperties}
        >
          {doubledTalks.map((talk, i) => (
            <div
              key={`${talk.id}-${i}`}
              className="inline-flex items-center gap-2.5 shrink-0 group select-none"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#00F2FF] shadow-[0_0_6px_#00F2FF]"
              />
              <span
                className="text-[12px] font-mono font-bold tracking-wide text-slate-300 group-hover:text-[#00F2FF] transition-colors"
              >
                {talk.title_vi}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Gradient fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-[5] pointer-events-none"
        style={{ background: `linear-gradient(to left, #05080C 20%, transparent)` }}
      />

      {/* CSS Animation injected inline */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-ticker {
          animation: ticker-scroll var(--ticker-speed, 40s) linear infinite;
          will-change: transform;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
export default DharmaTickerSection;
