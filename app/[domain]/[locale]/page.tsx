import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { 
    Shield, 
    Key, 
    Zap, 
    Check, 
    ExternalLink, 
    Lock, 
    Server, 
    Database, 
    Cpu, 
    Bell, 
    Activity, 
    Code, 
    ArrowRight 
} from 'lucide-react';

export default async function TenantHomePage({ 
    params 
}: { 
    params: Promise<{ domain: string; locale: string }> 
}) {
    const resolvedParams = await params;
    const rawDomain = resolvedParams.domain || 'localhost';
    
    // Chuẩn hóa tên domain (loại bỏ port nếu có để so khớp chính xác)
    const tenantDomain = rawDomain.split(':')[0].toLowerCase();
    
    // Nhận diện domain gốc của sản phẩm
    const isMainDomain = 
        tenantDomain === 'localhost' || 
        tenantDomain === '127.0.0.1' || 
        tenantDomain === 'nextsecure.dev' || 
        tenantDomain === 'nextsecure-saas-starter-kit.vercel.app';

    if (isMainDomain) {
        // --- 1. GIAO DIỆN LANDING PAGE MARKETING (BÁN SOURCE CODE) ---
        return (
            <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
                {/* Các luồng neon trang trí nền */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Grid trang trí dạng lưới tọa độ công nghệ */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

                {/* Header */}
                <header className="border-b border-slate-900/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2 rounded-xl shadow-md">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                NextSecure
                            </span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <a href="#metrics" className="hover:text-white transition-colors">Specs</a>
                            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                            <a href="/docs/docs.html" target="_blank" className="hover:text-white transition-colors">Documentation</a>
                        </nav>
                        <a 
                            href="/login" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center gap-1.5"
                        >
                            Access Live Demo
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative z-10 pt-20 pb-24 px-6 text-center max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Premium Next.js & Supabase SaaS Boilerplate</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent">
                        Build and Scale SaaS with <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
                            Zero Trust Security Architecture
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        Stop wasting weeks building user registration, tenant isolation, and security systems. NextSecure delivers production-ready Row Level Security, WORM audit vaults, SOAR active defense, and seamless multi-tenancy out of the box.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a 
                            href="/login" 
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                        >
                            Explore Live Demo
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a 
                            href="/docs/docs.html" 
                            target="_blank"
                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-8 py-4 rounded-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                        >
                            Read Documentation
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Enterprise-Grade Core Pillars
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                            Engineered for high security, data compliance, and lightning-fast developer experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Pillar 1 */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/20 hover:bg-slate-900/40 transition-all group">
                            <div className="bg-indigo-500/10 p-3 rounded-2xl w-fit mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-3">Zero Trust Isolation</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Complete security boundaries between tenants. Leveraging PostgreSQL Row-Level Security (RLS) configured directly in database schemas, ensuring data isolation is enforced at the database level, not just in UI code.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 hover:border-violet-500/20 hover:bg-slate-900/40 transition-all group">
                            <div className="bg-violet-500/10 p-3 rounded-2xl w-fit mb-6 text-violet-400 group-hover:scale-110 transition-transform">
                                <Database className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-3">WORM Audit Vault</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Write Once Read Many immutable audit log database. Protected against tampering at the database level, ensuring full accountability and compliance, making it easy to pass SOC2 and ISO 27001 requirements.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 hover:border-purple-500/20 hover:bg-slate-900/40 transition-all group">
                            <div className="bg-purple-500/10 p-3 rounded-2xl w-fit mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-3">SOAR Active Defense</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Edge Defense system automatically checks client IPs at the edge middleware and blocks repeated brute-force attacks or SQL injection threats instantly, notifying admins via Telegram in real time.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Tech Specs Section */}
                <section id="metrics" className="bg-slate-950/60 border-y border-slate-900 py-16 px-6 relative z-10">
                    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl sm:text-5xl font-black text-indigo-400 mb-2">&lt; 4ms</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Edge Response Latency</div>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-5xl font-black text-violet-400 mb-2">100%</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">RLS Coverage Protected</div>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-5xl font-black text-purple-400 mb-2">O(1)</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Token RLS Check Speed</div>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-5xl font-black text-blue-400 mb-2">100%</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Type-safe TypeScript</div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Flexible Licensing For Developers
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                            Get complete lifetime access to the secure boilerplate with zero hidden fees.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Pricing Card 1 */}
                        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 relative flex flex-col justify-between hover:border-slate-700/60 transition-colors">
                            <div>
                                <h3 className="text-lg font-bold text-slate-200 mb-2">Single Project License</h3>
                                <p className="text-slate-400 text-xs mb-6">Perfect for solo developers and single startup launches.</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-white">$79</span>
                                    <span className="text-slate-500 text-sm font-medium">/ lifetime</span>
                                </div>
                                <ul className="space-y-4 text-sm text-slate-300 mb-8">
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Use in 1 production SaaS application</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Full source code with Next.js 16</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Supabase Zero Trust RLS schemas</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Beautiful HTML docs.html offline guide</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Free updates lifetime</span>
                                    </li>
                                </ul>
                            </div>
                            <a 
                                href="/login" 
                                className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 py-3 rounded-xl text-center font-bold text-sm transition-all"
                            >
                                Try Before Buying
                            </a>
                        </div>

                        {/* Pricing Card 2 */}
                        <div className="bg-slate-900/40 border-2 border-indigo-500/40 rounded-3xl p-8 relative flex flex-col justify-between shadow-xl shadow-indigo-500/5">
                            <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/20">
                                Best Value
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-200 mb-2">Unlimited License</h3>
                                <p className="text-slate-400 text-xs mb-6">Designed for agency owners and serial creators building SaaS networks.</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-white">$249</span>
                                    <span className="text-slate-500 text-sm font-medium">/ lifetime</span>
                                </div>
                                <ul className="space-y-4 text-sm text-slate-300 mb-8">
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                        <span>Use in unlimited production applications</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                        <span>Full source code with Next.js 16</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                        <span>Supabase Zero Trust RLS schemas</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                        <span>HTML docs.html offline guide & Seeds</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                        <span>Priority developer support</span>
                                    </li>
                                </ul>
                            </div>
                            <a 
                                href="/login" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-center font-bold text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.98] transition-all"
                            >
                                Try Demo Portal
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-900/60 bg-slate-950 py-12 text-center text-xs text-slate-500 relative z-10">
                    <p className="mb-2">© {new Date().getFullYear()} NextSecure. All rights reserved.</p>
                    <p>Designed for secure B2B multi-tenant SaaS. Zero mock database logic policy.</p>
                </footer>
            </div>
        );
    } else {
        // --- 2. GIAO DIỆN WELCOME PORTAL CỦA TỪNG TENANT ---
        const supabase = await createClient();
        const { data: tenant } = await (supabase as any)
            .from('tenants')
            .select('*')
            .or(`subdomain.eq.${tenantDomain},domain.eq.${tenantDomain}`)
            .maybeSingle();

        const tenantName = tenant ? tenant.name : 'Unknown Workspace';
        const rawThemeColors = tenant ? (tenant.theme_colors as any) : null;
        const primaryColor = rawThemeColors?.primary || '#6366f1'; // Default Indigo

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 mb-6" style={{ color: primaryColor }}>
                        <Server className="w-8 h-8" />
                    </div>
                    
                    <h1 className="text-2xl font-black mb-2 tracking-tight">
                        {tenantName}
                    </h1>
                    
                    <p className="text-slate-400 text-xs mb-6">
                        You are visiting branch subdomain: <code className="bg-slate-950 px-2 py-0.5 rounded text-indigo-400">{tenantDomain}</code>
                    </p>
                    
                    <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                        This is a secure, isolated tenant workspace under the Zero Trust Multi-Tenant SaaS platform. Access is restricted to authorized branch staff.
                    </p>
                    
                    <a 
                        href="/login" 
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white transition-all shadow-md active:scale-[0.98]"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Access Member Portal
                    </a>
                </div>
            </div>
        );
    }
}