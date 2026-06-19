/**
 * Reusable Khmer decorative pattern background overlay.
 * Extracted from culture pages to avoid repeating large inline SVG data URIs.
 */
export function KhmerPatternBg({ className = '' }: { className?: string }) {
    return (
        <div
            className={`absolute inset-0 z-0 ${className}`}
            style={{
                opacity: 'var(--theme-pattern-opacity, 0.05)',
                // Using an SVG mask or currentColor is harder with background-image data URL,
                // so we rely on CSS variable opacity to blend it softly with the dynamic background
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                // We changed the fill to black (%23000000) so it acts as a very subtle, neutral darkening overlay 
                // regardless of whether the background is warm beige or white.
            }}
        />
    );
}
