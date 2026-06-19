'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, ShieldCheck, Clock, User, Server, Fingerprint } from 'lucide-react';

interface SecurityEvent {
    id: string;
    created_at: string;
    action: string;
    table_name: string;
    ip_address: string;
    user_email: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    details: any;
    risk_score: number;
}

interface SecurityEventsWidgetProps {
    events: SecurityEvent[];
}

export function SecurityEventsWidget({ events }: SecurityEventsWidgetProps) {
    const criticalCount = events.filter(e => e.severity === 'CRITICAL').length;
    const warningCount = events.filter(e => e.severity === 'WARNING').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sự kiện Nguy Cấp</p>
                        <h4 className="text-2xl font-black text-rose-500 mt-1">{criticalCount}</h4>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cảnh báo An Ninh</p>
                        <h4 className="text-2xl font-black text-amber-500 mt-1">{warningCount}</h4>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng Thái Hệ Thống</p>
                        <h4 className="text-sm font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                            Giám Sát Chủ Động
                        </h4>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Events Timeline */}
            <Card className="border border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-slate-850 p-6 bg-slate-950/20">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-100">
                        <Server className="w-5 h-5 text-indigo-400" />
                        Nhật Ký Sự Kiện An Ninh (Security Events Log)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Các sự kiện vi phạm rate-limit, nỗ lực can thiệp logs, hoặc xâm phạm cô lập dữ liệu.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {events.length === 0 ? (
                        <div className="text-center py-12 text-emerald-400 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-450" />
                            <p className="font-bold text-sm">Hệ Thống An Toàn</p>
                            <p className="text-[10px] text-slate-500 mt-1">Không ghi nhận sự kiện vi phạm an ninh nào trong chu kỳ.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
                            {events.map((event, idx) => {
                                const isCritical = event.severity === 'CRITICAL';
                                const isWarning = event.severity === 'WARNING';
                                
                                return (
                                    <div key={event.id} className="relative pl-8 group">
                                        {/* Status Dot icon on border-l */}
                                        <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                                            isCritical ? 'bg-slate-950 border-rose-500 text-rose-500' :
                                            isWarning ? 'bg-slate-950 border-amber-500 text-amber-500' :
                                            'bg-slate-950 border-slate-600 text-slate-400'
                                        }`}>
                                            {isCritical ? <ShieldAlert className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                                        </div>

                                        {/* Event Card */}
                                        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                                        isCritical ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                        isWarning ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-slate-800 text-slate-400 border-slate-700'
                                                    }`}>
                                                        {event.severity}
                                                    </span>
                                                    <span className="text-xs font-black text-slate-200 tracking-tight">{event.action.toUpperCase()}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">({event.table_name || 'System-level'})</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                                                    <span>{new Date(event.created_at).toLocaleString('vi-VN')}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-350 leading-relaxed mb-3">
                                                {event.details?.reason || event.details?.message || `Phát hiện hành động '${event.action}' trên tài nguyên '${event.table_name || 'system'}'.`}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400 font-medium border-t border-slate-900 pt-2.5 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5 text-slate-600" />
                                                    <span>Nhân sự: <span className="font-semibold text-slate-300">{event.user_email || 'guest/anonymous'}</span></span>
                                                </div>
                                                <div className="hidden sm:block text-slate-700">|</div>
                                                <div className="flex items-center gap-1">
                                                    <Fingerprint className="w-3.5 h-3.5 text-slate-600" />
                                                    <span>IP Client: <span className="font-mono text-slate-300">{event.ip_address || 'N/A'}</span></span>
                                                </div>
                                                <div className="hidden sm:block text-slate-700">|</div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                                                        event.risk_score >= 75 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' :
                                                        event.risk_score >= 35 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                                                    }`}>
                                                        {event.risk_score} CRS
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
