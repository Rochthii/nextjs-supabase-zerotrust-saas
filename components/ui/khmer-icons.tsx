import React from 'react';

interface LotusIconProps {
  className?: string;
  color?: string;
  size?: number | string;
  style?: React.CSSProperties;
}
export function LotusIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={!size ? className : undefined}
      style={style}
      aria-label="Lotus flower icon"
    >
      {/* Center stem */}
      <path d="M12 22v-8" />
      
      {/* Central petal */}
      <path d="M12 2C12 2 10 8 10 11C10 12.5 10.5 14 12 14C13.5 14 14 12.5 14 11C14 8 12 2 12 2Z" />
      
      {/* Left petal */}
      <path d="M6 14C6 14 7 9 8.5 8C9.5 7.3 10.5 7.5 11 8.5C11.5 9.5 11 11 10 12C9 13 6 14 6 14Z" />
      
      {/* Right petal */}
      <path d="M18 14C18 14 17 9 15.5 8C14.5 7.3 13.5 7.5 13 8.5C12.5 9.5 13 11 14 12C15 13 18 14 18 14Z" />
      
      {/* Far left petal */}
      <path d="M3 16C3 16 5 12 7 11.5C8.5 11 9.5 11.5 9.5 13C9.5 14.5 8.5 15.5 7 16C5.5 16.5 3 16 3 16Z" />
      
      {/* Far right petal */}
      <path d="M21 16C21 16 19 12 17 11.5C15.5 11 14.5 11.5 14.5 13C14.5 14.5 15.5 15.5 17 16C18.5 16.5 21 16 21 16Z" />
      
      {/* Base leaves */}
      <ellipse cx="12" cy="16" rx="8" ry="2" fill={color} opacity="0.2" />
    </svg>
  );
}

export function KhmerDrumIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color}
      strokeWidth="1.5"
      width={size}
      height={size}
      className={!size ? className : undefined}
      style={style}
      aria-label="Khmer drum icon"
    >
      {/* Drum body */}
      <ellipse cx="12" cy="8" rx="6" ry="2" />
      <ellipse cx="12" cy="16" rx="6" ry="2" />
      <path d="M6 8v8" />
      <path d="M18 8v8" />
      
      {/* Drum details */}
      <path d="M8 12h8" strokeDasharray="2 2" opacity="0.5" />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  );
}

export function DharmaWheelIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      width={size}
      height={size}
      className={!size ? className : undefined} 
      style={style} 
      aria-label="Dharma Wheel icon"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3v6.5" />
      <path d="M12 14.5V21" />
      <path d="M21 12h-6.5" />
      <path d="M3 12h6.5" />
      <path d="M5.6 5.6l4.6 4.6" />
      <path d="M18.4 18.4l-4.6-4.6" />
      <path d="M18.4 5.6l-4.6 4.6" />
      <path d="M5.6 18.4l4.6-4.6" />
    </svg>
  );
}

export function MeditatingPersonIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      width={size}
      height={size}
      className={!size ? className : undefined} 
      style={style} 
      aria-label="Meditating person icon"
    >
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v6" />
      <path d="M7 11.5c1.5-1 3.5-1 5 0s3.5 1 5 0" />
      <path d="M5 20c1-2 3-3 6-3h2c3 0 5 1 6 3" />
      <path d="M9 17l-3-2c-1-1-1-2 0-3l3 2" />
      <path d="M15 17l3-2c1-1 1-2 0-3l-3 2" />
    </svg>
  );
}

export function PrayerBeadsIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      width={size}
      height={size}
      className={!size ? className : undefined} 
      style={style} 
      aria-label="Prayer beads icon"
    >
      <circle cx="12" cy="12" r="8" strokeDasharray="2 2" opacity="0.3" />
      <circle cx="12" cy="4" r="1.5" fill={color} />
      <circle cx="17.6" cy="6.4" r="1.5" fill={color} />
      <circle cx="20" cy="12" r="1.5" fill={color} />
      <circle cx="17.6" cy="17.6" r="1.5" fill={color} />
      <circle cx="12" cy="20" r="1.5" fill={color} />
      <circle cx="6.4" cy="17.6" r="1.5" fill={color} />
      <circle cx="4" cy="12" r="1.5" fill={color} />
      <circle cx="6.4" cy="6.4" r="1.5" fill={color} />
      <path d="M12 20v3" strokeWidth="1" />
      <path d="M10 23h4" strokeWidth="1" />
    </svg>
  );
}

export function TenantIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      width={size}
      height={size}
      className={!size ? className : undefined} 
      style={style} 
      aria-label="Tenant icon"
    >
      <path d="M3 21h18" />
      <path d="M5 21v-7h14v7" />
      <path d="M2 14c2-2 5-3 10-3s8 1 10 3" />
      <path d="M7 11V7c1-2 3-3 5-3s4 1 5 3v4" />
      <path d="M12 2v2" />
      <rect x="10" y="17" width="4" height="4" />
    </svg>
  );
}

export function ChampaFlowerIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      width={size}
      height={size}
      className={!size ? className : undefined} 
      style={style} 
      aria-label="Champa flower icon"
    >
      <circle cx="12" cy="12" r="2" fill={color} />
      <path d="M12 10c0-4 4-6 6-2s-2 6-6 2Z" fill={color} opacity="0.4" />
      <path d="M14 12c4 0 6 4 2 6s-6-2-2-6Z" fill={color} opacity="0.6" />
      <path d="M12 14c0 4-4 6-6 2s2-6 6-2Z" fill={color} opacity="0.4" />
      <path d="M10 12c-4 0-6-4-2-6s6 2 2 6Z" fill={color} opacity="0.6" />
      <path d="M12 9c2-4 6-2 4 2s-4 2-4-2Z" fill={color} opacity="0.3" />
    </svg>
  );
}

export function HandsPrayerIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      width={size}
      height={size}
      className={!size ? className : undefined} 
      style={style} 
      aria-label="Hands in prayer icon"
    >
      <path d="M12 20c-2-1-3-4-3-8 0-4 1-8 3-10 2 2 3 6 3 10 0 4-1 7-3 8Z" />
      <path d="M9 12c-2 0-3.5-1.5-4-3" />
      <path d="M15 12c2 0 3.5-1.5 4-3" />
      <path d="M12 20v2" />
    </svg>
  );
}
export function OmIcon({ className = "w-6 h-6", color = "currentColor", size, style }: LotusIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      width={size}
      height={size}
      className={!size ? className : undefined} 
      style={style} 
      aria-label="Om symbol icon"
    >
      <path d="M12 7c2-2 5-2 5 2 0 4-5 9-5 9s-5-5-5-9c0-4 3-4 5-2z" />
      <path d="M12 12c-1-1-2-1-3 0-1 1-1 2 0 3s2 1 3 0c1-1 1-2 0-3z" />
      <path d="M17 12c1 1 2 1 3 0 1-1 1-2 0-3s-2-1-3 0c-1 1-1 2 0 3z" />
      <path d="M12 3c1 1 2 1 3 0" />
    </svg>
  );
}
