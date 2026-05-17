import Link from 'next/link';
import type { Metadata } from 'next';
import { getPropertiesAdmin } from '@/lib/actions';
import DeletePropertyButton from '@/components/DeletePropertyButton';

export const metadata: Metadata = { title: 'Dashboard' };

const CATEGORY_BADGE: Record<string, string> = {
    'Agricultural Land': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Non-agricultural Land': 'bg-amber-100 text-amber-700 border-amber-200',
    'Land': 'bg-stone-100 text-stone-700 border-stone-200',
    'Residential': 'bg-blue-100 text-blue-700 border-blue-200',
    'Commercial': 'bg-purple-100 text-purple-700 border-purple-200',
};

export default async function DashboardPage() {
    const properties = await getPropertiesAdmin();

    const stats = [
        {
            label: 'Total Listed',
            value: properties.length,
            icon: '📊',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Residential',
            value: properties.filter((p) => p.category === 'Residential').length,
            icon: '🏢',
            color: 'text-sky-600',
            bg: 'bg-sky-50'
        },
        {
            label: 'Commercial',
            value: properties.filter((p) => p.category === 'Commercial').length,
            icon: '🏪',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            label: 'Agricultural',
            value: properties.filter((p) => p.category === 'Agricultural Land').length,
            icon: '🚜',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Non-Agri Land',
            value: properties.filter((p) => p.category === 'Non-agricultural Land').length,
            icon: '🏗️',
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-6 md:space-y-10">
            {/* Header - Fixed Contrast */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-stone-200 pb-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight">Property Overview</h1>
                    <p className="text-stone-500 text-sm md:text-base font-medium mt-1">Manage your real estate portfolio</p>
                </div>
                <Link
                    href="/admin/properties/new"
                    className="w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#0369a1] text-white px-8 py-4 rounded-sm font-bold shadow-lg shadow-sky-100 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm"
                >
                    <span className="text-xl">+</span> Add New Listing
                </Link>
            </div>

            {/* Stats - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white p-4 md:p-6 rounded-sm border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                            <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                            <span className={`text-xl md:text-3xl font-black ${s.color}`}>{s.value}</span>
                        </div>
                        <p className="text-stone-400 text-[10px] md:text-xs font-black uppercase tracking-widest mt-4">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-sm border border-stone-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                    <h2 className="font-bold text-stone-800 text-sm md:text-base">Recent Listings</h2>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{properties.length} Total</span>
                </div>

                {properties.length === 0 ? (
                    <div className="py-20 text-center px-6">
                        <div className="text-5xl mb-6">🏠</div>
                        <h3 className="text-lg font-bold text-stone-800">No listings found</h3>
                        <p className="text-stone-500 mb-8 max-w-xs mx-auto">Start by adding your first property to the dashboard.</p>
                        <Link href="/admin/properties/new" className="inline-flex items-center text-[#0ea5e9] font-bold hover:underline gap-2">
                            Create Listing →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50/30">
                                    <th className="px-6 py-5">Title & Location</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Price</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {properties.map((p) => (
                                    <tr key={p.id} className="hover:bg-sky-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-stone-800 group-hover:text-[#0ea5e9] transition-colors line-clamp-1">{p.title}</p>
                                            <p className="text-stone-400 text-[10px] font-medium mt-1 uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="text-stone-300">📍</span> {p.location}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${CATEGORY_BADGE[p.category] || 'bg-stone-100'}`}>
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[10px] text-stone-400 font-black">₹</span>
                                                <span className="text-sm font-black text-stone-700">{Number(p.price).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${p.is_published ? 'text-emerald-600' : 'text-stone-400'}`}>
                                                <span className={`h-2 w-2 rounded-full ${p.is_published ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-stone-300'}`}></span>
                                                {p.is_published ? 'Live' : 'Draft'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-4">
                                                <Link href={`/admin/properties/${p.id}/edit`} className="text-stone-300 hover:text-[#0ea5e9] transition-all transform hover:scale-110">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
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