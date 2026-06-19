import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

/**
 * Base Skeleton — shimmer wave animation với màu gold nhạt để sync
 * phong cách Phật giáo thay vì gray trung tính.
 * CSS shimmer animation được inject vào globals.css qua @keyframes shimmer.
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded bg-gray-100',
                className
            )}
            aria-hidden="true"
        >
            {/* shimmer sweep */}
            <span
                className="absolute inset-0 block"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 0%, rgba(212,168,96,0.12) 40%, rgba(212,168,96,0.22) 50%, rgba(212,168,96,0.12) 60%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-shimmer 1.6s ease-in-out infinite',
                }}
            />
        </div>
    );
}
