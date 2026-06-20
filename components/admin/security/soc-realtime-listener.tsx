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
            // Cancel active speech to avoid long queues
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.95; // Stately speed
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Register Realtime channel to listen to audit_logs table
        const channel = supabase
            .channel('soc-realtime-logs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                (payload) => {
                    const newLog = payload.new as any;
                    
                    // Only activate voice warning for critical security violations or high CRS
                    if (
                        newLog.risk_score >= 75 || 
                        ['sql_injection_attempt', 'cross_tenant_violation', 'cache_pollution_attempt', 'audit_log_tampering_attempt', 'honeypot_decoy_triggered'].includes(newLog.action)
                    ) {
                        let actionLabel = 'suspicious activity';
                        if (newLog.action === 'sql_injection_attempt') actionLabel = 'SQL injection attempt';
                        else if (newLog.action === 'cross_tenant_violation') actionLabel = 'cross tenant data violation';
                        else if (newLog.action === 'cache_pollution_attempt') actionLabel = 'cache pollution attempt';
                        else if (newLog.action === 'audit_log_tampering_attempt') actionLabel = 'audit log tampering attempt';
                        else if (newLog.action === 'honeypot_decoy_triggered') actionLabel = 'honeypot decoy triggered';

                        const alertText = newLog.action === 'honeypot_decoy_triggered'
                            ? `Red alert! Intruder triggered Honeypot trap from IP address ${newLog.ip_address || 'unknown'}. SOAR engine has activated immediate edge isolation at the Edge Middleware!`
                            : `Security warning! Detected ${actionLabel} from IP address ${newLog.ip_address || 'unknown'}. SOAR engine has automatically blocked and isolated the threat at the network edge.`;
                        
                        setLastAlert(`[${new Date().toLocaleTimeString()}] ${newLog.action.toUpperCase()} detected from ${newLog.ip_address}`);
                        speakAlert(alertText);
                    }

                    // Synchronize Server Component status immediately on the UI
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
                        speakAlert('Cyber SOC audio warnings enabled.');
                    }
                }}
                className={`p-1.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    isMuted
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
                title={isMuted ? "Enable audio warning" : "Disable audio warning"}
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>
        </div>
    );
}
