import React from 'react';

interface KhmerCornerProps {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function KhmerCorner({ position, size = 'md', className = '' }: KhmerCornerProps) {
    const sizeMap = {
        sm: 'w-16 h-16 md:w-20 md:h-20',
        md: 'w-20 h-20 md:w-32 md:h-32',
        lg: 'w-24 h-24 md:w-40 md:h-40',
    };

    const positionMap = {
        'top-left': 'top-0 left-0',
        'top-right': 'top-0 right-0 rotate-90',
        'bottom-left': 'bottom-0 left-0 -rotate-90',
        'bottom-right': 'bottom-0 right-0 rotate-180',
    };

    return (
        <div className={`absolute ${positionMap[position]} ${sizeMap[size]} ${className} pointer-events-none opacity-30 md:opacity-50`}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Khmer-inspired ornamental corner pattern */}
                <path
                    d="M0 0 L30 0 C30 0 28 15 20 25 C12 35 5 40 0 45 L0 0Z"
                    fill="currentColor"
                    className="text-brown-DEFAULT transition-colors duration-300"
                />
                <path
                    d="M0 0 L0 30 C0 30 15 28 25 20 C35 12 40 5 45 0 L0 0Z"
                    fill="currentColor"
                    className="text-gold-primary transition-colors duration-300"
                />
                {/* Inner decorative curves */}
                <circle cx="15" cy="15" r="3" fill="currentColor" className="text-saffron transition-colors duration-300" />
                <circle cx="25" cy="8" r="2" fill="currentColor" className="text-saffron transition-colors duration-300" />
                <circle cx="8" cy="25" r="2" fill="currentColor" className="text-saffron transition-colors duration-300" />
                {/* Lotus petal shapes */}
                <path
                    d="M35 10 Q40 5 45 10 Q40 12 35 10Z"
                    fill="currentColor"
                    className="text-gold-primary transition-colors duration-300"
                />
                <path
                    d="M10 35 Q5 40 10 45 Q12 40 10 35Z"
                    fill="currentColor"
                    className="text-gold-primary transition-colors duration-300"
                />
            </svg>
        </div>
    );
}
