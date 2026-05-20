'use client';
// components/PropertyFilters.tsx — Client Component (updates URL search params)

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = ['all', 'Land', 'Residential', 'Commercial', 'Industrial'] as const;

const PRICE_RANGES = [
    { label: 'Any Price', min: undefined, max: undefined },
    { label: 'Under 50 Lac', min: undefined, max: 5_000_000 },
    { label: '50 Lac – 1 Crore', min: 5_000_000, max: 10_000_000 },
    { label: '1 – 5 Crore', min: 10_000_000, max: 50_000_000 },
    { label: 'Above 5 Crore', min: 50_000_000, max: undefined },
];

export default function PropertyFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const activeCategory = params.get('category') ?? 'all';
    const activeMin = params.get('minPrice');
    const activeMax = params.get('maxPrice');

    const push = useCallback(
        (updates: Record<string, string | undefined>) => {
            const next = new URLSearchParams(params.toString());
            Object.entries(updates).forEach(([k, v]) => {
                if (v === undefined) next.delete(k);
                else next.set(k, v);
            });
            router.push(`${pathname}?${next.toString()}`);
        },
        [params, pathname, router]
    );

    const activePriceIndex = PRICE_RANGES.findIndex(
        (r) =>
            String(r.min ?? '') === (activeMin ?? '') &&
            String(r.max ?? '') === (activeMax ?? '')
    );

    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-8 flex flex-wrap gap-6 items-center">
            {/* Category */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide mr-1">
                    Category
                </span>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() =>
                            push({ category: cat === 'all' ? undefined : cat })
                        }
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                                ? 'bg-[--color-brand] text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                    >
                        {cat === 'all' ? 'All' : cat}
                    </button>
                ))}
            </div>

            <div className="w-px h-6 bg-stone-200 hidden sm:block" />

            {/* Price */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide mr-1">
                    Price
                </span>
                <select
                    value={activePriceIndex === -1 ? 0 : activePriceIndex}
                    onChange={(e) => {
                        const r = PRICE_RANGES[Number(e.target.value)];
                        push({
                            minPrice: r.min ? String(r.min) : undefined,
                            maxPrice: r.max ? String(r.max) : undefined,
                        });
                    }}
                    className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand]"
                >
                    {PRICE_RANGES.map((r, i) => (
                        <option key={i} value={i}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Clear */}
            {(activeCategory !== 'all' || activeMin || activeMax) && (
                <button
                    onClick={() => router.push(pathname)}
                    className="ml-auto text-xs text-stone-400 hover:text-stone-700 transition-colors"
                >
                    Clear filters ×
                </button>
            )}
        </div>
    );
}