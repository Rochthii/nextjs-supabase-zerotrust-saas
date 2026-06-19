'use client';

import React, { useEffect, useState } from 'react';
import { getVisitorStats } from '@/lib/analytics';

export function VisitorCounter() {
    const [stats, setStats] = useState({ online: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getVisitorStats();
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        // Fetch immediately
        fetchStats();

        // Refresh every 30 seconds to keep "Online" count somewhat live
        const intervalId = setInterval(fetchStats, 30000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) return null; // Or a tiny skeleton if preferred

    return (
        <div className="flex flex-col gap-1 text-[11px] text-gray-500 font-medium">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Đang online: <span className="text-gray-300">{stats.online}</span></span>
            </div>
            <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Tổng truy cập: <span className="text-gray-300">{stats.total.toLocaleString('vi-VN')}</span></span>
            </div>
        </div>
    );
}
