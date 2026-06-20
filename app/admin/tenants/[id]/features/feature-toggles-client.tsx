'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Loader2, Newspaper, Heart, CreditCard, Library, CalendarCheck, Users } from 'lucide-react';
import { updateTenantConfig } from '@/app/actions/admin/tenants';
import { useRouter } from 'next/navigation';

interface FeatureTogglesClientProps {
    tenantId: string;
    initialConfig: Record<string, boolean>;
}

const MODULE_DEF = [
    { id: 'news_events', name: 'News & Article', icon: Newspaper, desc: 'Manage and display news and articles.' },
    { id: 'dharma_talks', name: 'Documents & SOP Training', icon: Heart, desc: 'Module managing instructional documents, video SOPs, and internal training resources.' },
    { id: 'transactions', name: 'Transaction (Payment)', icon: CreditCard, desc: 'Allows payments and donations. DISABLE IF THERE IS A SECURITY INCIDENT.', isCritical: true },
    { id: 'digital_library', name: 'Digital Library', icon: Library, desc: 'Documents, textbooks, and digital media resources.' },
    { id: 'registrations', name: 'Registration Forms', icon: CalendarCheck, desc: 'Registration for events and volunteering.' },
    { id: 'monk_profiles', name: 'Staff Profiles', icon: Users, desc: 'Manage and display monastic and organizational staff profiles.' },
];

export function FeatureTogglesClient({ tenantId, initialConfig }: FeatureTogglesClientProps) {
    const [config, setConfig] = useState<Record<string, boolean>>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleToggle = (id: string, checked: boolean) => {
        setConfig(prev => ({ ...prev, [id]: checked }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('id', tenantId);
            formData.append('modules_config', JSON.stringify(config));
            
            const result = await updateTenantConfig(formData);
            if (result.error) throw new Error(result.error);
            
            toast.success('Saved module configuration successfully!');
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || 'An error occurred while saving configuration');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-white/[0.08] bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-white">Module List</CardTitle>
                <CardDescription className="text-slate-400">
                    Enable/disable system modules. When disabled, the corresponding API endpoints and UI components will be deactivated.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {MODULE_DEF.map(mod => {
                        const Icon = mod.icon;
                        const isEnabled = config[mod.id] !== false; // Default true if undefined
                        
                        return (
                            <div key={mod.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-lg border flex-shrink-0 ${isEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold ${isEnabled ? 'text-white' : 'text-slate-400'}`}>{mod.name}</h3>
                                            {mod.isCritical && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase font-black tracking-wider">High Risk</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">{mod.desc}</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => handleToggle(mod.id, checked)}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-bold min-w-[140px]"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
