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
    Activity, 
    Code, 
    ArrowRight,
    Terminal,
    Users,
    Layers,
    Scale,
    FileText,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';

import CodeSnippetComparison from '@/components/landing/code-snippet-comparison';
import RoiCalculator from '@/components/landing/roi-calculator';
import FaqAccordion from '@/components/landing/faq-accordion';
import DemoCredentials from '@/components/landing/demo-credentials';

export default async function TenantHomePage({ 
    params 
}: { 
    params: Promise<{ domain: string; locale: string }> 
}) {
    const resolvedParams = await params;
    const rawDomain = resolvedParams.domain || 'localhost';
    
    // Normalize domain name (remove port if any for accurate matching)
    const tenantDomain = rawDomain.split(':')[0].toLowerCase();
    
    // Identify the main product landing page domain
    const isMainDomain = 
        tenantDomain === 'localhost' || 
        tenantDomain === '127.0.0.1' || 
        tenantDomain === 'tenantshield.dev' || 
        tenantDomain === 'tenantshield-saas.vercel.app' ||
        tenantDomain === 'nextjs-supabase-zerotrust-saas-crt.vercel.app';

    if (isMainDomain) {
        // --- 1. PREMIUM LANDING PAGE (MARKETPLACE-READY) ---
        return (
            <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
                {/* Decorative Neon Background Flows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute top-[35%] left-[25%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none"></div>

                {/* Coordinate Grid Background Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-25 pointer-events-none"></div>

                {/* HEADER */}
                <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2.5 rounded-xl shadow-md shadow-indigo-500/10">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                                TenantShield
                            </span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-400">
                            <a href="#problem" className="hover:text-white transition-colors">The Threat</a>
                            <a href="#pillars" className="hover:text-white transition-colors">Security Pillars</a>
                            <a href="#comparison" className="hover:text-white transition-colors">Stack Compare</a>
                            <a href="#roi" className="hover:text-white transition-colors">ROI Calculator</a>
                            <a href="#demo" className="hover:text-white transition-colors">Live Sandbox</a>
                            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                            <a href="/docs/docs.html" target="_blank" className="hover:text-white transition-colors flex items-center gap-1">Docs <ExternalLink className="w-3 h-3" /></a>
                        </nav>
                        <a 
                            href="/login" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/35 active:scale-[0.98] transition-all flex items-center gap-1.5"
                        >
                            Access Live Demo
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </header>

                {/* SECTION 1: HERO */}
                <section className="relative z-10 pt-24 pb-20 px-6 text-center max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>The SaaS Backend Built for Regulated & High-Risk Industries</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent">
                        The SaaS Boilerplate Built for When a <br />
                        <span className="bg-gradient-to-r from-rose-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                            Cross-Tenant Data Leak Would End Your Company
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        Most boilerplates trust developers to write correct tenant filters. TenantShield enforces isolation at the database layer (FORCE RLS). Combined with WORM immutable logging and Edge-level active defense, we prevent breaches before they happen.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <a 
                            href="#demo" 
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/15 hover:shadow-indigo-600/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                        >
                            Explore Live Sandbox
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a 
                            href="/docs/docs.html" 
                            target="_blank"
                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-8 py-4 rounded-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                        >
                            Read Architecture
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Tech Compatibility Badges */}
                    <div className="border-t border-slate-900 pt-8">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-4">COMPATIBILITY MATRIX</span>
                        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs text-slate-400 font-semibold">
                            <span className="bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Next.js 16 (App Router)
                            </span>
                            <span className="bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                                <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase Database & Auth
                            </span>
                            <span className="bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-sky-400" /> TypeScript 5 Type-Safe
                            </span>
                            <span className="bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                                <Server className="w-3.5 h-3.5 text-red-400" /> Upstash Redis Edge Defense
                            </span>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: SOCIAL PROOF BAR */}
                <section className="bg-slate-950/60 border-y border-slate-900 py-8 relative z-10">
                    <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-around items-center gap-6 opacity-60">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Vercel Enterprise Partner Ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Supabase RLS Enforced</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-violet-400" />
                            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">SOC2 Compliance Architecture</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-sky-400" />
                            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">GDPR Compliant Audit ledger</span>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: PROBLEM SECTION */}
                <section id="problem" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                            The Security Risk
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            One Missing Line of Code. Every Client's Data Leaked.
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                            Standard SaaS boilerplates isolate data at the application layer. If a developer forgets a single <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-400">.eq('tenant_id', currentTenant)</code> filter, Client A sees Client B's private invoices, contracts, or credentials.
                        </p>
                    </div>

                    {/* Interactive Code Comparison Component */}
                    <CodeSnippetComparison />
                </section>

                {/* SECTION 4: THE FOUR PILLARS */}
                <section id="pillars" className="bg-slate-950/40 border-y border-slate-900 py-24 relative z-10">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20 max-w-3xl mx-auto">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
                                Core Architecture
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                Four Defensive Security Layers
                            </h2>
                            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                                TenantShield is built around a defense-in-depth model that protects your customer database even if your front-end code is compromised.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Pillar 1 */}
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/20 hover:bg-slate-900/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                                <div className="bg-indigo-500/10 p-3 rounded-2xl w-fit mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-200 mb-3">FORCE RLS Isolation</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                                    Enforced at the physical PostgreSQL engine. Policies run on all 14 tables, even preventing service keys from bypassing isolation if user session context is set.
                                </p>
                                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded">
                                    0% Leak Probability
                                </span>
                            </div>

                            {/* Pillar 2 */}
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 hover:border-violet-500/20 hover:bg-slate-900/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
                                <div className="bg-violet-500/10 p-3 rounded-2xl w-fit mb-6 text-violet-400 group-hover:scale-110 transition-transform">
                                    <Database className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-200 mb-3">WORM Immutability</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                                    Write Once Read Many database trigger blocks all edits or deletes of audit logs, cryptographically chaining entries using SHA-256 blocks stored in cloud buckets.
                                </p>
                                <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/5 border border-violet-500/10 px-2.5 py-1 rounded">
                                    Auditor Approved Ledger
                                </span>
                            </div>

                            {/* Pillar 3 */}
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 hover:border-purple-500/20 hover:bg-slate-900/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                <div className="bg-purple-500/10 p-3 rounded-2xl w-fit mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-200 mb-3">SOAR Edge Defense</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                                    Next.js Edge Middleware checks client IPs at CDN latency. Repeated brute-force, SQL injection, or suspicious requests are blocked in Redis under 4ms.
                                </p>
                                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/5 border border-purple-500/10 px-2.5 py-1 rounded">
                                    Sub-4ms Edge Filter
                                </span>
                            </div>

                            {/* Pillar 4 */}
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 hover:border-emerald-500/20 hover:bg-slate-900/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500"></div>
                                <div className="bg-emerald-500/10 p-3 rounded-2xl w-fit mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-200 mb-3">Centralized SOC</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                                    Real-time Security Operations dashboard, active threat sandbox, customizable notification thresholds, and AI CISO PDF reports for compliance.
                                </p>
                                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded">
                                    AI-Generated Reports
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: COMPARISON TABLE */}
                <section id="comparison" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
                            Competitive Landscape
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Security Comparison
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                            Traditional boilerplates help you setup Stripe and UI templates. TenantShield provides the critical security infrastructure required to pass enterprise procurement audits.
                        </p>
                    </div>

                    <div className="w-full overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-900 bg-slate-950/80 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                                    <th className="p-5 w-[40%]">Security Feature</th>
                                    <th className="p-5 text-indigo-400 bg-indigo-950/20 text-center w-[20%]">TenantShield Core</th>
                                    <th className="p-5 text-slate-500 text-center w-[20%]">ShipFast</th>
                                    <th className="p-5 text-slate-500 text-center w-[20%]">MakerKit / Others</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/60 text-slate-300 font-medium">
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">PostgreSQL FORCE RLS isolation (14 tables)</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ ENFORCED</td>
                                    <td className="p-5 text-center text-rose-500">❌ App Layer Only</td>
                                    <td className="p-5 text-center text-rose-500">❌ App Layer Only</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">WORM Immutable Audit Vault (Trigger protected)</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ ENFORCED</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">SHA-256 Cryptographic Audit Hash Ledger</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ INCLUDED</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">Edge Middleware IP Blocking (Redis negative cache)</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ &lt; 4ms latency</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">Tenant Intranet Whitelisting (Edge locked)</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ INCLUDED</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">Real-time Security Operations Center (SOC) dashboard</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ INCLUDED</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">Active Threat Simulator & SOAR Alerts</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ INCLUDED</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">AI-Generated CISO Compliance PDF Reports</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-emerald-400 font-bold font-mono">✅ INCLUDED</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                    <td className="p-5 text-center text-slate-600">❌ None</td>
                                </tr>
                                <tr>
                                    <td className="p-5 font-bold text-slate-200">Stripe Billing integration</td>
                                    <td className="p-5 text-center bg-indigo-950/10 text-slate-400 font-bold font-mono">⚠️ Detailed Docs</td>
                                    <td className="p-5 text-center text-emerald-400 font-bold">✅ INCLUDED</td>
                                    <td className="p-5 text-center text-emerald-400 font-bold">✅ INCLUDED</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-center text-indigo-300">
                        🛡️ <strong>"They have Stripe. We have FORCE RLS. You need both."</strong> Integrate Stripe in an afternoon using our template documentation, but don't attempt to build compliance security architecture from scratch.
                    </div>
                </section>

                {/* SECTION 6: ROI CALCULATOR */}
                <section id="roi" className="bg-slate-950/40 border-y border-slate-900 py-24 relative z-10">
                    <div className="max-w-7xl mx-auto px-6">
                        <RoiCalculator />
                    </div>
                </section>

                {/* SECTION 7: LIVE DEMO SANDBOX */}
                <section id="demo" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
                            Interactive Sandbox
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Test Drive the Security Sandbox
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                            Sign in to the global administration panel to simulate attacks (XSS, IP whitelisting overrides, brute force) and see how the SOC listener triggers alerts and WORM locks down audit records.
                        </p>
                    </div>

                    <DemoCredentials />
                </section>

                {/* SECTION 8: PRICING TIERS */}
                <section id="pricing" className="bg-slate-950/40 border-y border-slate-900 py-24 relative z-10">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                One-Time License
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                Secure Your SaaS Core Today
                            </h2>
                            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
                                Immediate lifetime access to the complete source code, Postgres RLS schema, Edge Middleware, and offline manuals.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Tier 1 */}
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 relative flex flex-col justify-between hover:border-slate-800 transition-colors">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-200 mb-1">Starter License</h3>
                                    <p className="text-slate-400 text-[11px] mb-6">For single indie founders launching a secure multi-tenant project.</p>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-3xl font-black text-white">$79</span>
                                        <span className="text-slate-500 text-xs font-medium">/ lifetime one-time</span>
                                    </div>
                                    <ul className="space-y-3.5 text-xs text-slate-300 mb-8 border-t border-slate-900 pt-6">
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Deploy to 1 production project</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Complete Next.js + Supabase code</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>FORCE RLS schemas & 9 migrations</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Edge Active defense middleware</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Lifetime free updates</span>
                                        </li>
                                    </ul>
                                </div>
                                <a 
                                    href="https://crt-sotre.lemonsqueezy.com/checkout/buy/07d7904f-87b2-4a32-b960-e32d9c53dac0" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-3 rounded-xl text-center font-bold text-xs text-slate-300 transition-colors"
                                >
                                    Purchase Starter License
                                </a>
                            </div>

                            {/* Tier 2 */}
                            <div className="bg-slate-900/40 border-2 border-indigo-500/40 rounded-3xl p-6 relative flex flex-col justify-between shadow-xl shadow-indigo-500/5">
                                <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/20">
                                    Recommended
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-200 mb-1">Professional License</h3>
                                    <p className="text-slate-400 text-[11px] mb-6">Designed for dev agencies, freelancers, and growing multi-tenant startups.</p>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-3xl font-black text-white">$229</span>
                                        <span className="text-slate-500 text-xs font-medium">/ lifetime one-time</span>
                                    </div>
                                    <ul className="space-y-3.5 text-xs text-slate-300 mb-8 border-t border-slate-900 pt-6">
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Deploy to <strong>up to 5</strong> production projects</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Everything in Starter included</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>12 months priority technical support</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Stripe integration walkthrough guide</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Access to private security updates</span>
                                        </li>
                                    </ul>
                                </div>
                                <a 
                                    href="https://crt-sotre.lemonsqueezy.com/checkout/buy/07d7904f-87b2-4a32-b960-e32d9c53dac0" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-center font-bold text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-colors"
                                >
                                    Purchase Professional License
                                </a>
                            </div>

                            {/* Tier 3 */}
                            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 relative flex flex-col justify-between hover:border-slate-800 transition-colors">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-200 mb-1">Enterprise License</h3>
                                    <p className="text-slate-400 text-[11px] mb-6">Unlimited scaling, complete reseller/white-label platform privileges.</p>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-3xl font-black text-white">$349</span>
                                        <span className="text-slate-500 text-xs font-medium">/ lifetime one-time</span>
                                    </div>
                                    <ul className="space-y-3.5 text-xs text-slate-300 mb-8 border-t border-slate-900 pt-6">
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Deploy to <strong>unlimited</strong> production projects</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Everything in Professional included</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Lifetime priority developer support</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Custom compliance documentation draft</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <span>Reseller & white-label permission</span>
                                        </li>
                                    </ul>
                                </div>
                                <a 
                                    href="https://crt-sotre.lemonsqueezy.com/checkout/buy/07d7904f-87b2-4a32-b960-e32d9c53dac0" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-3 rounded-xl text-center font-bold text-xs text-slate-300 transition-colors"
                                >
                                    Purchase Enterprise License
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 9: FAQ ACCORDION */}
                <section id="faq" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
                            Frequently Asked Questions
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Overcoming Obstacles
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                            Critical answers regarding payments, compliance audits, hosting, and implementation procedures.
                        </p>
                    </div>

                    <FaqAccordion />
                </section>

                {/* SECTION 10: FOOTER CTA & URGENCY */}
                <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
                    <div className="bg-gradient-to-tr from-indigo-900/30 via-slate-900/40 to-purple-900/30 border border-slate-800 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
                        {/* Glow lines */}
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(indigo-500/10_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-35"></div>
                        
                        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                                <ShieldAlert className="w-3 h-3 text-amber-400" />
                                Limited Launch Pricing
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white">
                                Ready to Ship Securely?
                            </h2>
                            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                                Don't wait until a security audit or data leak stops your B2B SaaS startup. Get complete, compliance-grade multi-tenancy core and Edge protection in 15 minutes.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a 
                                    href="#pricing"
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/15 hover:shadow-indigo-600/35 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                                >
                                    Get TenantShield Now
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                                <a 
                                    href="/login"
                                    className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold px-8 py-4 rounded-2xl active:scale-[0.97] transition-all"
                                >
                                    Try Dashboard Demo
                                </a>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                                Immediate download access. Complete documentation & setup guides included.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-slate-900/60 bg-slate-950/80 py-12 text-center text-xs text-slate-500 relative z-10">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                                <Shield className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="font-extrabold text-slate-400">TenantShield</span>
                        </div>
                        <p>© {new Date().getFullYear()} TenantShield. All rights reserved. Zero Trust Multi-Tenant SaaS Core.</p>
                        <div className="flex items-center gap-6 text-slate-500 font-semibold">
                            <a href="/docs/docs.html" target="_blank" className="hover:text-slate-300">Docs</a>
                            <a href="#demo" className="hover:text-slate-300">Sandbox</a>
                            <a href="#pricing" className="hover:text-slate-300">Checkout</a>
                        </div>
                    </div>
                </footer>
            </div>
        );
    } else {
        // --- 2. WELCOME PORTAL FOR INDIVIDUAL TENANTS ---
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