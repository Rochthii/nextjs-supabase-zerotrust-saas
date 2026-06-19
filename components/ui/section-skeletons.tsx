/**
 * Section skeletons — mỗi skeleton được thiết kế đúng shape của section thực,
 * đảm bảo none layout shift khi content load xong.
 *
 * Dùng trong: page.tsx Suspense fallback & dynamic() loading fallback
 */

import { Skeleton } from '@/components/ui/skeleton';

/* ──────────────────────────────────────────────────────────────────────
   1. PhapAmPreviewSection Skeleton
   Section: 3 audio/video cards nằm ngang (scroll trên mobile)
   ────────────────────────────────────────────────────────────────────── */
export function PhapAmSkeleton() {
    return (
        <section className="py-12 px-4 bg-ivory">
            <div className="max-w-6xl mx-auto">
                {/* Heading block */}
                <div className="text-center mb-8 space-y-3">
                    <Skeleton className="h-3 w-24 mx-auto rounded-full" />
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                </div>

                {/* 3 cards — stack on mobile, row on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                            {/* Thumbnail / play area */}
                            <Skeleton className="h-44 w-full rounded-none" />
                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-5 w-4/5" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex items-center gap-3 pt-1">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA button */}
                <div className="mt-8 flex justify-center">
                    <Skeleton className="h-10 w-40 rounded-full" />
                </div>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   2. LatestNewsSection Skeleton (homepage preview — 3 cards)
   ────────────────────────────────────────────────────────────────────── */
export function NewsHomeSkeleton() {
    return (
        <section className="py-12 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Heading */}
                <div className="text-center mb-8 space-y-3">
                    <Skeleton className="h-3 w-20 mx-auto rounded-full" />
                    <Skeleton className="h-8 w-56 mx-auto" />
                </div>

                {/* Featured card (large) + 2 small cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Featured */}
                    <div className="md:col-span-2 rounded-xl overflow-hidden bg-gray-50">
                        <Skeleton className="h-56 md:h-72 w-full rounded-none" />
                        <div className="p-5 space-y-3">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-7 w-full" />
                            <Skeleton className="h-7 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>

                    {/* 2 side cards */}
                    <div className="space-y-4">
                        {[0, 1].map((i) => (
                            <div key={i} className="flex gap-3 rounded-xl overflow-hidden bg-gray-50 p-3">
                                <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
                                <div className="flex-1 space-y-2 py-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-4/5" />
                                    <Skeleton className="h-3 w-1/2 mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 flex justify-center">
                    <Skeleton className="h-10 w-36 rounded-full" />
                </div>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   3. KhmerCalendarSection Skeleton
   Section: calendar grid + list of upcoming events
   ────────────────────────────────────────────────────────────────────── */
export function CalendarSkeleton() {
    return (
        <section className="py-12 px-4 bg-amber-50/40">
            <div className="max-w-5xl mx-auto">
                {/* Heading */}
                <div className="text-center mb-8 space-y-3">
                    <Skeleton className="h-3 w-28 mx-auto rounded-full" />
                    <Skeleton className="h-8 w-60 mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calendar area */}
                    <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
                        {/* Month header */}
                        <div className="flex justify-between items-center mb-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        {/* Day names */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton key={i} className="h-6 w-full rounded" />
                            ))}
                        </div>
                        {/* Date cells */}
                        {Array.from({ length: 5 }).map((_, row) => (
                            <div key={row} className="grid grid-cols-7 gap-1">
                                {Array.from({ length: 7 }).map((_, col) => (
                                    <Skeleton key={col} className="h-9 w-full rounded" />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Event list */}
                    <div className="space-y-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-xl bg-white shadow-sm">
                                {/* Date badge */}
                                <div className="flex-shrink-0 w-12 space-y-1 text-center">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   4. FacebookFeedSection Skeleton
   Section: iframe embed + 2-3 post preview cards
   ────────────────────────────────────────────────────────────────────── */
export function FacebookFeedSkeleton() {
    return (
        <section className="py-12 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
                {/* Heading */}
                <div className="text-center mb-8 space-y-3">
                    <Skeleton className="h-3 w-24 mx-auto rounded-full" />
                    <Skeleton className="h-8 w-52 mx-auto" />
                </div>

                {/* Facebook embed area */}
                <div className="rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
                    <Skeleton className="h-[400px] md:h-[500px] w-full rounded-none" />
                </div>

                {/* Follow CTA */}
                <div className="mt-6 flex justify-center">
                    <Skeleton className="h-10 w-44 rounded-full" />
                </div>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   5. Page Pháp Thoại (/documents) full skeleton — dùng cho loading.tsx
   ────────────────────────────────────────────────────────────────────── */
export function PhapAmPageSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
            {/* Page title */}
            <div className="text-center space-y-3 mb-10">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-4 w-80 mx-auto" />
            </div>
            {/* Filter bar */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-24 flex-shrink-0 rounded-full" />
                ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                        <Skeleton className="h-44 w-full rounded-none" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   6. Lịch Lễ (/lich-le) page skeleton
   ────────────────────────────────────────────────────────────────────── */
export function LichLeSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
            <div className="text-center space-y-3 mb-10">
                <Skeleton className="h-10 w-60 mx-auto" />
                <Skeleton className="h-4 w-72 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                        <Skeleton className="h-52 w-full rounded-none" />
                        <div className="p-5 space-y-3">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   7. Hỏi Đáp (/hoi-dap) FAQ skeleton
   ────────────────────────────────────────────────────────────────────── */
export function FAQSkeleton() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
            <div className="text-center space-y-3 mb-10">
                <Skeleton className="h-10 w-56 mx-auto" />
                <Skeleton className="h-4 w-72 mx-auto" />
            </div>
            {/* Search bar */}
            <Skeleton className="h-12 w-full rounded-xl mb-6" />
            {/* FAQ items */}
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white shadow-sm p-4 space-y-2">
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ))}
        </div>
    );
}
