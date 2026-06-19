'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
    AreaChart, Area, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import {
    Activity, Users, HeartHandshake, Landmark,
    Globe, Award, TrendingUp, Presentation,
    Heart, Target, HelpCircle, ArrowRight, LucideIcon, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { createClient } from '@/lib/supabase/client';
import { BRAND_NAME_VI } from '@/lib/constants';

// Map icon string names to actual Lucide components
const ICONS: Record<string, LucideIcon> = {
    Activity, Users, HeartHandshake, Landmark,
    Globe, Award, TrendingUp, Presentation,
    Heart, Target, HelpCircle
};

interface Metric {
    title: string;
    value: string | number;
    unit?: string;
    icon?: string;
    link?: string;
}

interface MonthlyData {
    name: string;
    orgs: number;
    projects: number;
    events: number;
}

interface StatsData {
    totalTransactions: string;
    totalIndividual: string;
    totalPartner: string;
    totalOrgs: number;
    activeProjects: number;
    totalEvents: number;
    beneficiaries: string;
}

interface ImpactDashboardProps {
    data?: BlockConfig;
    tenantId?: string;
}

export function ImpactDashboard({ data, tenantId }: ImpactDashboardProps) {
    const [mounted, setMounted] = useState(false);
    const content = data?.settings || {};

    const sectionBadge = content.sectionBadge || 'Dấu Ấn Xã Hội';
    const sectionTitleHtml = content.sectionTitleHtml || 'Tác Động <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Cộng Đồng.</span>';
    const sectionDesc = content.sectionDesc || `Dữ liệu được minh bạch hóa và tự động aggregate trực next time thực từ các hoạt động xã hội của hệ sinh thái ${BRAND_NAME_VI}.`;

    const [realStats, setRealStats] = useState<StatsData>({
        totalTransactions: '0',
        totalIndividual: '0',
        totalPartner: '0',
        totalOrgs: 0,
        activeProjects: 0,
        totalEvents: 0,
        beneficiaries: '0'
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(containerRef, {
        freezeOnceVisible: true,
        rootMargin: '600px',
    });
    const isVisible = !!entry?.isIntersecting;

    useEffect(() => {
        if (isVisible && !mounted) {
            setMounted(true);
            const fetchData = async () => {
                const supabase = await createClient() as any; 
                try {
                    // 1. Fetch Organizations
                    let orgsQuery = supabase
                        .from('organizations')
                        .select('created_at, total_donated')
                        .eq('is_active', true);
                    
                    if (tenantId) {
                        orgsQuery = orgsQuery.eq('tenant_id', tenantId);
                    }
                    const { data: orgs } = await orgsQuery;

                    // 2. Fetch Active Projects
                    let projectsQuery = supabase
                        .from('transaction_projects')
                        .select('created_at')
                        .eq('is_active', true)
                        .eq('type', 'specific_project');
                    
                    if (tenantId) {
                        projectsQuery = projectsQuery.eq('tenant_id', tenantId);
                    }
                    const { data: projects } = await projectsQuery;

                    // 3. Fetch Events
                    let eventsQuery = supabase
                        .from('events')
                        .select('created_at')
                        .in('status', ['completed', 'ongoing', 'upcoming']);
                    
                    if (tenantId) {
                        eventsQuery = eventsQuery.eq('tenant_id', tenantId);
                    }
                    const { data: events } = await eventsQuery;

                    const monthlyMap: Record<string, { orgs: number; projects: number; events: number }> = {};
                    const now = new Date();
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const monthName = `T${d.getMonth() + 1}`;
                        monthlyMap[monthName] = { orgs: 0, projects: 0, events: 0 };
                    }

                    if (orgs) {
                        orgs.forEach((o: any) => {
                            const date = new Date(o.created_at);
                            const monthName = `T${date.getMonth() + 1}`;
                            if (monthlyMap[monthName]) {
                                monthlyMap[monthName].orgs += 1;
                            }
                        });
                    }

                    // 4. Fetch Transactions
                    let transactionsQuery = supabase
                        .from('transactions')
                        .select('amount, created_at')
                        .eq('status', 'confirmed');
                    
                    if (tenantId) {
                        transactionsQuery = transactionsQuery.eq('tenant_id', tenantId);
                    }
                    const { data: transactions } = await transactionsQuery;

                    let totalIndividualAmount = 0;
                    if (transactions) {
                        transactions.forEach((d: any) => {
                            totalIndividualAmount += Number(d.amount || 0);
                        });
                    }

                    if (projects) {
                        projects.forEach((p: any) => {
                            const date = new Date(p.created_at);
                            const monthName = `T${date.getMonth() + 1}`;
                            if (monthlyMap[monthName]) {
                                monthlyMap[monthName].projects += 1;
                            }
                        });
                    }

                    if (events) {
                        events.forEach((e: any) => {
                            const date = new Date(e.created_at);
                            const monthName = `T${date.getMonth() + 1}`;
                            if (monthlyMap[monthName]) {
                                monthlyMap[monthName].events += 1;
                            }
                        });
                    }

                    const chartData = Object.entries(monthlyMap).map(([name, data]) => ({
                        name,
                        orgs: data.orgs,
                        projects: data.projects,
                        events: data.events
                    }));

                    let runningOrgs = 0;
                    const cumulativeChartData = chartData.map(d => {
                        runningOrgs += d.orgs;
                        return { ...d, orgs: runningOrgs > 0 ? runningOrgs : 1 };
                    });

                    setMonthlyData(cumulativeChartData);

                    let totalAmt = 0;
                    if (orgs) {
                        orgs.forEach((o: any) => {
                            if (o.total_donated) {
                                totalAmt += Number(o.total_donated);
                            }
                        });
                    }

                    const formatCompact = (num: number) => {
                        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' Tỷ';
                        if (num >= 1000000) return (num / 1000000).toFixed(1) + ' Tr';
                        return new Intl.NumberFormat('vi-VN').format(num);
                    };

                    const totalOrgsCount = orgs?.length || 0;
                    const totalProjectsCount = projects?.length || 0;
                    const totalEventsCount = events?.length || 0;

                    const combinedAmount = totalAmt + totalIndividualAmount;

                    setRealStats({
                        totalTransactions: formatCompact(combinedAmount),
                        totalIndividual: formatCompact(totalIndividualAmount),
                        totalPartner: formatCompact(totalAmt),
                        totalOrgs: totalOrgsCount,
                        activeProjects: totalProjectsCount,
                        totalEvents: totalEventsCount,
                        beneficiaries: (totalProjectsCount * 50).toString() + '+'
                    });
                } catch (error) {
                    console.error("Error fetching impact data:", error);
                }
            };
            fetchData();
        }
    }, [isVisible, mounted]);

    const metrics: Metric[] = content.metrics || [
        {
            title: content.stat2Title || 'Event Gắn kết',
            value: content.stat2Value || realStats.totalEvents,
            icon: 'Activity'
        },
        {
            title: content.stat3Title || 'Project Xã hội Đang triển khai',
            value: content.stat3Value || realStats.activeProjects,
            icon: 'HeartHandshake'
        },
    ];

    const stat1Value = content.stat1Value || realStats.totalTransactions;
    const stat1Title = content.stat1Title || 'Tổng Fund Vì Cộng Đồng';
    const stat1Sub = content.stat1Sub || `Ghi nhận từ ${realStats.totalOrgs} organization`;
    const stat1Link = content.stat1Link || '#';

    const chart1Title = content.chart1Title || 'Chart Open rộng Mạng lưới';
    const chart1Percent = content.chart1Percent || '+15.2%';
    const chart2Title = content.chart2Title || 'Project Xã hội theo Tháng';

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    if (!mounted) {
        return <div ref={containerRef} className="py-24 min-h-[600px] bg-[#070A0F] flex items-center justify-center text-gray-400 animate-pulse">Loading chart...</div>;
    }

    return (
        <section ref={containerRef} className="relative py-28 overflow-hidden bg-[#070A0F] text-white">
            {/* Background Glow Overlays */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-b from-emerald-500/5 to-transparent blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-t from-teal-500/5 to-transparent blur-[120px]" />
            </div>

            <div className="container relative z-10 px-6 mx-auto max-w-7xl">
                
                {/* Header Title Grid */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                        >
                            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">{sectionBadge}</span>
                        </motion.div>
                        
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white"
                            dangerouslySetInnerHTML={{ __html: sectionTitleHtml }}
                        />
                    </div>
                    
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 font-light max-w-md md:text-right leading-relaxed"
                    >
                        {sectionDesc}
                    </motion.p>
                </div>

                {/* Dashboard Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {/* Stat Card 1: Main Highlight (Audit / Cumulative Donated) */}
                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-[#0F1D1A] to-[#080E13] border border-emerald-500/20 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150 pointer-events-none" />
                        <a href={stat1Link} className="relative z-10 flex flex-col h-full justify-between hover:no-underline">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <HeartHandshake className="w-5.5 h-5.5 text-emerald-400" />
                                </div>
                                <h3 className="font-extrabold text-slate-300 uppercase tracking-widest text-[11px]">{stat1Title}</h3>
                            </div>
                            
                            <div>
                                <div className="text-5xl lg:text-6xl xl:text-7.5xl font-black tracking-tight mb-6 text-white leading-none">{stat1Value}</div>
                                <div className="flex flex-col sm:flex-row gap-6 mt-6 bg-white/[0.01] p-5 rounded-2xl backdrop-blur-md border border-white/[0.05]">
                                    <div className="flex-1">
                                        <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Heart className="w-3 h-3 text-emerald-400" /> Close góp
                                        </p>
                                        <p className="text-2xl font-black text-white">{realStats.totalIndividual}</p>
                                    </div>
                                    
                                    <div className="w-px bg-white/10 hidden sm:block"></div>
                                    
                                    <div className="flex-1">
                                        <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Building2 className="w-3 h-3 text-amber-400" /> Đối Tác Close Góp
                                        </p>
                                        <p className="text-2xl font-black text-white">{realStats.totalPartner}</p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </motion.div>

                    {/* Chart Card 1 (Network Growth) */}
                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 p-8 rounded-[2rem] bg-white/[0.01] backdrop-blur-md border border-white/[0.04] hover:border-[#00F2FF]/20 shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">{chart1Title}</h3>
                            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">{chart1Percent}</span>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorImpactOrgs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="orgs" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorImpactOrgs)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Dynamic Metrics Cards */}
                    {metrics.map((metric, idx) => {
                        const Icon = metric.icon && ICONS[metric.icon] ? ICONS[metric.icon] : HelpCircle;
                        return (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="p-8 rounded-[2rem] bg-white/[0.01] backdrop-blur-md border border-white/[0.04] hover:border-emerald-500/30 shadow-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 group-hover:bg-emerald-500/10 transition-colors duration-300">
                                        <Icon className="w-5.5 h-5.5 text-emerald-400" />
                                    </div>
                                    {metric.link && (
                                        <a href={metric.link} className="text-slate-500 hover:text-emerald-400 transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-white tracking-tight mb-2">
                                        {metric.value}{metric.unit}
                                    </div>
                                    <h3 className="font-extrabold text-slate-500 text-[10px] uppercase tracking-widest leading-none">{metric.title}</h3>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Chart Card 2: Projects by Month */}
                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 p-8 rounded-[2rem] bg-white/[0.005] border border-dashed border-white/10 shadow-inner flex flex-col justify-between">
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 mb-6">{chart2Title}</h3>
                        <div className="h-[140px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <Tooltip
                                        cursor={{ fill: 'rgba(16,185,129,0.04)' }}
                                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#fff' }}
                                    />
                                    <Bar dataKey="projects" radius={[6, 6, 0, 0]}>
                                        {monthlyData.map((entry: MonthlyData, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#10B981' : 'rgba(255,255,255,0.1)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
}

export default ImpactDashboard;
