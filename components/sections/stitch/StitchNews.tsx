'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';

interface NewsArticle {
  id: string;
  title_vi: string;
  title_en?: string | null;
  slug: string;
  summary_vi?: string | null;
  summary_en?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
  author_name?: string | null;
  category_name?: string | null;
}

interface StitchNewsProps {
  news?: NewsArticle[];
  title?: string;
}

export const StitchNews: React.FC<StitchNewsProps> = ({
  news = [],
  title = "Tin Tức & Thông Điệp Vận Hành"
}) => {
  // Fallback data if DB news is empty, ensuring production never has an empty state
  const fallbackNews: NewsArticle[] = [
    {
      id: 'news-fall-1',
      title_vi: 'Nexus Corp Ra Mắt Nền Tảng Cloud Security Thế Hệ Mới Hỗ Trợ Multi-Tenant',
      slug: 'nexus-cloud-security-multi-tenant',
      summary_vi: 'Giải pháp security điện toán đám mây tiên tiến bảo vệ toàn diện dữ liệu đa branch với kiến trúc mã hóa chuỗi block (WORM) và cô lập IP độc hại tự động tại Edge Middleware.',
      thumbnail_url: '',
      published_at: new Date().toISOString(),
      author_name: 'Phòng Công Nghệ',
      category_name: 'Thông Báo Hệ Thống'
    },
    {
      id: 'news-fall-2',
      title_vi: 'Đồng Bộ Hóa Dữ Liệu Tài Chính Toàn Diện Cho Toàn Bộ 4 Chi Nhánh Thành Viên',
      slug: 'dong-bo-hoa-tai-chinh-4-chi-nhanh',
      summary_vi: 'Complete triển khai cổng audit finance tích hợp giúp ban điều hành trung ương giám sát dòng tiền, report revenue time thực và quản lý ngân sách centralized.',
      thumbnail_url: '',
      published_at: new Date(Date.now() - 86400000).toISOString(),
      author_name: 'Ban Tài Chính',
      category_name: 'Vận Hành'
    },
    {
      id: 'news-fall-3',
      title_vi: 'Chiến Lược Chuyển Đổi Số Doanh Nghiệp Tác Động Xã Hội Giai Đoạn 2026 - 2030',
      slug: 'chien-luoc-chuyen-doi-so-2026-2030',
      summary_vi: 'Tập trung xây dựng system website cổng thông tin open đa ngôn ngữ, system E-Learning đào tạo quy standard nhân sự SOP nâng cao năng lực cạnh tranh toàn diện chuỗi cung ứng.',
      thumbnail_url: '',
      published_at: new Date(Date.now() - 172800000).toISOString(),
      author_name: 'Hội Đồng Quản Trị',
      category_name: 'Chiến Lược'
    }
  ];

  const displayNews = news.length > 0 ? news.slice(0, 3) : fallbackNews;

  return (
    <section id="news" className="py-28 bg-[#070A0F] border-t border-white/5 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#a855f7]/3 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00F2FF]/3 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-5 uppercase">
              {title}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-[#a855f7] pl-4 leading-none">
              Update news công nghệ và thông cáo báo chí chính thức
            </p>
          </div>
          
          <Link 
            href="/news"
            className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-widest uppercase text-[#a855f7] hover:bg-[#a855f7]/10 px-6 py-3 border border-[#a855f7]/30 hover:border-[#a855f7]/80 rounded-xl transition-all duration-300 backdrop-blur-sm"
          >
            <Newspaper className="w-3.5 h-3.5" />
            View Tất Cả Tin Tức
          </Link>
        </div>

        {/* 3 Columns News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayNews.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative flex flex-col h-full"
            >
              {/* Card Hover Glow behind */}
              <div className="absolute inset-0 bg-[#a855f7]/5 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 pointer-events-none" />

              <Link href={`/news/${article.slug}`} className="flex flex-col h-full">
                <div className="relative flex flex-col h-full bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-[#a855f7]/40 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-2xl flex-grow">
                  
                  {/* Thumbnail Cover Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0C121A] border-b border-white/5">
                    {article.thumbnail_url ? (
                      <img 
                        src={article.thumbnail_url} 
                        alt={article.title_vi}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative">
                        {/* Dynamic Neon Background for thumbnail placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/10 via-indigo-950/20 to-[#00F2FF]/10" />
                        <Newspaper className="w-12 h-12 text-[#a855f7]/30 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    
                    {/* Category Tag overlay */}
                    {article.category_name && (
                      <span className="absolute top-4 left-4 px-3 py-1 text-[8px] font-black tracking-widest text-[#00F2FF] bg-[#00F2FF]/5 border border-[#00F2FF]/30 rounded-md uppercase backdrop-blur-md">
                        {article.category_name}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      {/* Meta Date & Author */}
                      <div className="flex items-center gap-4 text-[9px] font-extrabold tracking-widest text-slate-500 uppercase mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(article.published_at || '').toLocaleDateString('vi-VN')}
                        </span>
                        {article.author_name && (
                          <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                            <User className="w-3.5 h-3.5" />
                            {article.author_name}
                          </span>
                        )}
                      </div>

                      {/* Article Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-[#a855f7] transition-colors line-clamp-2 leading-snug mb-3">
                        {article.title_vi}
                      </h3>

                      {/* Excerpt Summary */}
                      {article.summary_vi && (
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-light mb-6">
                          {article.summary_vi}
                        </p>
                      )}
                    </div>

                    {/* Bottom CTA Link */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1 h-1 bg-[#a855f7]/20 rounded-full" />
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-500 group-hover:text-white transition-colors flex items-center gap-1">
                        ĐỌC TIẾP
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>

                  </div>

                  {/* Neon sliding line on hover */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#a855f7] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StitchNews;
