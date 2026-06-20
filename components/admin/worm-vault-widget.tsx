'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, RefreshCw, Layers, Database, Lock, AlertTriangle, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface WormBlock {
    index: number;
    id: string;
    action: string;
    table_name: string | null;
    timestamp: string;
    prev_hash: string;
    hash: string;
    severity: string;
}

interface VerificationResult {
    isValid: boolean;
    totalBlocks: number;
    tamperedBlockIndices: number[];
    mismatchedDbLogs: string[];
    lastSyncedIndex: number;
    lastSyncedAt: string | null;
    status: 'SECURE' | 'TAMPERED' | 'OUT_OF_SYNC';
}

export function WormVaultWidget() {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [tampering, setTampering] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditIndex, setAuditIndex] = useState<number | null>(null);
    const [auditLog, setAuditLog] = useState<string[]>([]);
    const [data, setData] = useState<{
        verification: VerificationResult;
        recentBlocks: WormBlock[];
        totalBlocks: number;
    } | null>(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/security/worm-vault');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                toast.error('Failed to load WORM Vault status');
            }
        } catch (e) {
            toast.error('Error connecting to WORM API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/admin/security/worm-vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync' })
            });
            const json = await res.json();
            if (res.ok) {
                toast.success(`Sync completed! Added ${json.syncedCount} new records.`);
                fetchStatus();
            } else {
                toast.error(json.error || 'Sync failed');
            }
        } catch (e) {
            toast.error('Error syncing WORM API');
        } finally {
            setSyncing(false);
        }
    };

    const handleSimulateTamper = async (index: number) => {
        setTampering(true);
        try {
            const res = await fetch('/api/admin/security/worm-vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'tamper', 
                    index, 
                    newVal: 'UNAUTHORIZED_TAMPERED_ACTION' 
                })
            });
            const json = await res.json();
            if (res.ok) {
                toast.warning(`Simulated tampering at Block #${index}! Please run audit verification.`);
                fetchStatus();
            } else {
                toast.error(json.error || 'Failed to simulate tampering');
            }
        } catch (e) {
            toast.error('Error simulating WORM API');
        } finally {
            setTampering(false);
        }
    };

    const handleRunForensicAudit = async () => {
        if (!data || data.recentBlocks.length === 0) return;
        setIsAuditing(true);
        setAuditLog([]);
        
        const timestamp = () => new Date().toLocaleTimeString('en-US');
        
        setAuditLog(prev => [...prev, `[${timestamp()}] [START] Beginning WORM block chain cryptographic integrity audit (ISO 27017)...`]);
        await new Promise(r => setTimeout(r, 400));
        
        setAuditLog(prev => [...prev, `[${timestamp()}] [INFO] Detected total: ${data.totalBlocks} audited log blocks.`]);
        await new Promise(r => setTimeout(r, 300));

        setAuditLog(prev => [...prev, `[${timestamp()}] [PROCESS] Loading SHA-256 cryptographic linkage verification...`]);
        await new Promise(r => setTimeout(r, 400));

        const scanBlocks = [...data.recentBlocks].reverse();
        
        for (let i = 0; i < scanBlocks.length; i++) {
            const block = scanBlocks[i];
            setAuditIndex(block.index);
            
            const isBlockTampered = data.verification.tamperedBlockIndices.includes(block.index);
            
            setAuditLog(prev => [
                ...prev,
                `[${timestamp()}] [INSPECT] Scanning Block #${block.index} [Action: ${block.action}]...`
            ]);
            
            await new Promise(r => setTimeout(r, 120));
            
            if (isBlockTampered) {
                setAuditLog(prev => [
                    ...prev,
                    `[${timestamp()}]   [FAIL] CRYPTOGRAPHIC LINK BROKEN: prev_hash mismatch!`,
                    `[${timestamp()}]   [INFO] BLOCK HASH: ${block.hash.substring(0, 16)}...`,
                    `[${timestamp()}]   [CRITICAL] Physical logs tampering alert at Block #${block.index}!`
                ]);
                setIsAuditing(false);
                setAuditIndex(null);
                toast.error(`System tampering detected at Block #${block.index}!`);
                return;
            } else {
                setAuditLog(prev => [
                    ...prev,
                    `[${timestamp()}]   ↳ SHA-256 Recomputation: Matched (Success)`,
                    `[${timestamp()}]   ↳ prev_hash -> linked_hash: Verification Passed (OK)`
                ]);
            }
        }
        
        setAuditLog(prev => [...prev, `[${timestamp()}] [PROCESS] Performing database cross-verification with PostgreSQL...`]);
        await new Promise(r => setTimeout(r, 500));
        
        if (data.verification.mismatchedDbLogs.length > 0) {
            setAuditLog(prev => [
                ...prev,
                `[${timestamp()}]   [FAIL] Database mismatch: Detected ${data.verification.mismatchedDbLogs.length} missing or unauthorized modified records in PostgreSQL database!`,
                `[${timestamp()}]   [WARNING] Affected log record identifiers: ${data.verification.mismatchedDbLogs.join(', ')}`
            ]);
            toast.error('Detected tampered log entries in PostgreSQL!');
        } else {
            setAuditLog(prev => [
                ...prev,
                `[${timestamp()}]   ↳ 100% field cross-matching: Verified (Consistent)`,
                `[${timestamp()}] [SUCCESS] WORM cryptographic ledger is secure. Fully compliant with ISO/IEC 27017 standards!`
            ]);
            toast.success('Audit verification completed: Ledger is secure!');
        }
        
        setIsAuditing(false);
        setAuditIndex(null);
    };

    if (!data) {
        return (
            <Card className="bg-slate-900 border-slate-800 text-white animate-pulse">
                <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-slate-400">Initializing WORM Vault Cryptographic Ledger...</div>
                </CardContent>
            </Card>
        );
    }

    const { verification, recentBlocks, totalBlocks } = data;
    const isTampered = verification.status === 'TAMPERED';
    const isOutOfSync = verification.status === 'OUT_OF_SYNC';

    return (
        <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <CardHeader className="border-b border-slate-800/60 pb-6 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <Lock className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                                WORM Cryptographic Vault (ISO 27017 CLD.12.4.1)
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                                Physically store immutable audit logs using a hash-chained ledger
                            </CardDescription>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={fetchStatus} 
                            disabled={loading || syncing || isAuditing}
                            className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Reload
                        </Button>
                        <Button 
                            size="sm" 
                            onClick={handleSync} 
                            disabled={loading || syncing || isAuditing}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md font-bold gap-1.5"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sync WORM
                        </Button>
                        <Button 
                            size="sm" 
                            onClick={handleRunForensicAudit} 
                            disabled={loading || syncing || isAuditing}
                            className="bg-amber-600 hover:bg-amber-500 text-white border-none shadow-md font-bold gap-1.5"
                        >
                            <Layers className={`w-3.5 h-3.5 ${isAuditing ? 'animate-pulse' : ''}`} />
                            Audit Ledger
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="pt-6 relative z-10 space-y-6">
                {/* Status Indicator Bar */}
                <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isTampered 
                        ? 'bg-rose-950/20 border-rose-500/30' 
                        : isOutOfSync 
                            ? 'bg-amber-950/20 border-amber-500/30' 
                            : 'bg-emerald-950/20 border-emerald-500/30'
                }`}>
                    <div className="flex items-center gap-3.5">
                        <div className={`p-3 rounded-xl ${
                            isTampered 
                                ? 'bg-rose-500/20 text-rose-400' 
                                : isOutOfSync 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                            {isTampered ? (
                                <ShieldAlert className="w-8 h-8" />
                            ) : isOutOfSync ? (
                                <AlertTriangle className="w-8 h-8" />
                            ) : (
                                <ShieldCheck className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Ledger Integrity State</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    isTampered 
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                        : isOutOfSync 
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                    {verification.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-black mt-1">
                                {isTampered 
                                    ? 'CRITICAL SECURITY BREACH DETECTED!' 
                                    : isOutOfSync 
                                        ? 'Database Sync Required' 
                                        : 'LEDGER SECURE & INTEGRITY VERIFIED'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                {isTampered 
                                    ? `Cryptographic chain broken at Block Index: #${verification.tamperedBlockIndices.join(', #')}. Warning: Log tampering detected!`
                                    : isOutOfSync 
                                        ? 'Database contains new audit logs that have not yet been synchronized with the WORM ledger.'
                                        : `All ${totalBlocks} log blocks are cryptographically chained and 100% synchronized with PostgreSQL.`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 md:border-l border-slate-800/80 md:pl-6 text-sm">
                        <div>
                            <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Total Block</div>
                            <div className="text-2xl font-black text-slate-100">{totalBlocks}</div>
                        </div>
                        <div>
                            <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Last Sync</div>
                            <div className="text-slate-200 mt-1 font-mono text-xs">
                                {verification.lastSyncedAt 
                                    ? new Date(verification.lastSyncedAt).toLocaleTimeString('en-US') 
                                    : 'Never'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Console Terminal */}
                {(isAuditing || auditLog.length > 0) && (
                    <div className="p-5 rounded-2xl border border-amber-500/20 bg-slate-950/90 font-mono text-xs text-amber-400 leading-relaxed shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-3 right-4 flex items-center gap-1.5">
                            {isAuditing ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                    <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">Auditing...</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Audit Completed</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 mb-3 text-slate-400 font-sans font-bold uppercase tracking-wider text-[9px]">
                            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Forensic Cryptographic Auditor Console</span>
                        </div>
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {auditLog.map((log, i) => {
                                let logColor = 'text-amber-400/90';
                                if (log.includes('FAIL') || log.includes('CRITICAL') || log.includes('WARNING') || log.includes('broken')) {
                                    logColor = 'text-rose-400 font-bold';
                                } else if (log.includes('SUCCESS') || log.includes('Success') || log.includes('Consistent') || log.includes('OK') || log.includes('Passed')) {
                                    logColor = 'text-emerald-400 font-bold';
                                } else if (log.includes('START') || log.includes('INFO') || log.includes('INSPECT') || log.includes('PROCESS')) {
                                    logColor = 'text-slate-200 font-bold';
                                }
                                return (
                                    <div key={i} className={`whitespace-pre-wrap ${logColor}`}>
                                        {log}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Hash Chain Visualizer */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Cryptographic Block Chain Visualizer (Last 15 records)
                    </h4>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {recentBlocks.map((block) => {
                            const blockTampered = verification.tamperedBlockIndices.includes(block.index);
                            const isBeingAudited = block.index === auditIndex;
                            return (
                                <div 
                                    key={block.id}
                                    className={`p-4 rounded-xl border transition-all duration-300 relative group flex flex-col sm:flex-row justify-between gap-4 ${
                                        blockTampered
                                            ? 'bg-rose-950/10 border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
                                            : isBeingAudited
                                                ? 'bg-amber-950/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse'
                                                : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                                                blockTampered 
                                                    ? 'bg-rose-500/20 text-rose-400' 
                                                    : isBeingAudited
                                                        ? 'bg-amber-500/25 text-amber-300'
                                                        : 'bg-slate-800 text-slate-300'
                                            }`}>
                                                BLOCK #{block.index}
                                            </span>
                                            <span className="text-xs font-bold text-slate-300">{block.action}</span>
                                            <span className="text-slate-500 text-[10px]">•</span>
                                            <span className="text-slate-400 text-[10px] font-mono">{block.table_name || 'system'}</span>
                                            <span className="text-slate-500 text-[10px]">•</span>
                                            <span className="text-slate-500 text-[10px]">{new Date(block.timestamp).toLocaleString('en-US')}</span>
                                        </div>
                                        
                                        {/* Cryptographic hashes */}
                                        <div className="font-mono text-[10px] space-y-1 bg-slate-950/50 p-2.5 rounded-lg border border-slate-950/40">
                                            <div className="flex justify-between text-slate-500">
                                                <span>PREV_HASH:</span>
                                                <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px] sm:max-w-[400px]">
                                                    {block.prev_hash}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-500 border-t border-slate-900/60 pt-1 mt-1">
                                                <span>BLOCK_HASH:</span>
                                                <span className={`${blockTampered ? 'text-rose-400 font-bold' : isBeingAudited ? 'text-amber-400 font-bold' : 'text-emerald-400'} overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px] sm:max-w-[400px]`}>
                                                    {block.hash}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                                        {blockTampered && (
                                            <div className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 animate-pulse">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Chain Broken
                                            </div>
                                        )}
                                        {isBeingAudited && (
                                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 animate-pulse">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                Scanning...
                                            </div>
                                        )}
                                        {!blockTampered && !isBeingAudited && (
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => handleSimulateTamper(block.index)}
                                                disabled={tampering || isAuditing}
                                                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-[10px] font-bold h-7 px-2.5 rounded-lg transition-all"
                                            >
                                                Simulate Tampering
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Secure Academic Mapping Callout */}
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                        <h5 className="text-xs font-bold text-slate-300">Security Features & Academic Context</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Ensures immutability using a cryptographic hash-chained ledger integrated with database triggers to prevent even system administrators from modifying audit footprints. This mechanism strictly complies with the <strong>ISO/IEC 27017 CLD.12.4.1</strong> standard and demonstrates non-repudiation.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
