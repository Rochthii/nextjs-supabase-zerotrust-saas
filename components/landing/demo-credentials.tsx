"use client";

import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, Key } from 'lucide-react';

export default function DemoCredentials() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const creds = [
    {
      role: "Global Super Admin",
      email: "superadmin@tenantshield.dev",
      pass: "SuperAdmin@123",
      desc: "Full administrative access. Manages all tenants, SOC analytics, Edge SOAR firewalls, and AI security narrative configurations."
    },
    {
      role: "Tenant Member (Acme Corp)",
      email: "member@acme.tenantshield.dev",
      pass: "Member@123",
      desc: "Isolated workspace access. Demonstrates client row-level security boundaries. Cannot view other tenant data or global SOC metrics."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      {creds.map((cred, idx) => (
        <div 
          key={idx}
          className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-slate-800 transition-colors"
        >
          {/* Card Head */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                idx === 0 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {cred.role}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Sandbox Demo Environment</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {cred.desc}
            </p>

            {/* Email Field */}
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Email Address</span>
                  <span className="text-xs font-mono text-slate-300 select-all">{cred.email}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(cred.email, `${idx}-email`)}
                  className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy email"
                >
                  {copiedField === `${idx}-email` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-up" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Password Field */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Password</span>
                  <span className="text-xs font-mono text-slate-300 select-all">{cred.pass}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(cred.pass, `${idx}-pass`)}
                  className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy password"
                >
                  {copiedField === `${idx}-pass` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-up" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-8 pt-4 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Key className="w-3 h-3 text-slate-500" />
              Pre-seeded credential
            </span>
            <a 
              href="/login" 
              className={`text-xs font-black flex items-center gap-1.5 hover:underline ${
                idx === 0 ? 'text-amber-400' : 'text-indigo-400'
              }`}
            >
              Sign In Now
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
