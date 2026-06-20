'use client';

import React, { useEffect, useState } from 'react';
import { User, Globe, Fingerprint, Shield, ShieldAlert, Cpu } from 'lucide-react';

type Scenario = 'cross_tenant_read' | 'cache_pollution' | 'sql_injection' | 'noisy_neighbor';

interface SimulationResult {
    scenario: Scenario;
    blocked: boolean;
    audit_logged: boolean;
    defense_layer?: string;
    latency_ms: number;
    why_blocked?: string;
}

interface AttackFlowMapProps {
    activeScenario: Scenario;
    running: boolean;
    phase: string;
    result: SimulationResult | null;
}

// Define 5 Nodes in the Layered Zero Trust model
interface FlowNode {
    id: number;
    name: string;
    desc: string;
    icon: React.ReactNode;
    layer: 'client' | 'edge' | 'auth' | 'rls' | 'abac';
}

const FLOW_NODES: FlowNode[] = [
    {
        id: 1,
        name: 'Attacker Client',
        desc: 'Access from WAN (Unknown IP)',
        icon: <User className="w-5 h-5" />,
        layer: 'client'
    },
    {
        id: 2,
        name: 'Edge Security',
        desc: 'Next.js Edge Middleware / Redis',
        icon: <Globe className="w-5 h-5" />,
        layer: 'edge'
    },
    {
        id: 3,
        name: 'Identity & JWT',
        desc: 'RAM-based Custom JWT Claims',
        icon: <Fingerprint className="w-5 h-5" />,
        layer: 'auth'
    },
    {
        id: 4,
        name: 'Database RLS',
        desc: 'PostgreSQL Row-Level Security',
        icon: <Shield className="w-5 h-5" />,
        layer: 'rls'
    },
    {
        id: 5,
        name: 'Context ABAC',
        desc: 'PL/pgSQL temporal & IP trigger',
        icon: <Cpu className="w-5 h-5" />,
        layer: 'abac'
    }
];

export function AttackFlowMap({ activeScenario, running, phase, result }: AttackFlowMapProps) {
    const [progressNode, setProgressNode] = useState<number>(0);
    const [blockedNode, setBlockedNode] = useState<number | null>(null);

    // Determine which Node will be the block point for each Scenario
    const getBlockedNodeForScenario = (scen: Scenario): number => {
        switch (scen) {
            case 'cache_pollution':
                return 2; // Edge Cache Layer blocks cross Cache Poisoning
            case 'noisy_neighbor':
                return 2; // Connection Limit protects at the Route/Pooler gateway
            case 'sql_injection':
                return 4; // RLS / Parameterized Query blocks SQL Injection
            case 'cross_tenant_read':
                return 4; // DB RLS blocks cross-tenant access
            default:
                return 4;
        }
    };

    // Control active dot animation and Node status when running Simulator
    useEffect(() => {
        if (running) {
            setBlockedNode(null);
            setProgressNode(1);
            
            // Simulate packet flow through layers
            const interval = setInterval(() => {
                setProgressNode(prev => {
                    const targetBlock = getBlockedNodeForScenario(activeScenario);
                    if (prev < targetBlock) {
                        return prev + 1;
                    }
                    clearInterval(interval);
                    return prev;
                });
            }, 600);

            return () => clearInterval(interval);
        } else if (result) {
            const targetBlock = getBlockedNodeForScenario(activeScenario);
            setProgressNode(targetBlock);
            setBlockedNode(result.blocked ? targetBlock : null);
        } else {
            setProgressNode(0);
            setBlockedNode(null);
        }
    }, [running, result, activeScenario]);

    // Get status color for Node
    const getNodeStateColor = (node: FlowNode) => {
        const targetBlock = getBlockedNodeForScenario(activeScenario);
        
        if (running) {
            if (node.id === progressNode) {
                return {
                    border: 'border-amber-500 shadow-amber-500/30 bg-amber-950/20 text-amber-400',
                    pulse: 'animate-pulse'
                };
            }
            if (node.id < progressNode) {
                return {
                    border: 'border-emerald-500/60 shadow-emerald-500/10 bg-slate-900/80 text-emerald-400',
                    pulse: ''
                };
            }
            return {
                border: 'border-slate-800 bg-slate-950/40 text-slate-600',
                pulse: ''
            };
        }

        if (result) {
            if (node.id === blockedNode) {
                return {
                    border: 'border-rose-500 shadow-rose-500/40 bg-rose-950/30 text-rose-400 animate-pulse',
                    pulse: 'shadow-lg border-2'
                };
            }
            if (node.id < targetBlock) {
                return {
                    border: 'border-emerald-500/60 bg-slate-900/80 text-emerald-400',
                    pulse: ''
                };
            }
            return {
                border: 'border-slate-800 bg-slate-950/40 text-slate-600',
                pulse: ''
            };
        }

        // Initial static status
        if (node.id === 1) {
            return {
                border: 'border-rose-500/40 bg-rose-950/10 text-rose-400',
                pulse: ''
            };
        }
        return {
            border: 'border-slate-800 bg-slate-900/30 text-slate-400',
            pulse: ''
        };
    };

    return (
        <div className="border border-rose-500/20 bg-slate-950/60 backdrop-blur-xl rounded-3xl p-6 space-y-6 relative overflow-hidden">
            {/* SVG Glowing Filter Definition */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
            </svg>

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-white font-black text-sm flex items-center gap-1.5 uppercase tracking-wide">
                        Zero Trust Defense Architecture Map
                    </h3>
                    <p className="text-slate-500 text-[10px] mt-0.5">
                        Visualize request lifecycles and real-time security mitigation points
                    </p>
                </div>
                {running && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black animate-pulse">
                        DEFENSE SHIELD ACTIVE
                    </span>
                )}
            </div>

            {/* Nodes & Path Diagram */}
            <div className="relative py-4 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 z-10">
                {/* SVG Connection Paths for Desktop */}
                <div className="absolute inset-0 pointer-events-none hidden md:block z-0" style={{ height: '70px', top: '25px' }}>
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {/* Base Gray Paths */}
                        <line x1="10%" y1="50%" x2="30%" y2="50%" stroke="#1e293b" strokeWidth="3" />
                        <line x1="30%" y1="50%" x2="50%" y2="50%" stroke="#1e293b" strokeWidth="3" />
                        <line x1="50%" y1="50%" x2="70%" y2="50%" stroke="#1e293b" strokeWidth="3" />
                        <line x1="70%" y1="50%" x2="90%" y2="50%" stroke="#1e293b" strokeWidth="3" />

                        {/* Animated Glowing Active Paths */}
                        {progressNode >= 2 && (
                            <line 
                                x1="10%" y1="50%" x2="30%" y2="50%" 
                                stroke={blockedNode === 2 ? '#f43f5e' : '#10b981'} 
                                strokeWidth="3" 
                                filter={blockedNode === 2 ? 'url(#glow-rose)' : 'url(#glow-green)'} 
                                className="transition-all duration-500"
                            />
                        )}
                        {progressNode >= 3 && blockedNode !== 2 && (
                            <line 
                                x1="30%" y1="50%" x2="50%" y2="50%" 
                                stroke="#10b981" 
                                strokeWidth="3" 
                                filter="url(#glow-green)" 
                                className="transition-all duration-500"
                            />
                        )}
                        {progressNode >= 4 && blockedNode !== 2 && (
                            <line 
                                x1="50%" y1="50%" x2="70%" y2="50%" 
                                stroke={blockedNode === 4 ? '#f43f5e' : '#10b981'} 
                                strokeWidth="3" 
                                filter={blockedNode === 4 ? 'url(#glow-rose)' : 'url(#glow-green)'}
                                className="transition-all duration-500"
                            />
                        )}
                        {progressNode >= 5 && blockedNode !== 2 && blockedNode !== 4 && (
                            <line 
                                x1="70%" y1="50%" x2="90%" y2="50%" 
                                stroke={blockedNode === 5 ? '#f43f5e' : '#10b981'} 
                                strokeWidth="3" 
                                filter={blockedNode === 5 ? 'url(#glow-rose)' : 'url(#glow-green)'}
                                className="transition-all duration-500"
                            />
                        )}

                        {/* Particle Dot Moving along the path during simulation */}
                        {running && (
                            <circle r="5" fill="#f59e0b" filter="url(#glow-amber)">
                                <animateMotion 
                                    dur="1.8s" 
                                    repeatCount="indefinite" 
                                    path={`M ${10 + (progressNode - 1) * 20}% 35 C ${20 + (progressNode - 1) * 20}% 35, ${20 + (progressNode - 1) * 20}% 35, ${10 + progressNode * 20}% 35`}
                                    keyPoints="0;1"
                                    keyTimes="0;1"
                                />
                            </circle>
                        )}
                    </svg>
                </div>

                {/* Render Nodes */}
                {FLOW_NODES.map((node) => {
                    const style = getNodeStateColor(node);
                    const isBlocked = blockedNode === node.id;
                    return (
                        <div key={node.id} className="flex flex-col items-center text-center relative z-10 w-full md:w-1/5">
                            {/* Circle Node Icon */}
                            <div className={`w-14 h-14 rounded-2xl border backdrop-blur-xl flex items-center justify-center transition-all duration-500 ${style.border} ${style.pulse}`}>
                                {isBlocked ? <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" /> : node.icon}
                            </div>

                            {/* Node Name */}
                            <span className={`text-[11px] font-black uppercase mt-3 tracking-wider ${isBlocked ? 'text-rose-400' : 'text-slate-200'}`}>
                                {node.name}
                            </span>
                            {/* Node Desc */}
                            <span className="text-[9px] text-slate-500 leading-tight mt-1 max-w-[120px] hidden md:block">
                                {node.desc}
                            </span>

                            {/* Node Status Badge */}
                            {result && isBlocked && (
                                <span className="absolute -top-3 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[8px] font-black uppercase px-2 py-0.5 rounded shadow shadow-rose-950 animate-pulse">
                                    BLOCKED
                                </span>
                            )}
                            {result && !isBlocked && node.id < getBlockedNodeForScenario(activeScenario) && (
                                <span className="absolute -top-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                                    PASSED
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Rejection Details in SOC Map Context */}
            {result && result.blocked && (
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-black text-rose-300 uppercase tracking-widest">
                            [Security Defense Layer] {result.defense_layer || FLOW_NODES[getBlockedNodeForScenario(activeScenario) - 1].name}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        The simulated attack vector was successfully detected and isolated at the <strong>{result.defense_layer || FLOW_NODES[getBlockedNodeForScenario(activeScenario) - 1].name}</strong> layer. The database and tenant records remain fully integrated and secure under the Zero Trust framework.
                    </p>
                </div>
            )}
        </div>
    );
}
