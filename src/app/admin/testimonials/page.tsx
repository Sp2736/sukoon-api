import Link from 'next/link';
import type { Metadata } from 'next';
// import { getTestimonialsAdmin } from '@/lib/actions'; // Add this to your actions later

export const metadata: Metadata = { title: 'Testimonials - Admin' };

export default async function TestimonialsPage() {
    // const testimonials = await getTestimonialsAdmin();
    const testimonials: any[] = []; // Placeholder until backend is wired

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-10 space-y-6 md:space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-stone-200">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
                        Client Testimonials
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">
                        Manage public reviews and feedback displayed on the website.
                    </p>
                </div>
                <Link
                    href="/admin/testimonials/new"
                    className="w-full sm:w-auto bg-brand hover:bg-brand-light text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors text-sm"
                >
                    + Add New Review
                </Link>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                {testimonials.length === 0 ? (
                    <div className="py-24 text-center px-6">
                        <div className="text-4xl mb-4 opacity-50 grayscale">💬</div>
                        <h3 className="text-lg font-bold text-stone-900">No testimonials yet</h3>
                        <p className="text-stone-500 mb-6 max-w-xs mx-auto mt-2 text-sm">
                            Add client feedback to build trust with prospective buyers.
                        </p>
                        <Link href="/admin/testimonials/new" className="inline-flex items-center text-brand font-bold hover:underline gap-2 text-sm">
                            Create First Review →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-stone-200 bg-stone-50">
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 w-1/2">Quote</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {testimonials.map((t) => (
                                    <tr key={t.id} className="hover:bg-stone-50 transition-colors group">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            {t.avatar_url ? (
                                                <img src={t.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-stone-200" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">
                                                    {t.name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="font-bold text-stone-800 text-sm">{t.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-md text-xs font-bold">
                                                {t.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-stone-500 line-clamp-2">{t.quote}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-3 items-center">
                                                <button className="text-stone-400 hover:text-brand text-xs font-bold transition-colors">Edit</button>
                                                <button className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors">Delete</button>
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