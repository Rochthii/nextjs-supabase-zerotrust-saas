'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { CalendarRange, ArrowUpRight, MapPin, Activity } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  location?: string;
}

interface StitchEventsProps {
  upcomingEvents?: EventItem[];
  title?: string;
}

export const StitchEvents: React.FC<StitchEventsProps> = ({
  upcomingEvents = [],
  title = "Lịch Trình Sự Kiện & Hoạt ĐỘng Doanh Nghiệp"
}) => {
  // Fallback B2B Enterprise Events if DB is empty
  const defaultEvents: EventItem[] = [
    {
      id: 'event-fall-1',
      title: 'Đại Hội Cổ Đông Thường Niên & Báo Cáo Tài Chính Quý II',
      slug: 'dai-hoi-co-dong-quyet-toan-quy-2',
      start_date: new Date().toISOString(),
      location: 'Trụ sở chính & Zoom Endpoint'
    },
    {
      id: 'event-fall-2',
      title: 'Kiểm Toán Bảo Mật An Ninh Hệ Thống & Chứng Nhận SOC2',
      slug: 'kiem-toan-security-soc2-dat-chuan',
      start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      location: 'Trung Tâm An Ninh SOC Trung Ương'
    },
    {
      id: 'event-fall-3',
      title: 'Hội Thảo Ra Mắt Phân Hệ Edge Gateway & Decentralized DB v2.0',
      slug: 'hoi-thao-edge-gateway-decentralized-db',
      start_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      location: 'Nexus Cloud Auditorium'
    }
  ];

  const displayEvents = upcomingEvents.length > 0 
    ? upcomingEvents.slice(0, 4) 
    : defaultEvents;

  return (
    <section className="py-28 bg-[#070A0F] relative overflow-hidden border-t border-white/5">
      {/* Soft Ambient Light Bottom Left */}
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Title Bar with Pulse Ring */}
        <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4.5">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F2FF] shadow-[0_0_10px_#00F2FF]"></span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white">
              {title}
            </h2>
          </div>
          
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded text-[9px] font-mono font-extrabold tracking-wider bg-white/5 text-[#00F2FF] border border-white/5">
            <Activity className="w-3 h-3 text-[#00F2FF] animate-pulse" />
            LIVE PIPELINE
          </span>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-4">
          {displayEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group relative"
            >
              <Link href={`/lich-le/${event.slug || event.id}`} className="block">
                {/* Row Outer Glow Container */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-[#00F2FF]/30 transition-all duration-300 rounded-2xl gap-6">
                  
                  <div className="flex items-center gap-6">
                    {/* Date Badge with glowing violet border */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 border border-white/10 rounded-xl bg-[#0F1622] group-hover:border-[#00F2FF]/40 group-hover:bg-[#00F2FF]/5 transition-all duration-300">
                      <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest mb-1 leading-none">THÁNG</span>
                      <span className="text-xl font-black text-white group-hover:text-[#00F2FF] transition-colors duration-300 tabular-nums leading-none">
                        {new Date(event.start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3">
                        {/* Live blinking LED */}
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                        </span>
                        
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#00F2FF] transition-colors duration-300 leading-tight">
                          {event.title}
                        </h3>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3 flex items-center gap-1.5 leading-none">
                        <MapPin className="w-3.5 h-3.5 text-[#00F2FF]/60" />
                        {event.location || 'Hệ Thống Trung Ương'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end sm:justify-center gap-4">
                    <div className="px-3.5 py-2 bg-white/5 text-[9px] font-black tracking-widest uppercase rounded-lg border border-white/10 text-slate-400 group-hover:text-white group-hover:bg-[#00F2FF]/5 group-hover:border-[#00F2FF]/20 transition-all">
                      HOẠT ĐỘNG
                    </div>
                    <div className="w-10 h-10 border border-white/10 group-hover:border-[#00F2FF]/40 group-hover:bg-[#00F2FF]/5 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1 shadow-inner">
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#00F2FF] transition-colors" />
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
            <Link 
              href="/lich-le"
              className="inline-flex items-center gap-2.5 px-10 py-4 text-[10px] font-extrabold tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-full transition-all duration-300 shadow-xl backdrop-blur-sm"
            >
              <CalendarRange className="w-4 h-4" />
              View Lịch Trình Chi Tiết
            </Link>
        </div>
      </div>
    </section>
  );
};

export default StitchEvents;
