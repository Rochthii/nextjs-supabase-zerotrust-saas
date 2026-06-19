'use client';
 
import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Unlock, Clock, Globe, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { unblockIpAction } from '@/app/actions/admin/settings';
 
interface BlockedIp {
    id: string;
    ip: string;
    tenant_id: string;
    blocked_at: string;
    blocked_until: string;
    reason: string;
    created_by: string;
}
 
interface IpBlocklistWidgetProps {
    blockedIps: BlockedIp[];
}
 
export function IpBlocklistWidget({ blockedIps: initialBlockedIps }: IpBlocklistWidgetProps) {
    const [blockedIps, setBlockedIps] = useState<BlockedIp[]>(initialBlockedIps);
    const [loadingIp, setLoadingIp] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();
 
    const handleUnblock = async (ip: string, tenantId: string) => {
        setLoadingIp(ip);
        setErrorMsg(null);
 
        try {
            // Gọi Server Action để unblock IP (chạy bằng admin client ở phía server)
            const result = await unblockIpAction(ip, tenantId);
 
            if (!result.success) {
                throw new Error(result.error || 'Lỗi khi gỡ block IP');
            }
 
            // Update state cục bộ để biến mất ngay lập tức trên UI
            setBlockedIps(prev => prev.filter(item => !(item.ip === ip && item.tenant_id === tenantId)));
            
            // Revalidate lại page Next.js để sync server state
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err?.message || 'Error on gỡ lệnh block IP.');
        } finally {
            setLoadingIp(null);
        }
    };

    return (
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-3xl transition-all duration-300 hover:border-amber-500/20">
            <div className="bg-slate-950/90 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300"></div>
                <h3 className="text-base font-black flex items-center gap-2 text-slate-100 relative z-10">
                    <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" /> SOAR Dynamic IP Blocklist
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 relative z-10 font-medium">
                    Các IP lạ bị block tại Edge Middleware ({"<"} 4ms) bảo vệ CSDL khỏi nguy cơ Reverse DDoS.
                </p>
            </div>

            <div className="p-5">
                {errorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {blockedIps.length === 0 ? (
                    <div className="text-center py-10 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/10 shadow-inner">
                        <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-500" />
                        <p className="font-bold text-sm">System An toàn</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Không phát hiện address IP nào bị cấm truy cập.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {blockedIps.map((item) => (
                            <div 
                                key={item.id} 
                                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40 shadow-sm flex items-start justify-between gap-4 transition-all duration-300 hover:shadow-md hover:border-amber-500/10 group"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 shrink-0">
                                            <Globe className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">{item.ip}</span>
                                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded uppercase tracking-wider animate-pulse">Blocked</span>
                                    </div>
                                    
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic mb-2">
                                        "{item.reason || 'Bị block tự động do phát hiện hành vi xâm phạm.'}"
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Open khóa lúc: {new Date(item.blocked_until).toLocaleString('vi-VN')}</span>
                                        </div>
                                        <div className="hidden sm:block">|</div>
                                        <div>Tạo bởi: {item.created_by}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUnblock(item.ip, item.tenant_id)}
                                    disabled={loadingIp === item.ip}
                                    className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                                        loadingIp === item.ip
                                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700'
                                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white'
                                    }`}
                                >
                                    <Unlock className={`w-3.5 h-3.5 ${loadingIp === item.ip ? 'animate-spin' : ''}`} />
                                    <span>{loadingIp === item.ip ? '...' : 'Gỡ block'}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
