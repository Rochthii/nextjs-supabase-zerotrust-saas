import Link from 'next/link';
import { Home, Newspaper } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="text-center max-w-lg">
                {/* Divider deco */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="h-px w-16 bg-gold-primary/40" />
                    <div className="h-2 w-2 rounded-full bg-gold-primary/60" />
                    <div className="h-px w-16 bg-gold-primary/40" />
                </div>

                {/* Code */}
                <p className="text-[120px] leading-none font-playfair font-bold text-gold-primary/20 select-none mb-2">
                    404
                </p>

                {/* Title */}
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                    Page Not Found
                </h1>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-10">
                    The page you are looking for does not exist or has been moved to another location.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/en"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gold-primary text-white rounded-md hover:bg-gold-dark transition-colors text-sm font-medium"
                    >
                        <Home className="h-4 w-4" />
                        Homepage
                    </Link>
                    <Link
                        href="/en/news"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <Newspaper className="h-4 w-4" />
                        News
                    </Link>
                </div>

                {/* Footer deco */}
                <div className="flex items-center justify-center gap-3 mt-12">
                    <div className="h-px w-16 bg-gray-200" />
                    <p className="text-xs text-gray-400">Multi-tenant Ecosystem</p>
                    <div className="h-px w-16 bg-gray-200" />
                </div>
            </div>
        </div>
    );
}
