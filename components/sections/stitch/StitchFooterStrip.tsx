'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Mail, Phone, Server, Send } from 'lucide-react';

interface StitchFooterStripProps {
  settings?: Record<string, string>;
}

export const StitchFooterStrip: React.FC<StitchFooterStripProps> = ({ settings = {} }) => {
  return (
    <section className="py-20 bg-[#05080C] border-t border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Left Info Column */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-slate-500 mb-6">
              CỔNG HỖ TRỢ DOANH NGHIỆP
            </h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center gap-3 text-slate-300 hover:text-[#00F2FF] transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#00F2FF]/40 flex items-center justify-center transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Đường dây nóng: {settings['contact_phone'] || '+84 28 1234 5678'}</span>
              </div>
              
              <div className="flex items-center gap-3 text-slate-300 hover:text-[#00F2FF] transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#00F2FF]/40 flex items-center justify-center transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Hộp thư: {settings['contact_email'] || 'support@saas-central.com'}</span>
              </div>
            </div>
          </div>

          {/* Middle Status Column */}
          <div className="flex flex-col items-center justify-center p-8 border border-white/[0.04] bg-white/[0.005] rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-white italic">Hệ Thống Trực Tuyến</span>
              </div>
              <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest leading-relaxed">
                TỐI ƯU PHÂN PHỐI NỘI DUNG QUA VERCEL EDGE<br/>
                & BẢO MẬT CÔ LẬP ĐA KHÁCH HÀNG (TENANT ISOLATION)
              </p>
          </div>

          {/* Right Action Column */}
          <div className="flex flex-col md:items-end gap-6">
            <div className="flex gap-3">
              {['FB', 'YT', 'LN'].map(social => (
                <div 
                  key={social} 
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-[10px] font-extrabold text-slate-400 hover:text-[#00F2FF] hover:border-[#00F2FF] hover:bg-[#00F2FF]/5 transition-all duration-300 cursor-pointer rounded-xl"
                >
                  {social}
                </div>
              ))}
            </div>
            
            <Link 
              href="/lien-he"
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#00F2FF] hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all duration-300 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              Submit Yêu Cầu Khhidden Cấp
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};
