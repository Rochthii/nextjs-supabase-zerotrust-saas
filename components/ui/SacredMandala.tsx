'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function SacredMandala({ 
    className = "", 
    size = 800,
    color = "rgb(var(--theme-primary))" 
}) {
    return (
        <div className={`relative flex items-center justify-center pointer-events-none ${className}`} style={{ width: size, height: size }}>
            {/* Layer 1: Outer Rotating Ring (Sparse dots) */}
            <motion.svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full opacity-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
                <circle
                    cx="50" cy="50" r="48"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeDasharray="1 10"
                    fill="none"
                />
            </motion.svg>

            {/* Layer 2: Main Lotus Petals (Staggered Rotation) */}
            <motion.svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full opacity-30"
                animate={{ rotate: -360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            >
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.path
                        key={i}
                        d="M50 15 C55 25 65 35 50 50 C35 35 45 25 50 15"
                        fill="none"
                        stroke={color}
                        strokeWidth="0.3"
                        transform={`rotate(${i * 30} 50 50)`}
                    />
                ))}
            </motion.svg>

            {/* Layer 3: Inner Geometric Pattern (Pulsing) */}
            <motion.svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full opacity-40"
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
                <circle
                    cx="50" cy="50" r="25"
                    stroke={color}
                    strokeWidth="0.2"
                    fill="none"
                />
                <circle
                    cx="50" cy="50" r="20"
                    stroke={color}
                    strokeWidth="0.1"
                    strokeDasharray="2 2"
                    fill="none"
                />
                {/* 8 small circles (Octagonal) */}
                {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    const x = 50 + 20 * Math.cos(angle);
                    const y = 50 + 20 * Math.sin(angle);
                    return (
                        <circle
                            key={i}
                            cx={x} cy={y} r="1.5"
                            fill={color}
                            fillOpacity="0.5"
                        />
                    );
                })}
            </motion.svg>

            {/* Layer 4: Center Lotus (Static/Breathing) */}
            <motion.svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full opacity-60"
            >
                <path
                    d="M50 40 C52 44 55 46 50 50 C45 46 48 44 50 40"
                    fill={color}
                />
                <circle cx="50" cy="50" r="2" fill="white" fillOpacity="0.2" />
            </motion.svg>

            {/* Subtle Radial Glow */}
            <div 
                className="absolute inset-0 rounded-full blur-[100px] opacity-10 pointer-events-none"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}
