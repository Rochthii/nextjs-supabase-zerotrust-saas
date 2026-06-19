'use client';

import React, { useState } from 'react';
import { Send, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityReportButtonProps {
    tenantId?: string | null;
}

export function SecurityReportButton({ tenantId = null }: SecurityReportButtonProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSendReport = async () => {
        setLoading(true);
        setSuccess(false);
        
        try {
            const res = await fetch('/api/admin/security/telegram-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setSuccess(true);
                toast.success(data.message || 'Đã submit report qua Telegram successfully!');
                // Reset status successfully sau 4s
                setTimeout(() => setSuccess(false), 4000);
            } else {
                throw new Error(data.error || 'Submit report failed');
            }
        } catch (err: any) {
            console.error('Failed to send telegram report:', err);
            toast.error(`Error xuất report: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSendReport}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-md ${
                success
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] scale-102 border-none'
                    : 'bg-slate-950/80 hover:bg-slate-900 border border-amber-500/25 hover:border-amber-500/55 text-amber-400 hover:text-amber-300 shadow-inner'
            }`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Đang tạo report AI SOC...</span>
                </>
            ) : success ? (
                <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950 animate-bounce" />
                    <span>Đã submit qua Telegram!</span>
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <Send className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Xuất & Submit Report qua Telegram</span>
                </>
            )}
        </button>
    );
}
