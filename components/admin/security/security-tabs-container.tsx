'use client';

import React, { useState } from 'react';
import { Eye, Lock, FlaskConical, BookOpen, ShieldAlert } from 'lucide-react';

interface SecurityTabsContainerProps {
    realtimeSocNode: React.ReactNode;
    securityEventsNode: React.ReactNode;
    wormVaultNode: React.ReactNode;
    blueprintNode: React.ReactNode;
    sandboxNode: React.ReactNode;
}

export function SecurityTabsContainer({
    realtimeSocNode,
    securityEventsNode,
    wormVaultNode,
    blueprintNode,
    sandboxNode
}: SecurityTabsContainerProps) {
    const [activeTab, setActiveTab] = useState<'soc' | 'security_events' | 'worm' | 'compliance' | 'sandbox'>('soc');

    return (
        <div className="space-y-8">
            {/* Tabs Navigation Header - Premium Sleek design */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2 rounded-2xl backdrop-blur-xl shadow-lg relative z-20">
                <button
                    onClick={() => setActiveTab('soc')}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'soc'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    <span>Giám sát SOC</span>
                </button>

                <button
                    onClick={() => setActiveTab('security_events')}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'security_events'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Sự kiện An ninh</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('worm')}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'worm'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <Lock className="w-4 h-4" />
                    <span>Sổ cái WORM</span>
                </button>

                <button
                    onClick={() => setActiveTab('compliance')}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'compliance'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    <span>Tuân thủ SOC2/ISO</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('sandbox')}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'sandbox'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <FlaskConical className="w-4 h-4" />
                    <span>Giả lập Tấn công</span>
                </button>
            </div>

            {/* Tab Contents with smooth fade-in micro-animation */}
            <div className="transition-all duration-500 ease-in-out">
                {activeTab === 'soc' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {realtimeSocNode}
                    </div>
                )}
                {activeTab === 'security_events' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {securityEventsNode}
                    </div>
                )}
                {activeTab === 'worm' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="max-w-5xl mx-auto">
                            {wormVaultNode}
                        </div>
                    </div>
                )}
                {activeTab === 'compliance' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="max-w-5xl mx-auto">
                            {blueprintNode}
                        </div>
                    </div>
                )}
                {activeTab === 'sandbox' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {sandboxNode}
                    </div>
                )}
            </div>
        </div>
    );
}
