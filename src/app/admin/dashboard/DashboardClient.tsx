// src/app/admin/dashboard/DashboardClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeletePropertyButton from '@/components/DeletePropertyButton';

export const CATEGORY_BADGE: Record<string, string> = {
    'Agricultural Land': 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    'Non-agricultural Land': 'bg-amber-500/10 text-amber-700 border-amber-200/50',
    'Land': 'bg-rose-500/10 text-rose-700 border-rose-200/50',
    'Residential': 'bg-blue-500/10 text-blue-700 border-blue-200/50',
    'Commercial': 'bg-purple-500/10 text-purple-700 border-purple-200/50',
    'Industrial': 'bg-cyan-500/10 text-cyan-700 border-cyan-200/50',
};

export default function DashboardClient({ properties }: { properties: any[] }) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Filter instantly on the client side
    const displayedProperties = activeCategory
        ? properties.filter((p) => p.category === activeCategory)
        : properties;

    const stats = [
        {
            label: 'Total Listed',
            value: properties.length,
            icon: '📊',
            color: 'text-stone-800',
            bg: 'bg-stone-500/10',
            filterQuery: null, // Clears filter
        },
        {
            label: 'Residential',
            value: properties.filter((p) => p.category === 'Residential').length,
            icon: '🏢',
            color: 'text-blue-600',
            bg: 'bg-blue-500/10',
            filterQuery: 'Residential',
        },
        {
            label: 'Industrial',
            value: properties.filter((p) => p.category === 'Industrial').length,
            icon: '🏭',
            color: 'text-cyan-600',
            bg: 'bg-cyan-500/10',
            filterQuery: 'Industrial',
        },
        {
            label: 'Commercial',
            value: properties.filter((p) => p.category === 'Commercial').length,
            icon: '🏪',
            color: 'text-purple-600',
            bg: 'bg-purple-500/10',
            filterQuery: 'Commercial',
        },
        {
            label: 'Agricultural',
            value: properties.filter((p) => p.category === 'Agricultural Land').length,
            icon: '🚜',
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
            filterQuery: 'Agricultural Land',
        },
        {
            label: 'Non-Agri',
            value: properties.filter((p) => p.category === 'Non-agricultural Land').length,
            icon: '🏗️',
            color: 'text-amber-600',
            bg: 'bg-amber-500/10',
            filterQuery: 'Non-agricultural Land',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-6 md:space-y-10 relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-stone-900 tracking-tight">
                        Overview
                    </h1>
                    <p className="text-stone-500 text-sm md:text-base font-medium mt-2">
                        Manage your premium real estate portfolio
                    </p>
                </div>
                <Link
                    href="/admin/properties/new"
                    className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm border border-brand-light/30"
                >
                    <span className="text-xl font-light">+</span> Add New Listing
                </Link>
            </div>

            {/* Stats as Functional Client-Side Filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {stats.map((s) => {
                    const isActive = activeCategory === s.filterQuery;
                    return (
                        <button
                            key={s.label}
                            onClick={() => setActiveCategory(s.filterQuery)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group backdrop-blur-xl relative overflow-hidden flex flex-col justify-between min-h-[120px] ${
                                isActive 
                                ? 'bg-white/90 border-stone-300 shadow-md ring-2 ring-brand/5' 
                                : 'bg-white/40 border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/70'
                            }`}
                        >
                            <div className="flex justify-between items-start relative z-10 w-full">
                                <div className={`p-2 rounded-xl ${s.bg} flex items-center justify-center`}>
                                    <span className="text-lg group-hover:scale-110 transition-transform">{s.icon}</span>
                                </div>
                                <span className={`text-xl md:text-2xl font-display font-bold ${s.color}`}>
                                    {s.value}
                                </span>
                            </div>
                            <p className="text-stone-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-4 relative z-10">
                                {s.label}
                            </p>
                            {isActive && (
                                <div className="absolute bottom-0 left-0 h-1 w-full bg-brand/80" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Section */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-5 bg-white/40 border-b border-stone-100/50 flex justify-between items-center">
                    <h2 className="font-display font-bold text-stone-800 text-lg">
                        {activeCategory ? `${activeCategory} Listings` : 'Recent Listings'}
                    </h2>
                    {activeCategory && (
                        <button 
                            onClick={() => setActiveCategory(null)}
                            className="text-xs font-bold text-brand hover:underline"
                        >
                            Clear Filter ✕
                        </button>
                    )}
                </div>

                {displayedProperties.length === 0 ? (
                    <div className="py-24 text-center px-6">
                        <div className="text-5xl mb-6 opacity-50 grayscale">🏙️</div>
                        <h3 className="text-lg font-display font-bold text-stone-800">No listings found</h3>
                        <p className="text-stone-500 mb-8 max-w-xs mx-auto mt-2 text-sm">
                            {activeCategory 
                                ? `You don't have any properties in the ${activeCategory} category yet.` 
                                : 'Start building your portfolio by adding your first property.'}
                        </p>
                        <Link href="/admin/properties/new" className="inline-flex items-center text-brand font-bold hover:underline gap-2 bg-brand/5 px-6 py-3 rounded-full">
                            Create Listing →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-200/50 bg-stone-50/30">
                                    <th className="px-6 py-5">Title & Location</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Price</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100/50">
                                {displayedProperties.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/80 transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-stone-800 group-hover:text-brand transition-colors line-clamp-1 text-sm">{p.title}</p>
                                            <p className="text-stone-500 text-[11px] font-medium mt-1.5 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {p.location}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${CATEGORY_BADGE[p.category] || 'bg-stone-100 text-stone-700'}`}>
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-[11px] text-stone-400 font-bold">INR</span>
                                                <span className="text-sm font-bold text-stone-800">{Number(p.price).toLocaleString('en-IN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${p.is_published ? 'text-brand' : 'text-stone-400'}`}>
                                                <span className={`h-2 w-2 rounded-full ${p.is_published ? 'bg-brand shadow-[0_0_8px_rgba(26,58,46,0.4)] animate-pulse' : 'bg-stone-300'}`}></span>
                                                {p.is_published ? 'Published' : 'Draft'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-3 items-center">
                                                <Link href={`/admin/properties/${p.id}/edit`} className="p-2 text-stone-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all transform hover:scale-105">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </Link>
                                                <DeletePropertyButton id={p.id} title={p.title} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}