'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Network, Save, Loader2, Lock, Send } from 'lucide-react';
import { updateTenantSecuritySettings } from '@/app/actions/admin/tenants';
import { toast } from 'sonner';

interface Props {
    tenantId: string;
    initialConfig: {
        require_2fa?: boolean;
        ip_whitelist?: string;
        telegram_chat_id?: string;
    };
}

export function SecuritySettingsForm({ tenantId, initialConfig }: Props) {
    const [require2FA, setRequire2FA] = useState(initialConfig.require_2fa || false);
    const [ipWhitelist, setIpWhitelist] = useState(initialConfig.ip_whitelist || '');
    const [telegramChatId, setTelegramChatId] = useState(initialConfig.telegram_chat_id || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateTenantSecuritySettings(tenantId, {
                require_2fa: require2FA,
                ip_whitelist: ipWhitelist.trim(),
                telegram_chat_id: telegramChatId.trim(),
            });

            if (result.success) {
                toast.success('Security configurations saved successfully');
            } else {
                toast.error(result.error || 'Error saving security configurations');
            }
        } catch (error: any) {
            toast.error(error.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-indigo-500/5 dark:bg-indigo-950/10 border-b border-indigo-100/50 dark:border-indigo-900/20 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Lock className="w-5 h-5" /> Security Policy Settings (Tenant Policy)
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
                    Control access and security verification for your branch.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* 2FA Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <Label htmlFor="require-2fa" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Enforce Two-Factor Authentication (2FA)
                            </Label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                                Enforce all staff to configure 2FA (TOTP/SMS) before gaining access to the branch administration panel.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <Switch
                            id="require-2fa"
                            checked={require2FA}
                            onCheckedChange={setRequire2FA}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>
                </div>

                {/* IP Whitelist */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="ip-whitelist" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Access IP Whitelist
                            </Label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 max-w-md">
                                Only allow sign-ins from this list of IP addresses (separated by commas). Leave empty to allow all.
                            </p>
                            <Input
                                id="ip-whitelist"
                                placeholder="e.g. 192.168.1.1, 203.113.120.4"
                                value={ipWhitelist}
                                onChange={(e) => setIpWhitelist(e.target.value)}
                                className="font-mono text-sm bg-white dark:bg-slate-950"
                            />
                        </div>
                    </div>
                </div>

                {/* Telegram Chat ID */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                            <Send className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="telegram-chat-id" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Telegram Chat ID (Emergency SOC Alerts)
                            </Label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 max-w-md">
                                The SOC system will submit real-time security alerts and emergency validation codes to this Chat ID when incidents are detected.
                            </p>
                            <Input
                                id="telegram-chat-id"
                                placeholder="e.g. -1002187654321 or 540987654"
                                value={telegramChatId}
                                onChange={(e) => setTelegramChatId(e.target.value)}
                                className="font-mono text-sm bg-white dark:bg-slate-950"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
