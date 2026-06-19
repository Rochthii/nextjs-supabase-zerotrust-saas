'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
    userEmail: string;
    userId?: string;
}

export function AnomalyActionButtons({ userEmail, userId }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleForceLogout = async () => {
        if (!confirm(`Bạn có chắc chắn muốn ép sign out (Force Logout) account ${userEmail}?`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/security/force-logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, userEmail }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to force logout');

            // Refresh các Server Component trên page
            router.refresh();

            toast.success(data.message || `Đã sign out ${userEmail}`);
        } catch (error: any) {
            toast.error(error.message || 'Error sign out');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
                variant="destructive" 
                size="sm" 
                className="h-7 text-[10px] px-2 gap-1"
                onClick={handleForceLogout}
                disabled={loading}
                title="Ép user sign out ngay lập tức"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                Force Logout
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] px-2 gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                disabled={true}
                title="Chức năng đang phát triển"
            >
                <ShieldAlert className="w-3 h-3" />
                Suspend (TBD)
            </Button>
        </div>
    );
}
