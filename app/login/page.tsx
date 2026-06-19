'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Key, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        // Luôn kích hoạt dark mode cho trang login để tránh xung đột giao diện sáng
        document.documentElement.classList.add('dark');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            // Đăng nhập thành công, chuyển hướng về trang admin dashboard
            window.location.href = '/admin/dashboard';
        } catch (err: any) {
            console.error('Login error:', err);
            setErrorMsg(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const fillDemoAccount = (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword('SaaS12345678@');
        setErrorMsg(null);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background decorative glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 mb-3">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        NextSecure Control Panel
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                        Zero Trust Multi-Tenant SaaS Workspace
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-lg font-bold mb-6 text-slate-200">Sign In to Dashboard</h2>

                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:text-slate-400 text-white rounded-2xl py-3 text-sm font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Click-to-Fill Demo Credentials (High conversion value for buyers) */}
                <div className="mt-6 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 text-center">
                    <p className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-wider">
                        ⚡ Quick Demo Accounts
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                            onClick={() => fillDemoAccount('superadmin@saas.core')}
                            className="text-xs bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl py-2 px-3 transition font-medium text-slate-300"
                        >
                            🔑 Fill SuperAdmin
                        </button>
                        <button
                            onClick={() => fillDemoAccount('tenantadmin@nexus.corp')}
                            className="text-xs bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl py-2 px-3 transition font-medium text-slate-300"
                        >
                            🔑 Fill TenantAdmin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
