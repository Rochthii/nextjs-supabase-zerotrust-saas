'use client';

import { useState, useTransition } from 'react';
import { suspendTenant, reactivateTenant } from '@/app/actions/admin/tenants';
import { useRouter } from 'next/navigation';

interface LifecycleActionsProps {
    tenantId: string;
    currentStatus: string;
    tenantName: string;
}

export function LifecycleActions({ tenantId, currentStatus, tenantName }: LifecycleActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const router = useRouter();

    const isSuspended = currentStatus === 'suspended';

    const handleSuspend = () => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn ĐÌNH CHỈ workspace "${tenantName}"?\n\nHành động này sẽ đánh dấu workspace là tạm ngừng hoạt động và write log audit.`
        );
        if (!confirmed) return;

        setError(null);
        setSuccessMsg(null);
        startTransition(async () => {
            const result = await suspendTenant(tenantId);
            if (result.success) {
                setSuccessMsg('Workspace đã được đình chỉ successfully.');
                router.refresh();
            } else {
                setError(result.error || 'Error unknown.');
            }
        });
    };

    const handleReactivate = () => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn KÍCH HOẠT LẠI workspace "${tenantName}"?\n\nWorkspace sẽ trở về status hoạt động bình thường.`
        );
        if (!confirmed) return;

        setError(null);
        setSuccessMsg(null);
        startTransition(async () => {
            const result = await reactivateTenant(tenantId);
            if (result.success) {
                setSuccessMsg('Workspace đã được activate lại successfully.');
                router.refresh();
            } else {
                setError(result.error || 'Error unknown.');
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Feedback messages */}
            {error && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span>{error}</span>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
                {!isSuspended && (
                    <button
                        onClick={handleSuspend}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/40 hover:border-amber-500/50 hover:text-amber-100 active:scale-95"
                    >
                        {isPending ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Đang process...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                </svg>
                                Đình chỉ Workspace
                            </>
                        )}
                    </button>
                )}

                {isSuspended && (
                    <button
                        onClick={handleReactivate}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/40 hover:border-emerald-500/50 hover:text-emerald-100 active:scale-95"
                    >
                        {isPending ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Đang process...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                Activate lại Workspace
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
