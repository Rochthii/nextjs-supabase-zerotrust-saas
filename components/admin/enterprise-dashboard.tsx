'use client';

import React from 'react';
import {
    Newspaper,
    Users,
    Activity,
    ArrowRight,
    FileText,
    Settings,
    Mail,
    Boxes,
    MonitorDot,
    TrendingUp,
    Globe,
    Sparkles,
    Shield,
    ShieldCheck,
    UserCheck,
    Clock,
    Zap,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';

interface EnterpriseDashboardUIProps {
    tenantId: string;
    tenantName: string;
    tenantType?: string;
    unreadCount: number;
    newsCount: number;
    eventsCount: number;
    pendingRegistrations: number;
    auditLogsCount: number;
    recentNews: any[];
    recentRegistrations: any[];
    recentAuditLogs: any[];
}

export function EnterpriseDashboardUI({
    tenantId,
    tenantName,
    tenantType = 'company',
    newsCount,
    eventsCount,
    pendingRegistrations,
    auditLogsCount,
    recentNews,
    recentRegistrations,
    recentAuditLogs,
    unreadCount,
}: EnterpriseDashboardUIProps) {
    const base = `/admin/t/${tenantId}`;

    const kpiCards = [
        {
            title: 'Article & Content',
            value: newsCount,
            icon: Newspaper,
            change: 'Content active',
            accent: 'from-indigo-600 to-violet-600',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/30',
            text: 'text-indigo-400',
            glow: 'shadow-indigo-500/10',
        },
        {
            title: 'Event & Lịch trình',
            value: eventsCount,
            icon: Activity,
            change: 'Update time thực',
            accent: 'from-sky-600 to-blue-600',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/30',
            text: 'text-sky-400',
            glow: 'shadow-sky-500/10',
        },
        {
            title: 'Tenant & Leads',
            value: pendingRegistrations,
            icon: UserCheck,
            change: 'Tổng registration event',
            accent: 'from-emerald-600 to-teal-600',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            glow: 'shadow-emerald-500/10',
        },
        {
            title: 'Nhật ký An ninh',
            value: auditLogsCount,
            icon: Shield,
            change: 'Hành động được audit',
            accent: 'from-violet-600 to-purple-600',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/30',
            text: 'text-violet-400',
            glow: 'shadow-violet-500/10',
        },
    ];

    const quickActions = [
        { href: `${base}/news/new`, label: 'Đăng content mới', icon: Newspaper, desc: 'News, thông cáo báo chí' },
        { href: `${base}/events/new`, label: 'Tạo event', icon: Activity, desc: 'Hội thảo, webinar, gặp gỡ' },
        { href: `${base}/pages`, label: 'Quản lý page', icon: FileText, desc: 'Landing page, about' },
        { href: `${base}/messages`, label: 'Phản hồi tenant', icon: Mail, desc: 'CRM & Tin nhắn contact' },
        { href: `${base}/organizations`, label: 'Mạng lưới đối tác', icon: Boxes, desc: 'Quản lý hệ sinh thái' },
        { href: `${base}/homepage`, label: 'Website Builder', icon: Sparkles, desc: 'Tùy biến homepage' },
    ];

    const statusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'published':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Đã confirm
                    </span>
                );
            case 'pending':
            case 'draft':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-2.5 h-2.5" /> Pending Review
                    </span>
                );
            case 'cancelled':
            case 'archived':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                        <XCircle className="w-2.5 h-2.5" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400 border border-slate-700">
                        {status}
                    </span>
                );
        }
    };

    const auditActionLabel = (action: string) => {
        const map: Record<string, { label: string; color: string }> = {
            INSERT: { label: 'Create', color: 'text-emerald-400' },
            UPDATE: { label: 'Update', color: 'text-sky-400' },
            DELETE: { label: 'Delete', color: 'text-red-400' },
            LOGIN: { label: 'Sign in', color: 'text-violet-400' },
            LOGOUT: { label: 'Sign out', color: 'text-slate-400' },
        };
        const m = map[action?.toUpperCase()] ?? { label: action, color: 'text-slate-400' };
        return <span className={`text-[11px] font-black ${m.color}`}>{m.label}</span>;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Hero Header ───────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl">
                {/* ambient glows */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {tenantName}
                            </h1>
                            <span className="hidden sm:flex px-3 py-1 bg-indigo-600/30 text-indigo-300 text-[10px] font-black rounded-full border border-indigo-500/30 uppercase tracking-widest items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                {tenantType === 'ngo' ? 'NGO Workspace' : 'Enterprise'}
                            </span>
                        </div>
                        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                            Trung tâm điều hành content & vận hành doanh nghiệp. Theo dõi hoạt động, quản lý nhân sự và tương tác tenant theo time thực.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 backdrop-blur-md rounded-xl border border-emerald-500/20 shrink-0">
                        <MonitorDot className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Unread Messages Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-md border p-5 hover:shadow-xl transition-all duration-500 border-indigo-500/30 hover:shadow-indigo-500/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border bg-indigo-500/10 border-indigo-500/30">
                            <Mail className="h-5 w-5 text-indigo-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tin nhắn chưa đọc</p>
                        <h3 className="text-3xl font-black text-indigo-400 tracking-tight">{unreadCount}</h3>
                        <p className="text-[11px] mt-1.5 text-indigo-400 opacity-70">
                            {unreadCount > 0 ? (
                                <Link href={`${base}/messages?status=unread`} className="hover:underline font-bold">
                                    View {unreadCount} tin nhắn mới
                                </Link>
                            ) : (
                                'None tin nhắn mới'
                            )}
                        </p>
                    </div>
                </div>

                {kpiCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className={`group relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-md border p-5 hover:shadow-xl transition-all duration-500 ${card.border} hover:shadow-${card.glow}`}
                        >
                            {/* subtle glow on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                            <div className="relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${card.bg} ${card.border}`}>
                                    <Icon className={`h-5 w-5 ${card.text}`} />
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{card.title}</p>
                                <h3 className={`text-3xl font-black ${card.text} tracking-tight`}>{card.value}</h3>
                                <p className={`text-[11px] mt-1.5 ${card.text} opacity-70`}>{card.change}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Main Content Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left: Recent News + Recent Leads ──────────────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Recent News */}
                    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-500/15 rounded-lg border border-indigo-500/20">
                                    <Newspaper className="w-4 h-4 text-indigo-400" />
                                </div>
                                <h2 className="text-sm font-black text-white">News latest</h2>
                            </div>
                            <Link href={`${base}/news`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-800/60">
                            {recentNews.length === 0 ? (
                                <p className="px-6 py-6 text-sm text-slate-500 italic">Chưa có news nào.</p>
                            ) : recentNews.map((item: any) => (
                                <div key={item.id} className="flex items-start gap-3 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 line-clamp-1">{item.title_vi}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {formatDate(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </p>
                                    </div>
                                    {statusBadge(item.status)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Registrations (Leads) */}
                    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-500/15 rounded-lg border border-emerald-500/20">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white">Registration Event Recent</h2>
                                    <p className="text-[10px] text-slate-500">CRM & Leads Management</p>
                                </div>
                            </div>
                            <Link href={`${base}/events`} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-800/60">
                            {recentRegistrations.length === 0 ? (
                                <p className="px-6 py-6 text-sm text-slate-500 italic">Chưa có registration nào.</p>
                            ) : recentRegistrations.map((reg: any) => (
                                <div key={reg.id} className="flex items-start gap-3 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                        <UserCheck className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 truncate">{reg.full_name || 'Unknown'}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{reg.email}</p>
                                        <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                                            {(reg.events as any)?.title_vi ?? 'Event'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {statusBadge(reg.status)}
                                        <span className="text-[10px] text-slate-600">
                                            {formatDate(new Date(reg.created_at), 'dd/MM HH:mm', { locale: vi })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Quick Actions + Audit Trail ────────────────────── */}
                <div className="space-y-5">

                    {/* Quick Actions */}
                    <div className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800/80">
                                <div className="p-2 bg-indigo-500/15 rounded-lg border border-indigo-500/20">
                                    <Zap className="w-4 h-4 text-indigo-400" />
                                </div>
                                <h2 className="text-sm font-black text-white">Actions nhanh</h2>
                            </div>
                            <ul className="p-3 space-y-1.5">
                                {quickActions.map((action, idx) => (
                                    <li key={idx}>
                                        <Link
                                            href={action.href}
                                            className="flex items-center gap-3 p-3 rounded-xl border bg-slate-900/50 border-slate-800/60 hover:bg-slate-800 hover:border-indigo-500/40 transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-800 border border-slate-700 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40 transition-colors">
                                                <action.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{action.label}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{action.desc}</p>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Workspace Audit Trail */}
                    <div className="rounded-2xl bg-slate-950 border border-violet-500/20 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-violet-500/15 rounded-lg border border-violet-500/20">
                                        <ShieldCheck className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-white">Nhật ký Security</h2>
                                        <p className="text-[10px] text-slate-500">Workspace Audit Trail</p>
                                    </div>
                                </div>
                                <Link href={`${base}/audit-logs`} className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                                    Details <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-800/60">
                                {recentAuditLogs.length === 0 ? (
                                    <p className="px-5 py-5 text-sm text-slate-500 italic">Chưa có log nào.</p>
                                ) : recentAuditLogs.map((log: any) => (
                                    <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                {auditActionLabel(log.action)}
                                                <span className="text-[10px] text-slate-600">trên</span>
                                                <span className="text-[10px] font-mono text-slate-500 truncate">{log.table_name}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 truncate">{log.user_email ?? 'System'}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-600 shrink-0 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {formatDate(new Date(log.created_at), 'dd/MM HH:mm', { locale: vi })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Impact Metric Strip ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Nền tảng', value: 'Multi-tenant SaaS', icon: Globe },
                    { label: 'Security', value: 'ISO 27001 Ready', icon: ShieldCheck },
                    { label: 'Uptime', value: '99.99%', icon: TrendingUp },
                    { label: 'Dữ liệu', value: 'RLS Enforced', icon: BarChart3 },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition-colors"
                    >
                        <item.icon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider truncate">{item.label}</p>
                            <p className="text-sm font-black text-white truncate">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
