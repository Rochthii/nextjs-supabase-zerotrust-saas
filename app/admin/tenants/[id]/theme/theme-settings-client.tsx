'use client';

import React, { useTransition } from 'react';
import { updateThemeSettings } from '@/app/actions/admin/theme';
import { LiveThemeEditor } from '@/components/admin/live-theme-editor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ThemeSettingsClientProps {
    initialSettings: Record<string, string>;
    tenantId: string;
    tenantName: string;
    tenantType?: string;
}

export function ThemeSettingsClient({ initialSettings, tenantId, tenantType }: ThemeSettingsClientProps) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('tenant_id', tenantId);

        startTransition(async () => {
            try {
                const result = await updateThemeSettings(formData);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Saved interface settings successfully! Branch web pages will update immediately.');
                }
            } catch (error: any) {
                toast.error(error.message || 'An unknown error occurred.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
                <LiveThemeEditor initialSettings={initialSettings} tenantType={tenantType} />
            </div>

            <div className="flex items-center gap-4 mt-6 sticky bottom-0 bg-slate-950/60 backdrop-blur-md py-4 border-t border-white/[0.08] px-1 rounded-b-xl z-20">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 h-11 border border-amber-500/20"
                >
                    {isPending ? 'Saving...' : 'Save Interface'}
                </Button>
                <p className="text-xs text-slate-400">
                    Changes will take effect immediately after saving and cache refresh.
                </p>
            </div>
        </form>
    );
}
