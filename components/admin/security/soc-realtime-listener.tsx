'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Volume2, VolumeX, Shield, Radio, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SocRealtimeListener() {
    const [isMuted, setIsMuted] = useState(false);
    const [lastAlert, setLastAlert] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const speakAlert = (text: string) => {
        if (isMuted) return;
        if ('speechSynthesis' in window) {
            // Cancel các giọng nói đang phát dở để tránh xếp hàng quá lâu
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = 0.95; // Tốc độ đĩnh đạc
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Registration kênh Realtime lắng nghe bảng audit_logs
        const channel = supabase
            .channel('soc-realtime-logs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                (payload) => {
                    const newLog = payload.new as any;
                    
                    // Chỉ activate warning giọng nói với vi phạm an ninh nghiêm trọng hoặc CRS cao
                    if (
                        newLog.risk_score >= 75 || 
                        ['sql_injection_attempt', 'cross_tenant_violation', 'cache_pollution_attempt', 'audit_log_tampering_attempt', 'honeypot_decoy_triggered'].includes(newLog.action)
                    ) {
                        let actionLabel = 'truy cập bất thường';
                        if (newLog.action === 'sql_injection_attempt') actionLabel = 'tấn công chèn mã sql injection';
                        else if (newLog.action === 'cross_tenant_violation') actionLabel = 'vi phạm truy cập dữ liệu chéo';
                        else if (newLog.action === 'cache_pollution_attempt') actionLabel = 'tấn công noisy neighbor làm nghẽn tài nguyên';
                        else if (newLog.action === 'audit_log_tampering_attempt') actionLabel = 'cố ý phá hoại file sổ cái';
                        else if (newLog.action === 'honeypot_decoy_triggered') actionLabel = 'sập bẫy dữ liệu mật ngọt active honeypot';

                        const alertText = newLog.action === 'honeypot_decoy_triggered'
                            ? `Báo động cấp đỏ! Phát hiện tác nhân xâm nhập đã sập bẫy Honeypot mật ngọt từ address IP ${newLog.ip_address || 'lạ'}. Động cơ SOAR activate phong tỏa và cô lập toàn diện lập tức tại Edge Middleware!`
                            : `Warning an ninh mạng! Phát hiện hành vi ${actionLabel} từ address IP ${newLog.ip_address || 'lạ'}. System SOAR đã tự động activate cơ chế Edge block, cô lập tác nhân successfully.`;
                        
                        setLastAlert(`[${new Date().toLocaleTimeString()}] ${newLog.action.toUpperCase()} detected from ${newLog.ip_address}`);
                        speakAlert(alertText);
                    }

                    // Sync hóa status Server Component ngay lập tức trên UI
                    router.refresh();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isMuted, router, supabase]);

    return (
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-inner shrink-0 transition-all duration-300 hover:border-amber-500/20">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isConnected ? 'Realtime Connected' : 'Realtime Disconnected'}
                </span>
            </div>

            <div className="h-4 w-px bg-slate-700"></div>

            <button
                onClick={() => {
                    const newMute = !isMuted;
                    setIsMuted(newMute);
                    if (!newMute) {
                        speakAlert('Đã activate system warning âm thanh Cyber SOC.');
                    }
                }}
                className={`p-1.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    isMuted
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
                title={isMuted ? "Enable âm thanh warning" : "Disable âm thanh warning"}
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>
        </div>
    );
}
