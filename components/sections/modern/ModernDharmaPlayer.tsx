'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Play, Volume2, ShieldCheck, Clock, User, ChevronRight } from 'lucide-react';

interface DharmaTalk {
  id: string;
  slug?: string | null;
  title_vi: string;
  title_en?: string | null;
  thumbnail_url?: string | null;
  youtube_url?: string | null;
  video_url?: string | null;
  duration?: string | null;
  speaker_name?: string | null;
  description?: string;
}

interface ModernDharmaPlayerProps {
  talks?: DharmaTalk[];
  isCompany?: boolean;
}

export function ModernDharmaPlayer({ talks = [], isCompany = true }: ModernDharmaPlayerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');

  // Fallback SOP / Enterprise B2B Training videos
  const fallbackSopVideos: DharmaTalk[] = [
    {
      id: 'sop-1',
      title_vi: 'Quy Trình Thẩm Định Kiểm Toán Bảo Mật SOC2 Tiêu Standard',
      duration: '45 phút',
      speaker_name: 'Trưởng Ban An Ninh Hệ Thống',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder video
      description: 'Quy standard hướng dẫn audit an ninh SOC2, đối sánh mã băm chuỗi block logs WORM và vận hành system SOAR tự động.'
    },
    {
      id: 'sop-2',
      title_vi: 'Bảo Mật Edge Middleware & Kịch Bản Phòng Chống DDoS Tốc Độ Cao',
      duration: '60 phút',
      speaker_name: 'Giám Đốc Công Nghệ Nexus',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Details cơ chế cô lập IP vi phạm tại Edge Middleware trong vòng < 4ms, vận hành bẫy Honeypot Decoy Trap.'
    },
    {
      id: 'sop-3',
      title_vi: 'Hướng Dẫn Vận Hành CSDL Phân Tán Mật Mã Last namec Immutable WORM',
      duration: '30 phút',
      speaker_name: 'Chuyên Gia Dữ Liệu Lớn',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Cách thức ghi nhận log bất biến vào database phân tán, giải quyết phân mảnh multi-tenant chéo.'
    },
    {
      id: 'sop-4',
      title_vi: 'Quy Standard Hướng Dẫn Phân Quyền Chi Tiết Granular RBAC API',
      duration: '40 phút',
      speaker_name: 'Kỹ Sư Trưởng Hệ Thống',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Analytics phân hệ security authorization role (Role-based access control), kiểm định token JWT tại cổng API.'
    }
  ];

  const hasRealData = talks && talks.length > 0;
  const displayTalks = hasRealData ? talks : fallbackSopVideos;

  const activeTalk = displayTalks[activeIdx] || fallbackSopVideos[0];

  const getYouTubeId = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const handlePlay = (talk: DharmaTalk) => {
    const ytId = getYouTubeId(talk.youtube_url || talk.video_url);
    if (ytId) {
      setModalUrl(`https://www.youtube.com/embed/${ytId}?autoplay=1`);
      setModalOpen(true);
    }
  };

  return (
    <>
      <section
        className="py-28 bg-[#05080C] px-6 border-t border-white/5 relative overflow-hidden"
      >
        {/* Neon Ambient Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00F2FF]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-mono font-extrabold tracking-widest text-[#00F2FF] bg-[#00F2FF]/5 border border-[#00F2FF]/20 uppercase mb-4 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                ENTERPRISE KNOWLEDGE HUB
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                {isCompany ? 'Tri Thức & Đào Tạo SOP' : 'Thư Viện Pháp Âm Số'}
              </h2>
            </div>
            
            <Link
              href="/documents"
              className="text-[10px] font-extrabold tracking-widest uppercase text-[#00F2FF] hover:bg-[#00F2FF]/10 px-6 py-3 border border-[#00F2FF]/30 hover:border-[#00F2FF]/80 rounded-xl transition-all duration-300 backdrop-blur-sm flex items-center gap-1.5"
            >
              View Add Tài Liệu
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            
            {/* Player lớn bên trái (3 Cols) */}
            <div
              className="lg:col-span-3 relative rounded-2xl overflow-hidden cursor-pointer group aspect-video bg-[#090F16]/50 border border-[#00F2FF]/20 hover:border-[#00F2FF]/60 transition-all duration-500 shadow-3xl flex flex-col justify-between"
              onClick={() => handlePlay(activeTalk)}
            >
              {activeTalk.thumbnail_url ? (
                <Image
                  src={activeTalk.thumbnail_url}
                  alt={activeTalk.title_vi}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 relative">
                  {/* Dynamic Gradient Neon placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#00F2FF]/10 via-[#05080C] to-indigo-950/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <ShieldCheck className="w-16 h-16 text-[#00F2FF]/30 group-hover:scale-110 transition-transform duration-500 mb-4" />
                    <span className="text-[10px] font-mono font-extrabold text-[#00F2FF]/60 tracking-widest uppercase">
                      NEXUS SECURITY COMPLIANCE VIDEO
                    </span>
                  </div>
                </div>
              )}

              {/* Cover Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

              {/* Play button with Neon Cyan Pulse */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 bg-[#00F2FF] text-black"
                  style={{
                    boxShadow: '0 0 35px rgba(0, 242, 255, 0.45)',
                  }}
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-black ml-1 text-black" />
                </div>
              </div>

              {/* Visualizer bars jumping dynamically in background */}
              <div className="absolute bottom-16 right-6 flex items-end gap-0.5 opacity-60 z-20">
                {[3, 5, 8, 4, 7, 5, 9, 6, 4, 7].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full animate-visualizer"
                    style={{
                      height: `${h * 3}px`,
                      backgroundColor: '#00F2FF',
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${0.6 + i * 0.15}s`,
                    }}
                  />
                ))}
              </div>

              {/* Info bottom pane */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-4 text-[9px] font-mono font-extrabold tracking-widest text-[#00F2FF] uppercase mb-2">
                  {activeTalk.speaker_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activeTalk.speaker_name}
                    </span>
                  )}
                  {activeTalk.duration && (
                    <span className="flex items-center gap-1 border-l border-white/10 pl-4">
                      <Clock className="w-3 h-3" />
                      {activeTalk.duration}
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-extrabold text-base sm:text-xl line-clamp-2 leading-snug group-hover:text-[#00F2FF] transition-colors">
                  {activeTalk.title_vi}
                </h3>
                
                {activeTalk.description && (
                  <p className="text-slate-400 text-xs mt-2 line-clamp-2 font-light max-w-xl">
                    {activeTalk.description}
                  </p>
                )}
              </div>
            </div>

            {/* List pháp thoại bên phải (2 Cols) */}
            <div className="lg:col-span-2 flex flex-col gap-3 overflow-y-auto max-h-[350px] lg:max-h-none pr-1">
              {displayTalks.map((talk, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={talk.id}
                    onClick={() => setActiveIdx(idx)}
                    className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 w-full bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] relative overflow-hidden"
                    style={{
                      borderColor: isActive ? 'rgba(0, 242, 255, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    {/* Glowing highlight on active card */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00F2FF] shadow-[0_0_10px_#00F2FF]" />
                    )}

                    {/* Mini Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0C121A] border border-white/5 flex items-center justify-center">
                      {talk.thumbnail_url ? (
                        <Image src={talk.thumbnail_url} alt={talk.title_vi} fill className="object-cover" unoptimized />
                      ) : (
                        <ShieldCheck className={`w-6 h-6 ${isActive ? 'text-[#00F2FF] animate-pulse' : 'text-slate-500'}`} />
                      )}
                      
                      {isActive && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/60"
                        >
                          <div className="flex items-end gap-0.5">
                            {[3, 5, 4].map((h, i) => (
                              <div
                                key={i}
                                className="w-0.5 rounded-full animate-visualizer bg-[#00F2FF]"
                                style={{ height: `${h * 2}px`, animationDuration: `${0.6 + i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug transition-colors duration-300 ${isActive ? 'text-[#00F2FF]' : 'text-white'}`}
                      >
                        {talk.title_vi}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">
                        {talk.duration && (
                          <span>{talk.duration}</span>
                        )}
                        {talk.speaker_name && (
                          <span className="border-l border-white/10 pl-3 truncate max-w-[120px]">{talk.speaker_name}</span>
                        )}
                      </div>
                    </div>

                    {/* Small Play icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? 'bg-[#00F2FF] text-black' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}
                      onClick={(e) => { e.stopPropagation(); handlePlay(talk); }}
                    >
                      <Play className={`w-3.5 h-3.5 ml-0.5 ${isActive ? 'fill-black stroke-black' : 'fill-slate-400 text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* YouTube Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <iframe
              src={modalUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title="Pháp Thoại"
            />
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors border border-white/10"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Visualizer CSS Keyframes */}
      <style>{`
        @keyframes jump {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .animate-visualizer {
          animation: jump 0.8s ease infinite;
          transform-origin: bottom;
          will-change: transform;
        }
      `}</style>
    </>
  );
}

export default ModernDharmaPlayer;
