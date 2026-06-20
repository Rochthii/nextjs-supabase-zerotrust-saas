"use client";

import React, { useState } from 'react';
import { Code, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function CodeSnippetComparison() {
  const [activeTab, setActiveTab] = useState<'vulnerable' | 'secured'>('vulnerable');

  const vulnerableCode = `// app/api/invoices/route.ts
// ❌ VULNERABLE: Application-level isolation (Trust-based)
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  
  // Developer forgot to add:
  // .eq('tenant_id', currentTenantId)
  //
  // ⚠️ CRITICAL VULNERABILITY:
  // This query leaks invoices of ALL tenants
  // to any authenticated user!
  const { data, error } = await supabase
    .from('invoices')
    .select('*');
    
  return Response.json(data);
}`;

  const securedCode = `// app/api/invoices/route.ts
// ✅ SECURED: Database-enforced isolation (FORCE RLS)
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  
  // FORCE RLS is active on the 'invoices' table.
  // The DB session is locked to the user's tenant.
  // 
  // 🛡️ ZERO LEAK GUARANTEE:
  // Even without a manual tenant filter,
  // PostgreSQL automatically restricts results
  // to the user's tenant_id!
  const { data, error } = await supabase
    .from('invoices')
    .select('*');
    
  return Response.json(data);
}`;

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-950/80 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-200">The Tenant Isolation Time Bomb</h4>
            <p className="text-xs text-slate-500">How one missing line of code leaks all client data.</p>
          </div>
        </div>
        
        {/* Toggle tabs for mobile view */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 sm:hidden">
          <button 
            onClick={() => setActiveTab('vulnerable')}
            className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'vulnerable' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vulnerable Way
          </button>
          <button 
            onClick={() => setActiveTab('secured')}
            className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'secured' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TenantShield Way
          </button>
        </div>
      </div>

      {/* Code Grid */}
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 bg-slate-950/20">
        
        {/* Vulnerable Side */}
        <div className={`p-6 transition-all ${activeTab === 'vulnerable' ? 'block' : 'hidden sm:block'}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1 rounded bg-rose-500/15 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-rose-500">Typical Boilerplate (Trust-Based)</span>
          </div>
          <div className="relative font-mono text-[11px] sm:text-xs leading-relaxed text-slate-400 bg-slate-950/80 p-5 rounded-2xl border border-rose-500/10 overflow-x-auto whitespace-pre">
            {vulnerableCode}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/[0.02] to-transparent pointer-events-none rounded-2xl"></div>
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-400 leading-relaxed">
            <strong>The Risk:</strong> A developer working at 2 AM forgets to add the tenant ID filter. Supabase executes the query with system context and leaks invoices across organizations. No compile-time error. No runtime exception. Just a silent data leak.
          </div>
        </div>

        {/* Secured Side */}
        <div className={`p-6 transition-all ${activeTab === 'secured' ? 'block' : 'hidden sm:block'}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1 rounded bg-emerald-500/15 text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-500">TenantShield (FORCE RLS Enforced)</span>
          </div>
          <div className="relative font-mono text-[11px] sm:text-xs leading-relaxed text-slate-300 bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/10 overflow-x-auto whitespace-pre">
            {securedCode}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.02] to-transparent pointer-events-none rounded-2xl"></div>
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-400 leading-relaxed">
            <strong>The Solution:</strong> Row-Level Security is forced at the PostgreSQL level. When a user requests data, the DB intercepts the transaction, extracts the tenant session header, and isolates the query automatically. A developer mistake cannot leak data.
          </div>
        </div>

      </div>

      {/* Explanation Footer banner */}
      <div className="p-6 border-t border-slate-900 bg-slate-950/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-xs font-bold text-slate-400">Compliance Standard:</span>
          <p className="text-xs text-slate-500 mt-0.5">Meets SOC2 Trust Services Criteria for Security & Confidentiality out-of-the-box.</p>
        </div>
        <div className="text-xs font-extrabold text-indigo-400 flex items-center gap-1 group cursor-pointer">
          Learn how FORCE RLS secures 14 tables
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
