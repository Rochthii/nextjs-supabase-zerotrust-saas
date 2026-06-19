'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { BookOpen, ShieldAlert, Network, LineChart, Database, Globe, Cpu, ChevronRight } from 'lucide-react';

interface DharmaNode {
  id: string;
  title: string;
  slug: string;
  category?: string;
  thumbnail?: string;
  icon?: React.ComponentType<any>;
  description?: string;
}

interface StitchNodesProps {
  dharmaTalks?: DharmaNode[];
  title?: string;
}

export const StitchNodes: React.FC<StitchNodesProps> = ({
  dharmaTalks = [],
  title = "Các Phân Hệ Quản Trị & Tư Liệu Số"
}) => {
  // 6 Phân Hệ Doanh Nghiệp B2B SaaS Mặc Định Cực Kỳ Cao Cấp (Fallback)
  const defaultNodes: DharmaNode[] = [
    {
      id: 'SEC-WORM-8A7F',
      title: 'Kiểm Toán Tài Chính Sổ Cái (Forensic WORM Auditor)',
      slug: 'forensic-worm-auditor',
      category: 'Bảo Mật',
      icon: ShieldAlert,
      description: 'Save trữ log bất biến chống chỉnh edit (WORM). Tích hợp thuật toán đối sánh mã băm chuỗi block SHA-256 động tự động phát hiện xâm nhập.'
    },
    {
      id: 'SYS-NODE-4F9E',
      title: 'Điều Phối Tài Nguyên Chi Nhánh (Central Hub Dispatcher)',
      slug: 'central-hub-dispatcher',
      category: 'Vận Hành',
      icon: Network,
      description: 'Kiểm soát và sync configuration, tài nguyên vận hành, phân bổ dòng tiền time thực giữa tập đoàn trung ương và các branch member.'
    },
    {
      id: 'AI-ANLYT-9D5C',
      title: 'Hệ Thống Phân Tích Thông Minh (AI Analytics & BI)',
      slug: 'ai-analytics-bi',
      category: 'Tình Báo Số',
      icon: LineChart,
      description: 'AI Engine aggregate report tự động, dự báo biến động dòng tiền, statistics hiệu năng system SOC toàn diện.'
    },
    {
      id: 'DB-DIST-2C1B',
      title: 'Cơ Sở Dữ Liệu Phân Tán Edge (Distributed Data Engine)',
      slug: 'distributed-data-engine',
      category: 'Cơ Sở Hạ Tầng',
      icon: Database,
      description: 'Kiến trúc Multi-tenant phân mảnh dữ liệu vật lý an toàn, tự động nhân bản đa vùng (Multi-region replication) với độ trễ < 4ms.'
    },
    {
      id: 'CMS-GATE-7B3A',
      title: 'Cổng Tri Thức & CMS Đa Ngôn Ngữ (Global CMS Gateway)',
      slug: 'global-cms-gateway',
      category: 'Truyền Thông',
      icon: Globe,
      description: 'Quản trị document SOP quy standard, cổng news đa ngôn ngữ (Việt - Khmer - Anh) hỗ trợ SEO tối ưu hóa volume tiếp cận.'
    },
    {
      id: 'SEC-RBAC-1E9D',
      title: 'Phân Quyền Chặt Chẽ Cấp Độ API (Granular Access RBAC)',
      slug: 'granular-access-rbac',
      category: 'Bảo Mật',
      icon: Cpu,
      description: 'Validate authorization role (Role-based access control) đầu cuối nghiêm ngặt. Xác minh token JWT, ngăn ngừa rò rỉ dữ liệu chéo giữa các tenant.'
    }
  ];

  const displayTalks = dharmaTalks.length > 0 
    ? dharmaTalks.slice(0, 6) 
    : defaultNodes;

  return (
    <section id="nodes" className="py-28 bg-[#070A0F] border-t border-white/5 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00F2FF]/3 blur-[160px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-5 uppercase">
              {title}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-[#00F2FF] pl-4 leading-none">
              Mạng lưới document SOP vận hành và các phân hệ SaaS security cao
            </p>
          </div>
          
          <Link 
            href="/documents"
            className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-widest uppercase text-[#00F2FF] hover:bg-[#00F2FF]/10 px-6 py-3 border border-[#00F2FF]/30 hover:border-[#00F2FF]/80 rounded-xl transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            View Tài Liệu Hệ Thống
          </Link>
        </div>

        {/* 3D Grid of Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTalks.map((talk, idx) => {
            // Pick corresponding icon: custom or dynamic fallback
            const CardIcon = talk.icon || Cpu;

            return (
              <motion.div
                key={talk.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="group relative flex flex-col h-full"
              >
                {/* Card Ambient Glow Behind */}
                <div className="absolute inset-0 bg-[#00F2FF]/5 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 pointer-events-none" />

                <Link href={`/documents/${talk.slug}`} className="flex flex-col h-full">
                  <div className="relative p-8 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-[#00F2FF]/40 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-2xl flex-grow flex flex-col justify-between">
                    
                    {/* Fine Digital Top Accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                      <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-[#00F2FF] rounded-full animate-pulse shadow-[0_0_10px_#00F2FF]" />
                      <div className="absolute top-5 right-5 w-8 h-[1px] bg-[#00F2FF]/30 -rotate-45 origin-right" />
                    </div>

                    <div>
                      {/* Top Bar with Icon & Cryptographic Code */}
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#00F2FF]/60 uppercase">
                          #{talk.id.substring(0, 12).toUpperCase()}
                        </span>
                        
                        {/* High-tech Glowing Icon */}
                        <div className="p-3 bg-[#0A1017] border border-white/5 rounded-xl group-hover:border-[#00F2FF]/30 group-hover:bg-[#00F2FF]/5 transition-colors duration-300">
                          <CardIcon className="w-5 h-5 text-[#00F2FF] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Category Tag */}
                      {talk.category && (
                        <span className="inline-block mt-3 px-2 py-0.5 text-[8px] font-black tracking-widest text-[#00F2FF]/70 bg-[#00F2FF]/5 border border-[#00F2FF]/20 rounded uppercase">
                          {talk.category}
                        </span>
                      )}

                      {/* Header Title */}
                      <h3 className="text-base font-bold text-white mt-4 group-hover:text-[#00F2FF] transition-colors line-clamp-2 leading-snug">
                        {talk.title}
                      </h3>

                      {/* Real description text for fallbacks */}
                      {talk.description && (
                        <p className="text-xs text-slate-400 font-light leading-relaxed mt-3 line-clamp-3">
                          {talk.description}
                        </p>
                      )}
                    </div>

                    {/* Card Bottom Indicator */}
                    <div className="flex items-center justify-between mt-8 border-t border-white/5 pt-4">
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1.5 h-1.5 bg-[#00F2FF]/20 rounded-full group-hover:bg-[#00F2FF]/50 transition-colors duration-300" />
                        ))}
                      </div>
                      <span className="text-[9px] font-extrabold tracking-widest text-slate-500 group-hover:text-white transition-colors flex items-center gap-0.5">
                        KHÁM PHÁ
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    {/* Glowing bottom line sliding up */}
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00F2FF] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Empty Placeholder Card with dash border */}
          <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/[0.005] border border-dashed border-white/10 hover:border-white/20 rounded-2xl opacity-40 hover:opacity-75 transition-all duration-300 min-h-[300px]">
            <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-4 text-slate-400 group-hover:border-[#00F2FF]/30 group-hover:text-[#00F2FF] transition-colors duration-300">
              <span className="text-2xl leading-none font-bold">+</span>
            </div>
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-center text-slate-500">
              Phân Hệ Mới<br/>Đang Đồng Bộ Hóa
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StitchNodes;
