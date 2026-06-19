'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Server, Shield, Activity, RefreshCw } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  role: string;
  ip: string;
  ping: string;
  uptime: string;
  crypto: string;
  status: 'ONLINE' | 'SYNCING' | 'SECURED';
  x: number;
  y: number;
}

export function StitchNetwork() {
  const [activeNode, setActiveNode] = useState<NetworkNode | null>(null);
  const [pulseData, setPulseData] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseData((prev) => (prev + 1) % 100);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nodes: NetworkNode[] = [
    {
      id: 'central',
      name: 'Nexus Central Cloud Gateway',
      role: 'System Trung ương & SOC',
      ip: '10.0.1.254',
      ping: '1.2ms',
      uptime: '99.999%',
      crypto: 'TLS 1.3 / AES-256-GCM',
      status: 'SECURED',
      x: 50,
      y: 50,
    },
    {
      id: 'branch-alpha',
      name: 'Tập đoàn Alpha (Branch 01)',
      role: 'Quản trị Finance & Nhân sự',
      ip: '192.168.10.12',
      ping: '3.6ms',
      uptime: '99.99%',
      crypto: 'ChaCha20-Poly1305',
      status: 'ONLINE',
      x: 20,
      y: 25,
    },
    {
      id: 'branch-beta',
      name: 'Beta Tech Corp (Branch 02)',
      role: 'Phân hệ R&D & Khoa last namec số',
      ip: '192.168.20.45',
      ping: '4.8ms',
      uptime: '99.98%',
      crypto: 'AES-256-CBC / WORM Ledger',
      status: 'ONLINE',
      x: 80,
      y: 25,
    },
    {
      id: 'branch-gamma',
      name: 'Gamma Retail (Branch 03)',
      role: 'System Bán lẻ & Chuỗi cung ứng',
      ip: '192.168.30.88',
      ping: '5.2ms',
      uptime: '99.95%',
      crypto: 'TLS 1.3 / SHA-384',
      status: 'SYNCING',
      x: 18,
      y: 75,
    },
    {
      id: 'branch-delta',
      name: 'Delta Logistics (Branch 04)',
      role: 'Phân phối & Kho vận Thông minh',
      ip: '192.168.40.101',
      ping: '4.1ms',
      uptime: '99.99%',
      crypto: 'TLS 1.3 / AES-128-GCM',
      status: 'ONLINE',
      x: 82,
      y: 75,
    },
  ];

  return (
    <section className="py-28 bg-[#070A0F] border-t border-white/5 relative overflow-hidden">
      {/* Dynamic Digital Mesh Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `
            radial-gradient(#00F2FF 1px, transparent 1.5px),
            linear-gradient(to right, #00F2FF 0.5px, transparent 0.5px)
          `,
          backgroundSize: '32px 32px, 64px 64px' 
        }} 
      />

      {/* Radiant Glowing Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-[#00F2FF]/3 to-indigo-600/3 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F2FF]/5 border border-[#00F2FF]/20 text-[#00F2FF] text-[10px] font-bold tracking-widest uppercase mb-6 animate-pulse">
            <Network className="w-3.5 h-3.5" />
            REAL-TIME DATA TOPOLOGY MAP
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 uppercase">
            Mạng Lưới Vận Hành Liên Chi Nhánh
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Trực quan hóa đồ last namea connect mật mã last namec và sync dữ liệu time thực. System đảm bảo tính toàn vẹn 100% giữa Trụ sở chính và các Phân hệ branch vệ tinh thông qua đường truyền security cao.
          </p>
        </div>

        {/* Network Topology Visualizer Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#090F16]/40 border border-white/[0.04] p-6 md:p-10 rounded-3xl shadow-3xl backdrop-blur-md relative overflow-hidden group/box">
          
          {/* Subtle Cyber Accents */}
          <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-[#00F2FF] to-transparent" />
          <div className="absolute top-0 left-0 w-px h-24 bg-gradient-to-b from-[#00F2FF] to-transparent" />
          <div className="absolute bottom-0 right-0 w-24 h-px bg-gradient-to-l from-[#a855f7] to-transparent" />
          <div className="absolute bottom-0 right-0 w-px h-24 bg-gradient-to-t from-[#a855f7] to-transparent" />

          {/* Graphic Side (7 Cols) */}
          <div className="lg:col-span-8 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11] bg-[#05080C]/80 border border-white/5 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-4">
            
            {/* SVG Network Grid Canvas */}
            <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 select-none">
              
              {/* 1. Connection lines with dash arrays */}
              {nodes.slice(1).map((node) => (
                <g key={`line-${node.id}`}>
                  {/* Outer glowing path */}
                  <line
                    x1="50"
                    y1="50"
                    x2={node.x}
                    y2={node.y}
                    stroke={node.id === 'branch-gamma' ? '#a855f7' : '#00F2FF'}
                    strokeWidth="0.8"
                    strokeOpacity="0.15"
                    className="blur-[2px]"
                  />
                  {/* Core connection path */}
                  <line
                    x1="50"
                    y1="50"
                    x2={node.x}
                    y2={node.y}
                    stroke={node.id === 'branch-gamma' ? '#c084fc' : '#22d3ee'}
                    strokeWidth="0.3"
                    strokeDasharray="1.5 2"
                    strokeOpacity="0.4"
                  />
                  
                  {/* 2. Flowing Data Packets (Glowing Spheres) */}
                  <circle r="0.6" fill={node.id === 'branch-gamma' ? '#d8b4fe' : '#67e8f9'} className="shadow-[0_0_8px_#00F2FF]">
                    <animateMotion
                      dur={node.id === 'branch-gamma' ? '5.2s' : `${3 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                      path={`M 50,50 L ${node.x},${node.y}`}
                    />
                  </circle>

                  {/* Packet moving backwards */}
                  <circle r="0.4" fill="#ffffff" opacity="0.7">
                    <animateMotion
                      dur={node.id === 'branch-gamma' ? '4.5s' : `${2.5 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                      path={`M ${node.x},${node.y} L 50,50`}
                    />
                  </circle>
                </g>
              ))}

              {/* 3. Render Nodes - Optimized for 60 FPS Client Render */}
              {nodes.map((node) => {
                const isCentral = node.id === 'central';
                const isActive = activeNode?.id === node.id;
                
                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group/node"
                    onClick={() => setActiveNode(node)}
                    onMouseEnter={() => setActiveNode(node)}
                  >
                    {/* Ring Pulse Behind Node on Hover/Active - Optimized using pulse to avoid expensive ping transforms */}
                    {(isActive || isCentral) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isCentral ? 7.5 : 5.5}
                        fill="none"
                        stroke={node.status === 'SYNCING' ? '#a855f7' : '#00F2FF'}
                        strokeWidth="0.3"
                        strokeOpacity="0.4"
                        className="animate-pulse"
                      />
                    )}

                    {/* Outer Ambient Glow Ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCentral ? 5 : 3.8}
                      fill="#0A0F16"
                      stroke={isActive ? (node.status === 'SYNCING' ? '#c084fc' : '#22d3ee') : 'rgba(255,255,255,0.06)'}
                      strokeWidth={isActive ? '0.6' : '0.3'}
                      className="transition-all duration-300"
                    />

                    {/* Ambient Glow Aura Layer (High-Performance alternative to expensive CSS filters) */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCentral ? 5.5 : 3.5}
                      fill={
                        node.status === 'SECURED' 
                          ? '#00F2FF' 
                          : node.status === 'SYNCING' 
                            ? '#a855f7' 
                            : '#10b981'
                      }
                      opacity="0.25"
                      className={node.status === 'SYNCING' ? 'animate-pulse' : ''}
                    />

                    {/* Core Glowing Dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCentral ? 2.2 : 1.4}
                      fill={
                        node.status === 'SECURED' 
                          ? '#00F2FF' 
                          : node.status === 'SYNCING' 
                            ? '#a855f7' 
                            : '#10b981'
                      }
                      className={node.status === 'SYNCING' ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Static Overlay Labels */}
            <div className="absolute inset-0 z-20 pointer-events-none text-[8px] sm:text-[10px] font-black tracking-widest text-slate-500 uppercase select-none">
              <div className="absolute top-4 left-6 border-l border-white/10 pl-2">PING CONSOLE: MONITORING</div>
              <div className="absolute bottom-4 right-6 border-r border-white/10 pr-2 text-right">SECURE SSL GATEWAY ACTIVE</div>
            </div>
          </div>

          {/* Details Sidebar / Console Side (4 Cols) */}
          <div className="lg:col-span-4 h-full flex flex-col justify-between gap-6 relative">
            <div className="p-6 bg-white/[0.01] border border-white/[0.04] rounded-2xl relative overflow-hidden min-h-[280px]">
              
              {/* Inner glowing corner */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00F2FF]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#a855f7]" />

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00F2FF] animate-pulse" />
                  Node Inspector
                </span>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold tracking-wider bg-white/5 text-[#00F2FF]">
                  v1.2.9-Edge
                </span>
              </div>

              {activeNode ? (
                <motion.div
                  key={activeNode.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-white font-extrabold text-base tracking-tight leading-snug">
                      {activeNode.name}
                    </h3>
                    <p className="text-[#00F2FF] text-[10px] font-extrabold tracking-widest uppercase mt-1">
                      {activeNode.role}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Address IP</span>
                      <span className="text-white text-xs font-mono font-bold">{activeNode.ip}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Time Trễ</span>
                      <span className="text-white text-xs font-mono font-bold text-[#10b981]">{activeNode.ping}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Tần suất Uptime</span>
                      <span className="text-white text-xs font-mono font-bold">{activeNode.uptime}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Status</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        activeNode.status === 'SECURED' 
                          ? 'text-[#00F2FF]' 
                          : activeNode.status === 'SYNCING' 
                            ? 'text-[#a855f7] animate-pulse' 
                            : 'text-[#10b981]'
                      }`}>
                        ● {activeNode.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#05080C] border border-white/5 rounded-xl space-y-1 mt-4">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#00F2FF]" />
                      Thuật toán Security
                    </span>
                    <span className="text-slate-300 text-[10px] font-mono font-bold block truncate">
                      {activeNode.crypto}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-full mb-3 text-slate-500 group-hover/box:text-[#00F2FF] group-hover/box:border-[#00F2FF]/30 transition-colors duration-500">
                    <Server className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                    RÊ CHUỘT LÊN NODE<br/>ĐỂ KIỂM TRA THÔNG SỐ
                  </p>
                </div>
              )}
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center gap-3">
                <div className="p-2 bg-[#00F2FF]/5 border border-[#00F2FF]/20 rounded-lg">
                  <RefreshCw className="w-4 h-4 text-[#00F2FF] animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">Sync</span>
                  <span className="text-white text-xs font-black tracking-tight uppercase leading-none">REAL-TIME</span>
                </div>
              </div>
              <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center gap-3">
                <div className="p-2 bg-[#a855f7]/5 border border-[#a855f7]/20 rounded-lg">
                  <Shield className="w-4 h-4 text-[#a855f7]" />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">Mã hóa</span>
                  <span className="text-white text-xs font-black tracking-tight uppercase leading-none">AES-256</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default StitchNetwork;
