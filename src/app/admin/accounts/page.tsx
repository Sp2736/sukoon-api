import { getTransactionsAdmin } from '@/lib/actions';
import TransactionForm from '@/components/TransactionForm';
import DeleteTransactionButton from '@/components/DeleteTransactionButton';
import type { Metadata } from 'next';
import { TransactionRow } from '@/types/database';

export const metadata: Metadata = { title: 'Accounts & Ledger' };

export default async function AccountsPage() {
    const transactions = await getTransactionsAdmin() as TransactionRow[];

    const totalCredit = transactions
        .filter((t: TransactionRow) => t.type === 'credit')
        .reduce((sum: number, t: TransactionRow) => sum + Number(t.amount), 0);

    const totalDebit = transactions
        .filter((t: TransactionRow) => t.type === 'debit')
        .reduce((sum: number, t: TransactionRow) => sum + Number(t.amount), 0);

    const balance = totalCredit - totalDebit;

    const stats = [
        {
            label: 'Total Revenue',
            value: totalCredit,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            icon: '₹'
        },
        {
            label: 'Total Expenses',
            value: totalDebit,
            color: 'text-red-600',
            bg: 'bg-red-50',
            icon: '₹'
        },
        {
            label: 'Net Balance',
            value: balance,
            color: balance >= 0 ? 'text-[#0ea5e9]' : 'text-orange-600',
            bg: balance >= 0 ? 'bg-sky-50' : 'bg-orange-50',
            icon: '₹'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-6 md:space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-stone-200 pb-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight">Accounts & Ledger</h1>
                    <p className="text-stone-500 text-sm md:text-base font-medium mt-1">Manage your business ledger and financial transactions</p>
                </div>
            </div>

            {/* KPIs - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((s) => (
                    <div key={s.label} className={`${s.bg} p-5 md:p-8 rounded-sm border border-stone-100 shadow-sm relative overflow-hidden group`}>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-stone-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 opacity-70">{s.label}</p>
                                <p className={`text-2xl md:text-4xl font-black ${s.color}`}>
                                    <span className="text-xs md:text-sm mr-1 opacity-40 font-medium">INR</span>
                                    {s.value.toLocaleString()}
                                </p>
                            </div>
                            <span className="text-3xl md:text-4xl opacity-10 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110">
                                {s.icon}
                            </span>
                        </div>
                        {/* Subtle Background Pattern */}
                        <div className="absolute -bottom-2 -right-2 text-6xl md:text-8xl opacity-[0.03] select-none pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6 md:gap-10">
                {/* Left: Add New Entry */}
                <div className="col-span-12 lg:col-span-4 order-2 lg:order-1">
                    <TransactionForm />
                </div>

                {/* Right: History */}
                <div className="col-span-12 lg:col-span-8 space-y-6 order-1 lg:order-2">
                    <div className="bg-white rounded-sm border border-stone-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                            <h2 className="font-bold text-stone-800 text-sm md:text-base">Transaction History</h2>
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                {transactions.length} Entries
                            </span>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="py-20 text-center px-6">
                                <div className="text-5xl mb-6">📖</div>
                                <h3 className="text-lg font-bold text-stone-800">Empty Ledger</h3>
                                <p className="text-stone-500">Record your first credit or debit to see the history.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50/50">
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-50">
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-sky-50/30 transition-colors group">
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className="text-xs font-bold text-stone-500">
                                                        {new Date(t.date).toLocaleDateString('en-IN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${t.type === 'credit' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                                                        <span className="text-sm font-bold text-stone-800">{t.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className={`text-sm font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {t.type === 'credit' ? '+ ₹' : '- ₹'} {Number(t.amount).toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <DeleteTransactionButton id={t.id} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
