// components/PropertyCard.tsx — Server Component
import Link from 'next/link';
import type { PropertyRow } from '@/types/database';

interface Props {
    property: PropertyRow & { property_images?: { image_url: string }[] };
}

const CATEGORY_COLORS: Record<string, string> = {
    'Agricultural Land': 'bg-emerald-100 text-emerald-700',
    'Non-agricultural Land': 'bg-amber-100 text-amber-700',
    'Land': 'bg-stone-100 text-stone-700',
    'Residential': 'bg-blue-100 text-blue-700',
    'Commercial': 'bg-purple-100 text-purple-700',
    'Industrial': 'bg-orange-100 text-orange-700',
};

function formatPrice(price: number): string {
    if (price >= 10_000_000) return `${(price / 10_000_000).toFixed(1)} Crore`;
    if (price >= 100_000) return `${(price / 100_000).toFixed(1)} Lac`;
    return price.toLocaleString();
}

export default function PropertyCard({ property }: Props) {
    const cover = property.property_images?.[0]?.image_url;

    return (
        <Link href={`/properties/${property.id}`} className="group block">
            <article className="bg-white rounded-2xl overflow-hidden shadow-md card-lift border border-stone-100">
                {/* Image */}
                <div className="aspect-[4/3] bg-stone-200 overflow-hidden relative">
                    {cover ? (
                        <img
                            src={cover}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">
                            🏞️
                        </div>
                    )}

                    {/* Category badge */}
                    <span
                        className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[property.category] ?? 'bg-stone-100 text-stone-600'
                            }`}
                    >
                        {property.category}
                    </span>
                </div>

                {/* Details */}
                <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-stone-800 leading-snug mb-1 line-clamp-2 group-hover:text-[--color-brand] transition-colors">
                        {property.title}
                    </h3>

                    <p className="flex items-center gap-1.5 text-stone-500 text-xs mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.location}
                    </p>

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[10px] text-stone-400 uppercase tracking-wide">Price</p>
                            <p className="font-display text-xl font-bold text-[--color-brand]">
                                INR {formatPrice(Number(property.price))}
                            </p>
                        </div>
                        {property.area_value && (
                            <div className="text-right">
                                <p className="text-[10px] text-stone-400 uppercase tracking-wide">Area</p>
                                <p className="text-sm font-medium text-stone-600">{property.area_value} {property.area_unit}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA strip */}
                <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
                    <span className="text-xs text-stone-400">View Details</span>
                    <span className="text-[--color-brand] text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </article>
        </Link>
    );
}