'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTenant, updateTenant, Tenant } from '@/app/actions/admin/tenants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
    Building2, Globe, Tag, Save, Loader2, LayoutTemplate, Check, Info, 
    MapPin, User, ScrollText, Sunrise, Bell, Shield, Layers, Leaf, Eye, 
    Zap, Settings, Lock, CheckSquare, Sliders, AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface TenantFormProps {
    mode: 'create' | 'edit';
    tenant?: Tenant;
    role?: string;
    formMode?: 'app-only' | 'default';
}

export function TenantForm({ mode, tenant, role, formMode }: TenantFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    
    // Core States
    const [layoutStyle, setLayoutStyle] = useState(tenant?.layout_style || 'saas_violet');
    const [tenantType, setTenantType] = useState<string>(tenant?.tenant_type || 'company');
    const [domainValue, setDomainValue] = useState(tenant?.domain || '');
    const [hasWebFrontend, setHasWebFrontend] = useState(tenant?.has_web_frontend !== false);
    
    // SaaS Settings States
    const [planType, setPlanType] = useState<string>(tenant?.plan_type || 'free');
    const [lifecycleStatus, setLifecycleStatus] = useState<string>(tenant?.lifecycle_status || 'active');
    const [resetDefaultBlocks, setResetDefaultBlocks] = useState(false);
    
    // Modules Config States
    const [moduleNews, setModuleNews] = useState(tenant?.modules_config?.news !== false);
    const [moduleEvents, setModuleEvents] = useState(tenant?.modules_config?.events !== false);
    const [moduleLibrary, setModuleLibrary] = useState(tenant?.modules_config?.library !== false);
    const [moduleTransactions, setModuleTransactions] = useState(tenant?.modules_config?.transactions !== false);
    const [moduleJobs, setModuleJobs] = useState(tenant?.modules_config?.jobs === true);
    
    // SOC Alerts State
    const [telegramChatId, setTelegramChatId] = useState(tenant?.modules_config?.security_settings?.telegram_chat_id || '');

    const isCustomDomain = domainValue && !domainValue.endsWith('.vercel.app') && domainValue !== 'localhost';

    // ── LAYOUT OPTIONS ──
    const LAYOUT_OPTIONS = [
        { 
            id: 'saas_violet', 
            name: 'Violet Premium', 
            icon: Layers, 
            border: 'border-violet-600', 
            text: 'text-violet-400', 
            desc: 'High-tech SaaS style, modern and groundbreaking.' 
        },
        { 
            id: 'corp_navy', 
            name: 'Corporate Navy', 
            icon: Shield, 
            border: 'border-blue-600', 
            text: 'text-blue-400', 
            desc: 'Traditional Navy Blue, reputable and professional for corporations.' 
        },
        { 
            id: 'modern_tech', 
            name: 'Cyberpunk Neon Tech', 
            icon: Zap, 
            border: 'border-cyan-500', 
            text: 'text-cyan-400', 
            desc: 'Neon Cyan high-tech design, minimalist and breakthrough for SaaS products.' 
        },
        { 
            id: 'charity_green', 
            name: 'Social Green', 
            icon: Leaf, 
            border: 'border-emerald-600', 
            text: 'text-emerald-400', 
            desc: 'Friendly, optimized for social organizations and sustainable NGOs.' 
        },
        { 
            id: 'creative_amber', 
            name: 'Creative Amber', 
            icon: Sunrise, 
            border: 'border-amber-600', 
            text: 'text-amber-400', 
            desc: 'Warm color tone, suitable for service and creative businesses.' 
        },
        { 
            id: 'minimal_white', 
            name: 'Clean Minimalist', 
            icon: Eye, 
            border: 'border-slate-800', 
            text: 'text-slate-900', 
            desc: 'Maximum black and white minimalist design, centralized on performance and content.' 
        },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('layout_style', layoutStyle);
        formData.set('tenant_type', tenantType);
        formData.set('has_web_frontend', String(hasWebFrontend));
        formData.set('plan_type', planType);
        formData.set('lifecycle_status', lifecycleStatus);
        formData.set('module_news', String(moduleNews));
        formData.set('module_events', String(moduleEvents));
        formData.set('module_library', String(moduleLibrary));
        formData.set('module_transactions', String(moduleTransactions));
        formData.set('module_jobs', String(moduleJobs));
        formData.set('telegram_chat_id', telegramChatId);
        formData.set('reset_default_blocks', String(resetDefaultBlocks));

        const result = mode === 'create'
            ? await createTenant(formData)
            : await updateTenant(tenant!.id, formData);

        if (result.success) {
            // @ts-ignore
            if (result.warning) {
                // @ts-ignore
                toast.warning(result.warning, {
                    duration: 10000,
                    description: 'Workspace information has been saved, but the Edge Vercel mapping section needs to be linked manually.'
                });
            } else {
                toast.success(mode === 'create' ? 'Initialized new Workspace successfully!' : 'Updated Workspace information successfully!');
            }
            router.push('/admin/tenants');
            router.refresh();
        } else {
            toast.error(result.error || 'An error occurred, please try again.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-white/[0.08] bg-slate-900/60 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Building2 className="w-5 h-5 text-violet-400" />
                        {mode === 'create' ? 'Register New Workspace' : 'Configure SaaS Control Center'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-950/60 p-1 border border-white/5 rounded-xl h-auto gap-1">
                            <TabsTrigger 
                                value="basic" 
                                className="flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-bold rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all text-slate-400"
                            >
                                <Building2 className="w-4 h-4" />
                                <span>1. Basic</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="design" 
                                className="flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-bold rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all text-slate-400"
                            >
                                <LayoutTemplate className="w-4 h-4" />
                                <span>2. Interface</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="saas" 
                                className="flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-bold rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all text-slate-400"
                            >
                                <Settings className="w-4 h-4" />
                                <span>3. SaaS & Plans</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="security" 
                                className="flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-bold rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all text-slate-400"
                            >
                                <Lock className="w-4 h-4" />
                                <span>4. SOC Security</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* ======================================================
                            TAB 1: BASIC INFORMATION
                           ====================================================== */}
                        <TabsContent value="basic" className="space-y-4 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name Workspace */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-slate-200 font-bold">
                                        Workspace / Enterprise Name <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={tenant?.name || ''}
                                            placeholder="e.g. Acme Corporation"
                                            required
                                            className="pl-9 bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>

                                {/* Active Model */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="tenant_type" className="text-slate-200 font-bold">
                                        Active Model <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="tenant_type"
                                        name="tenant_type"
                                        value={tenantType}
                                        onChange={(e) => setTenantType(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                        required
                                    >
                                        <option value="company" className="bg-slate-900">Enterprise (SaaS B2B)</option>
                                        <option value="ngo" className="bg-slate-900">Non-Profit Organization (NGO) / Community</option>
                                        <option value="tenant" className="bg-slate-900">Monastic / Buddhist Branch</option>
                                    </select>
                                </div>
                            </div>

                            {/* Domain */}
                            <div className="space-y-1.5">
                                <Label htmlFor="domain" className="text-slate-200 font-bold">
                                    Identifier Domain <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="domain"
                                        name="domain"
                                        defaultValue={tenant?.domain || ''}
                                        onChange={(e) => setDomainValue(e.target.value)}
                                        placeholder="e.g. acme.com or localhost:3000"
                                        required
                                        className="pl-9 bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 placeholder:text-slate-600"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    The multi-domain router automatically identifies the correct branch based on this domain.
                                </p>

                                {/* DNS Guidance */}
                                {isCustomDomain && (
                                    <Alert className="bg-violet-950/40 border-violet-500/30 text-violet-200 mt-2">
                                        <Info className="h-4 w-4 text-violet-400" />
                                        <AlertTitle className="text-violet-300 text-sm font-bold">
                                            Configure DNS for Custom Domain
                                        </AlertTitle>
                                        <AlertDescription className="text-violet-400/90 text-xs mt-1 space-y-2">
                                            <p>Configure your DNS records to point to the Edge SaaS Server cluster:</p>
                                            <div className="bg-slate-950/60 p-3 rounded border border-white/10 font-mono text-[10px] space-y-1 text-slate-300">
                                                <div className="flex justify-between items-center">
                                                    <span>Type: <strong>A</strong></span>
                                                    <span>Value: <strong>76.76.21.21</strong></span>
                                                </div>
                                                <div className="border-t border-white/5 pt-1 flex justify-between items-center">
                                                    <span>Type: <strong>CNAME</strong></span>
                                                    <span>Value: <strong>cname.vercel-dns.com</strong></span>
                                                </div>
                                            </div>
                                            <p className="italic opacity-80">* The SaaS system automatically issues and renews Let's Encrypt SSL certificates after DNS linking is complete.</p>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Subdomain */}
                            <div className="space-y-1.5">
                                <Label htmlFor="subdomain" className="text-slate-200 font-bold">
                                    Subdomain
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <Tag className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="subdomain"
                                        name="subdomain"
                                        defaultValue={tenant?.subdomain || ''}
                                        placeholder="e.g. acme"
                                        className="pl-9 bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Super Admin Fields */}
                            {role === 'super_admin' && (
                                <div className="space-y-4 pt-4 p-5 bg-violet-950/20 rounded-2xl border border-violet-500/20 shadow-sm mt-4">
                                     <div className="flex items-center gap-2 mb-2">
                                         <div className="p-1.5 bg-violet-500/10 rounded-lg">
                                             <Globe className="w-4 h-4 text-violet-400" />
                                         </div>
                                         <Label className="text-base font-bold text-violet-300">
                                             Location & Representative Integration (Super Admin Only)
                                         </Label>
                                     </div>

                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="latitude" className="text-xs font-semibold text-slate-300">
                                                Latitude
                                            </Label>
                                            <Input
                                                id="latitude"
                                                name="latitude"
                                                type="number"
                                                step="any"
                                                defaultValue={tenant?.latitude || ''}
                                                placeholder="e.g. 10.7769"
                                                className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="longitude" className="text-xs font-semibold text-slate-300">
                                                Longitude
                                            </Label>
                                            <Input
                                                id="longitude"
                                                name="longitude"
                                                type="number"
                                                step="any"
                                                defaultValue={tenant?.longitude || ''}
                                                placeholder="e.g. 106.7009"
                                                className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500"
                                            />
                                        </div>
                                     </div>

                                     <div className="space-y-4 pt-2 border-t border-white/5">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="abbot" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-violet-400" />
                                                Representative / Executive CEO
                                            </Label>
                                            <Input
                                                id="abbot"
                                                name="abbot"
                                                defaultValue={tenant?.contact_info?.abbot || ''}
                                                placeholder="e.g. John Doe"
                                                className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="history" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                                <ScrollText className="w-3.5 h-3.5 text-violet-400" />
                                                About / Operations History
                                            </Label>
                                            <Textarea
                                                id="history"
                                                name="history"
                                                defaultValue={tenant?.contact_info?.history || ''}
                                                placeholder="e.g. Established to provide comprehensive digital transformation solutions..."
                                                className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 min-h-[80px] placeholder:text-slate-600"
                                            />
                                        </div>
                                     </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* ======================================================
                            TAB 2: DESIGN & INTERFACE
                           ====================================================== */}
                        <TabsContent value="design" className="space-y-5 outline-none">
                            <div className="space-y-1.5">
                                <Label className="text-base font-bold flex items-center gap-2 text-white">
                                    <LayoutTemplate className="w-5 h-5 text-violet-400" />
                                    Select Design Style & Interface
                                </Label>
                                <p className="text-xs text-slate-500">
                                    The SaaS system will automatically adjust all color tones, CSS variables, and layout block structures accordingly.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {LAYOUT_OPTIONS.map((style) => {
                                    const StyleIcon = style.icon;
                                    const isSelected = layoutStyle === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            type="button"
                                            onClick={() => setLayoutStyle(style.id)}
                                            className={`
                                                relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left w-full
                                                bg-slate-950/50 border-white/5 text-slate-300 hover:border-white/10
                                                ${isSelected
                                                    ? `ring-2 ring-violet-500/40 border-violet-500/80 bg-slate-900 shadow-xl scale-[1.01]`
                                                    : 'opacity-70 hover:opacity-100'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <StyleIcon className={`w-5 h-5 shrink-0 ${isSelected ? style.text : 'text-slate-400'}`} />
                                                <span className="font-bold text-sm tracking-wide text-white">{style.name}</span>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-violet-600 text-white rounded-full p-0.5 shadow-sm">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">{style.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Auto-Reset Option */}
                            <div className="pt-2">
                                <label className="flex items-start gap-3 p-4 bg-violet-950/20 rounded-xl border border-violet-500/20 cursor-pointer hover:bg-violet-950/30 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={resetDefaultBlocks}
                                        onChange={(e) => setResetDefaultBlocks(e.target.checked)}
                                        className="w-5 h-5 mt-0.5 accent-violet-500 rounded cursor-pointer"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
                                            <Sliders className="w-4 h-4 text-violet-400" />
                                            Reset layout to default blocks for this style
                                        </span>
                                        <span className="text-xs text-slate-400 leading-relaxed">
                                            Note: Checking this option will **overwrite and reset all layout blocks** in the branch database to the template standards (e.g., `DEFAULT_TECH_BLOCKS` for Cyberpunk Tech). This updates the webpage structure immediately, even in the Visual Page Builder.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </TabsContent>

                        {/* ======================================================
                            TAB 3: SAAS ADMINISTRATION & SERVICE PLANS
                           ====================================================== */}
                        <TabsContent value="saas" className="space-y-6 outline-none">
                            {/* Service Plans */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold flex items-center gap-2 text-white">
                                    <Zap className="w-5 h-5 text-violet-400" />
                                    SaaS Service Plans
                                </Label>
                                <p className="text-xs text-slate-500">
                                    Resource limits and platform privileges for the organization.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Free Plan */}
                                    <button
                                        type="button"
                                        onClick={() => setPlanType('free')}
                                        className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all w-full
                                            ${planType === 'free' 
                                                ? 'bg-slate-900 border-slate-500 ring-2 ring-slate-500/20' 
                                                : 'bg-slate-950/30 border-white/5 opacity-60 hover:opacity-90'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-white text-sm">Basic Plan (Free)</span>
                                            <Badge className="bg-slate-700 text-slate-200">Free</Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-400">Suitable for testing, restricted from advanced payment features.</p>
                                    </button>

                                    {/* Pro Plan */}
                                    <button
                                        type="button"
                                        onClick={() => setPlanType('pro')}
                                        className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all w-full
                                            ${planType === 'pro' 
                                                ? 'bg-slate-900 border-blue-600 ring-2 ring-blue-500/20' 
                                                : 'bg-slate-950/30 border-white/5 opacity-60 hover:opacity-90'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-white text-sm">Professional Plan (Pro)</span>
                                            <Badge className="bg-blue-600 text-white">Pro</Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-400">Full features, unlocks finance and recruitment modules.</p>
                                    </button>

                                    {/* Enterprise Plan */}
                                    <button
                                        type="button"
                                        onClick={() => setPlanType('enterprise')}
                                        className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all w-full
                                            ${planType === 'enterprise' 
                                                ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20' 
                                                : 'bg-slate-950/30 border-white/5 opacity-60 hover:opacity-90'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-white text-sm">Enterprise</span>
                                            <Badge className="bg-amber-500 text-slate-950 font-bold">Enterprise</Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-400">Full access, activates high-frequency SOAR SOC security alerts.</p>
                                    </button>
                                </div>
                            </div>

                            {/* Enable/Disable Modules */}
                            <div className="space-y-4 pt-2">
                                <Label className="text-base font-bold flex items-center gap-2 text-white">
                                    <Sliders className="w-5 h-5 text-violet-400" />
                                    Module & Feature Configuration
                                </Label>

                                <div className="space-y-3">
                                    {/* Module News */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-1 pr-4">
                                            <span className="text-sm font-bold text-white">1. News & Communications Module</span>
                                            <span className="text-xs text-slate-400">Allows posting announcements and internal news.</span>
                                        </div>
                                        <Switch checked={moduleNews} onCheckedChange={setModuleNews} className="data-[state=checked]:bg-violet-600" />
                                    </div>

                                    {/* Module Event */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-1 pr-4">
                                            <span className="text-sm font-bold text-white">2. Events & Calendar Module</span>
                                            <span className="text-xs text-slate-400">Manage major events, seminars, festivals, or internal training schedules.</span>
                                        </div>
                                        <Switch checked={moduleEvents} onCheckedChange={setModuleEvents} className="data-[state=checked]:bg-violet-600" />
                                    </div>

                                    {/* Document Library Module */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-1 pr-4">
                                            <span className="text-sm font-bold text-white">3. Document Library & SOP Module</span>
                                            <span className="text-xs text-slate-400">Manage and store guidelines and standardized SOP processes.</span>
                                        </div>
                                        <Switch checked={moduleLibrary} onCheckedChange={setModuleLibrary} className="data-[state=checked]:bg-violet-600" />
                                    </div>

                                    {/* Module Finance */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-1 pr-4">
                                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                                4. Finance & Online Transactions Module
                                                {planType === 'free' && <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-500 bg-amber-500/5">Pro/Ent Only</Badge>}
                                            </span>
                                            <span className="text-xs text-slate-400">Integrates donation gateway, bill payment, or services.</span>
                                        </div>
                                        <Switch 
                                            checked={moduleTransactions} 
                                            onCheckedChange={setModuleTransactions}
                                            disabled={planType === 'free'} 
                                            className="data-[state=checked]:bg-violet-600 disabled:opacity-30" 
                                        />
                                    </div>

                                    {/* Recruitment Module */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-1 pr-4">
                                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                                5. Recruitment & HR Module (Jobs)
                                                {planType === 'free' && <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-500 bg-amber-500/5">Pro/Ent Only</Badge>}
                                            </span>
                                            <span className="text-xs text-slate-400">Opens recruitment gateway and directly manages candidate profiles.</span>
                                        </div>
                                        <Switch 
                                            checked={moduleJobs} 
                                            onCheckedChange={setModuleJobs}
                                            disabled={planType === 'free'}
                                            className="data-[state=checked]:bg-violet-600 disabled:opacity-30" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* ======================================================
                            TAB 4: SECURITY & SOC ALERTS
                           ====================================================== */}
                        <TabsContent value="security" className="space-y-6 outline-none">
                            {/* Lifecycle Status */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold flex items-center gap-2 text-white">
                                    <Shield className="w-5 h-5 text-violet-400" />
                                    Active Status & Branch Lifecycle
                                </Label>
                                <p className="text-xs text-slate-500">
                                    High-level administrators can suspend any branch that violates security or terms of service.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lifecycle_status" className="text-xs font-semibold text-slate-300">
                                            Select Lifecycle Status
                                        </Label>
                                        <select
                                            id="lifecycle_status"
                                            name="lifecycle_status"
                                            value={lifecycleStatus}
                                            onChange={(e) => setLifecycleStatus(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                            required
                                        >
                                            <option value="active" className="bg-slate-900">Active (Normal Operations)</option>
                                            <option value="suspended" className="bg-slate-900">Suspended (Locked / Frozen)</option>
                                            <option value="offboarding" className="bg-slate-900">Offboarding (Removing)</option>
                                            <option value="terminated" className="bg-slate-900">Terminated (Permanently Deleted)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        {lifecycleStatus === 'suspended' && (
                                            <Alert className="bg-red-950/40 border-red-500/30 text-red-200">
                                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                                <AlertTitle className="text-red-300 text-xs font-bold uppercase tracking-wider">Suspension Warning</AlertTitle>
                                                <AlertDescription className="text-red-400/90 text-[10px] leading-relaxed mt-1">
                                                    When **Suspended**, both the admin panel and public web interface will be locked immediately. Users will see a SOC Security block screen.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Configuration SOC Alerts */}
                            <div className="space-y-4 pt-2 border-t border-white/5">
                                <Label className="text-base font-bold flex items-center gap-2 text-white">
                                    <Bell className="w-5 h-5 text-violet-400" />
                                    SOC Security Alerting System (SOAR Link)
                                </Label>
                                <p className="text-xs text-slate-500">
                                    Dynamically integrate the branch\'s Telegram Chat ID. The system\'s SOAR Active Defense Engine will automatically send real-time intrusion and malware alerts to this Telegram chat.
                                </p>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="telegram_chat_id" className="text-xs font-semibold text-slate-300">
                                            Branch Telegram Chat ID
                                        </Label>
                                        <Input
                                            id="telegram_chat_id"
                                            value={telegramChatId}
                                            onChange={(e) => setTelegramChatId(e.target.value)}
                                            placeholder="e.g. 8617200830"
                                            className="bg-slate-950/50 border-white/10 text-white focus:ring-violet-500 placeholder:text-slate-600"
                                        />
                                        <p className="text-[10px] text-slate-500 italic">
                                            * Leave blank to default alerts to the Super Admin Telegram.
                                        </p>
                                    </div>

                                    <Alert className="bg-slate-950/40 border-white/5 text-slate-400">
                                        <Shield className="h-4 w-4 text-violet-400" />
                                        <AlertTitle className="text-slate-300 text-xs font-bold">SOAR Active Defense Engine</AlertTitle>
                                        <AlertDescription className="text-[11px] leading-relaxed">
                                            When detecting high-frequency unauthorized intrusion behavior (such as SQL Injection, Cross-tenant violation) from a single IP address (3+ times/minute), SOAR will automatically change the branch status to **Suspended** and issue an immediate Telegram alert.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Submit Actions */}
                    <div className="pt-6 flex gap-3 border-t border-white/5 mt-6">
                        <Button type="submit" disabled={loading} className="gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {mode === 'create' ? 'Initialize Workspace' : 'Save SaaS Configuration'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/admin/tenants')}
                            disabled={loading}
                            className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* SYNC OPTIONS CARD */}
            <Card className="border-violet-500/20 bg-violet-950/10">
                <CardHeader className="py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-violet-300">
                        <Bell className="w-4 h-4 text-violet-400" />
                        System-wide Data Sync
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-2 pb-5 space-y-4 text-slate-400">
                    <p className="text-xs leading-relaxed italic text-slate-500">
                        Note: Enable this option to automatically copy and sync strategic notices and general training documents from Headquarters to the newly created branch.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-3 bg-slate-950/30 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                            <input type="checkbox" name="sync_news" value="true" className="w-4 h-4 accent-violet-500 rounded cursor-pointer" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-200">Sync System-wide News & Announcements</span>
                                <span className="text-[10px] text-slate-500 italic">Automatically copy news marked as shared.</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-slate-950/30 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                            <input type="checkbox" name="sync_dharma" value="true" className="w-4 h-4 accent-violet-500 rounded cursor-pointer" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-200">Sync SOP Procedures & Operational Guidelines</span>
                                <span className="text-[10px] text-slate-500 italic">Applies to documents and operational standards that are automatically synced.</span>
                            </div>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
