'use client';

import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { ShieldCheck, Layers, LayoutGrid, ShieldAlert, Activity } from 'lucide-react';

interface DashboardChartsProps {
    planChartData: { name: string; active: number; trial: number; suspended: number }[];
    featureChartData: { name: string; value: number; percentage: number }[];
    resourceChartData: { name: string; 'Security Logs': number; 'Blocked IPs': number; total: number }[];
    securityActionData: { name: string; value: number }[];
    hourlyTimeline: { hour: string; count: number }[];
}

// Curated Harmonic Colors
const PLAN_COLORS = {
    active: '#10b981',    // Emerald
    trial: '#3b82f6',     // Blue
    suspended: '#f43f5e'  // Rose
};

const ACTION_COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
];

// Glassmorphism Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl">
                <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                            <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: item.color || item.fill }} 
                            />
                            <span className="text-xs font-medium text-slate-200">
                                {item.name}: <strong className="text-white font-black">{item.value}</strong>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function DashboardCharts({
    planChartData,
    featureChartData,
    resourceChartData,
    securityActionData,
    hourlyTimeline
}: DashboardChartsProps) {
    return (
        <div className="space-y-8">
            {/* Row 1: Resource Isolation Map & Module Adoption */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ý tưởng A: Resource Isolation Weight Chart */}
                <div className="border border-slate-200 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                                <Layers className="w-3.5 h-3.5" /> Ý tưởng A: Phân bổ dữ liệu
                            </span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Bản đồ Sự kiện An ninh Cô lập (Data Isolation)</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Giám sát tổng lượng log an ninh và IP bị chặn của các doanh nghiệp hàng đầu</p>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={resourceChartData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    tickLine={false} 
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} 
                                    iconType="circle"
                                />
                                <Bar dataKey="Security Logs" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Blocked IPs" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ý tưởng B: Module & Feature Adoption Rate Chart */}
                <div className="border border-slate-200 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                                <LayoutGrid className="w-3.5 h-3.5" /> Ý tưởng B: Configuration authorization
                            </span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Tỷ lệ Activate Module Tính năng</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tỷ lệ các doanh nghiệp đã activate các tính năng/tiện ích nâng cao</p>
                        </div>
                    </div>

                    <div className="h-80 w-full flex flex-col justify-center">
                        <div className="space-y-5">
                            {featureChartData.map((item, idx) => {
                                const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                                            <span className="text-slate-500 dark:text-slate-400">{item.value} doanh nghiệp ({item.percentage}%)</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-inner">
                                            <div 
                                                className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-1000 relative`}
                                                style={{ width: `${item.percentage}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                Chính sách security RLS bảo vệ cô lập dữ liệu 100% khi activate chéo các module giữa các organization khác nhau trên cùng database.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: SOC Security Distribution & Tenant Lifecycle Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ý tưởng C: SOC Security Activity Logs */}
                <div className="border border-slate-200 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                                <ShieldAlert className="w-3.5 h-3.5" /> Ý tưởng C: SOC Security Command
                            </span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Cơ cấu Hành vi & Nhật ký SOC (24h)</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Phân bổ hoạt động hành vi quản trị system đa tenant</p>
                        </div>
                    </div>

                    <div className="h-80 w-full flex flex-col md:flex-row items-center gap-6">
                        <div className="h-full w-full md:w-1/2">
                            {securityActionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={securityActionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {securityActionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={ACTION_COLORS[index % ACTION_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                                    None hoạt động logs trong 24h qua.
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-1/2 space-y-3">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chú giải hành vi giám sát</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {securityActionData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span 
                                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                                            style={{ backgroundColor: ACTION_COLORS[idx % ACTION_COLORS.length] }} 
                                        />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                                            {item.name}: <strong className="text-slate-900 dark:text-white font-black">{item.value}</strong>
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 font-semibold leading-relaxed">
                                * Actions <strong className="text-rose-500 font-black">DELETE</strong> được system security SOC giám sát đặc quyền và ghi audit log bất biến.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ý tưởng D: SaaS Subscription Lifecycle stacked bars */}
                <div className="border border-slate-200 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                                <Activity className="w-3.5 h-3.5" /> Ý tưởng D: Vòng đời tenant
                            </span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Cơ cấu Subscription Plan & Vòng đời</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Phân bổ doanh nghiệp theo gói registration lồng ghép với status hoạt động</p>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={planChartData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    tickLine={false} 
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} 
                                    iconType="circle"
                                />
                                <Bar dataKey="active" name="Active" stackId="plan" fill={PLAN_COLORS.active} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="trial" name="Dùng thử (Trial)" stackId="plan" fill={PLAN_COLORS.trial} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="suspended" name="Bị khóa (Suspended)" stackId="plan" fill={PLAN_COLORS.suspended} radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: SOC Hourly Audit Logs Area Chart (Command Level) */}
            <div className="border border-slate-200 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] bg-slate-950 text-white p-8 relative overflow-hidden group">
                {/* Grid overlays */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> GIÁM SÁT AN NINH TOÀN HỆ THỐNG
                        </span>
                        <h3 className="text-xl font-black text-white">Chart Nhật ký Active SOC (Audit Logs Hourly Timeline)</h3>
                        <p className="text-xs text-slate-400 mt-1">Giám sát tổng tần suất hoạt động system theo khung giờ trong 24 giờ qua</p>
                    </div>
                    <div className="flex items-center gap-2.5 px-4.5 py-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Theo dõi Realtime</span>
                    </div>
                </div>

                <div className="relative z-10 h-72 w-full">
                    {hourlyTimeline.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={hourlyTimeline}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                                <XAxis 
                                    dataKey="hour" 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    tickLine={false} 
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    fontWeight="bold"
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    name="Audit Logs"
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorLogs)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                            None hoạt động audit logs trong 24h qua.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
