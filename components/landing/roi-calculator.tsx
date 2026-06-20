"use client";

import React, { useState } from 'react';
import { DollarSign, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function RoiCalculator() {
  const [hourlyRate, setHourlyRate] = useState<number>(85);
  const [monthsSaved, setMonthsSaved] = useState<number>(4);
  const [hoursPerMonth] = useState<number>(140); // Fixed standard estimation for SaaS setup

  // Calculations
  const devHoursSaved = monthsSaved * hoursPerMonth;
  const engineeringCostSaved = devHoursSaved * hourlyRate;
  const auditPrepHoursSaved = 80; // 2 weeks of audit prep documentation & policy analysis
  const auditCostSaved = auditPrepHoursSaved * hourlyRate;
  const totalSavings = engineeringCostSaved + auditCostSaved;
  
  // Starter price comparison
  const licenseCost = 89;
  const roiPercentage = ((totalSavings - licenseCost) / licenseCost) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto grid md:grid-cols-5 gap-8 items-center bg-slate-950/80 rounded-3xl border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Control Sliders (3 cols) */}
      <div className="md:col-span-3 space-y-8 z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive ROI Estimator</span>
          </div>
          <h4 className="text-2xl font-black text-slate-200 tracking-tight">Calculate Your Cost vs. Build Savings</h4>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Building FORCE RLS, cryptographic ledgers, Edge SOAR, and SOC dashboards takes specialized security engineering. Estimate how much TenantShield saves you.
          </p>
        </div>

        {/* Slider 1: Hourly Rate */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              Developer Hourly Rate
            </label>
            <span className="font-mono font-black text-indigo-400 text-base">${hourlyRate}/hr</span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="250" 
            value={hourlyRate} 
            onChange={(e) => setHourlyRate(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>$40/hr (Junior/Offshore)</span>
            <span>$150/hr (Senior)</span>
            <span>$250/hr (CISO/Security Architect)</span>
          </div>
        </div>

        {/* Slider 2: Months Saved */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-violet-400" />
              Months of Dev Time Saved
            </label>
            <span className="font-mono font-black text-violet-400 text-base">{monthsSaved} Months</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={monthsSaved} 
            onChange={(e) => setMonthsSaved(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500 border border-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 Month (Basic Setup)</span>
            <span>4 Months (Typical Compliance Stack)</span>
            <span>12 Months (Full Audit Readiness)</span>
          </div>
        </div>

        {/* What you avoid building list */}
        <div className="pt-2">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Included compliance infrastructure:</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>PostgreSQL FORCE RLS (160h)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>WORM Immutable Audit Vault (120h)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Edge SOAR IP Firewalls (80h)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>AI CISO Report & Audit Prep (80h)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Metrics (2 cols) */}
      <div className="md:col-span-2 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 text-center space-y-6 z-10 backdrop-blur-md">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Total Engineering Cost Saved</span>
          <div className="text-4xl sm:text-5xl font-black text-white mt-1 font-mono tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ${totalSavings.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Based on {devHoursSaved}h dev + {auditPrepHoursSaved}h audit prep saved.
          </p>
        </div>

        <div className="border-t border-slate-900 pt-6">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Net Return On Investment</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {roiPercentage.toLocaleString(undefined, { maximumFractionDigits: 0 })}% ROI
          </div>
          <p className="text-xs text-slate-500 mt-1">
            vs. $89 one-time license fee.
          </p>
        </div>

        <div className="border-t border-slate-900 pt-6">
          <div className="text-xs text-slate-300 font-bold bg-indigo-500/10 border border-indigo-500/20 rounded-xl py-3 px-4">
            🚀 Saves <strong>{(monthsSaved * 4.3).toFixed(0)} weeks</strong> of engineering effort. Skip the compliance backlog and launch today.
          </div>
        </div>
      </div>
    </div>
  );
}
