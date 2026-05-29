import { getTransactionsAdmin } from "@/lib/actions";
import TransactionForm, {
  CreditWithRemaining,
} from "@/components/TransactionForm";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";
import type { Metadata } from "next";
import { Info } from "lucide-react";
import { TransactionRow } from "@/types/database";
import Link from "next/link";

export const metadata: Metadata = { title: "Accounts & Ledger" };

interface Props {
  searchParams?: Promise<{ page?: string }>;
}

export default async function AccountsPage(props: Props) {
  const searchParams = await props.searchParams;
  const transactions = (await getTransactionsAdmin()) as TransactionRow[];

  // Split and calculate remaining balances for credits mapping
  const credits = transactions.filter((t) => t.type === "credit");
  const debits = transactions.filter((t) => t.type === "debit");

  const totalCredit = credits.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDebit = debits.reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalCredit - totalDebit;

  // Calculate available credits with remaining balances greater than 0
  const availableCredits: CreditWithRemaining[] = credits
    .map((credit) => {
      const usedAmount = debits
        .filter((d) => d.linked_credit_id === credit.id)
        .reduce((sum, d) => sum + Number(d.amount), 0);

      return {
        ...credit,
        remaining: Number(credit.amount) - usedAmount,
      };
    })
    .filter((c) => c.remaining > 0);

  // Pagination Logic
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const stats = [
    {
      label: "Total Revenue",
      value: totalCredit,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: "₹",
    },
    {
      label: "Total Expenses",
      value: totalDebit,
      color: "text-red-600",
      bg: "bg-red-50",
      icon: "₹",
    },
    {
      label: "Net Balance",
      value: balance,
      color: balance >= 0 ? "text-[#0ea5e9]" : "text-orange-600",
      bg: balance >= 0 ? "bg-sky-50" : "bg-orange-50",
      icon: "₹",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight">
            Accounts & Ledger
          </h1>
          <p className="text-stone-500 text-sm md:text-base font-medium mt-1">
            Manage your business ledger and financial transactions
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.bg} p-5 md:p-8 rounded-sm border border-stone-100 shadow-sm relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-stone-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 opacity-70">
                  {s.label}
                </p>
                <p className={`text-2xl md:text-4xl font-black ${s.color}`}>
                  <span className="text-xs md:text-sm mr-1 opacity-40 font-medium">
                    INR
                  </span>
                  {s.value.toLocaleString()}
                </p>
              </div>
              <span className="text-3xl md:text-4xl opacity-10 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110">
                {s.icon}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 text-6xl md:text-8xl opacity-[0.03] select-none pointer-events-none group-hover:rotate-12 transition-transform duration-700">
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-10">
        {/* Left: Add New Entry - Now Receives Available Credits */}
        <div className="col-span-12 lg:col-span-4 order-2 lg:order-1 h-full">
          <TransactionForm availableCredits={availableCredits} />
        </div>

        {/* Right: History */}
        <div className="col-span-12 lg:col-span-8 space-y-6 order-1 lg:order-2">
          <div className="bg-white rounded-sm border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h2 className="font-bold text-stone-800 text-sm md:text-base">
                Transaction History
              </h2>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                {transactions.length} Entries
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-20 text-center px-6">
                <div className="text-5xl mb-6">📖</div>
                <h3 className="text-lg font-bold text-stone-800">
                  Empty Ledger
                </h3>
                <p className="text-stone-500">
                  Record your first credit or debit to see the history.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto scrollbar-hide flex-1">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100 bg-stone-50/50">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Source / Fund Link</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {paginatedTransactions.map((t) => {
                        // Find linked credit info if it's a debit
                        const linkedCredit =
                          t.type === "debit" && t.linked_credit_id
                            ? credits.find((c) => c.id === t.linked_credit_id)
                            : null;

                        return (
                          <tr
                            key={t.id}
                            className="hover:bg-sky-50/30 transition-colors group"
                          >
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className="text-xs font-bold text-stone-500">
                                {new Date(t.date).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === "credit" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`}
                                ></div>
                                <span className="text-sm font-bold text-stone-800">
                                  {t.title.length > 30
                                    ? t.title.slice(0, 30) + "..."
                                    : t.title}
                                </span>
                                {t.title.length > 30 && (
                                  <div className="relative group/tip">
                                    <Info
                                      size={15}
                                      className="text-stone-400 hover:text-stone-600 cursor-pointer transition-colors flex-shrink-0"
                                    />
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tip:block z-50 w-max max-w-xs">
                                      <div className="bg-stone-800 text-white text-xs rounded-md px-3 py-2 shadow-lg font-medium leading-relaxed">
                                        {t.title}
                                      </div>
                                      <div className="w-2 h-2 bg-stone-800 rotate-45 mx-auto -mt-1"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold text-stone-700 capitalize">
                                  {t.source || "N/A"}
                                </span>
                                {linkedCredit && (
                                  <span className="text-[10px] font-bold text-[#0ea5e9] bg-sky-50 px-2 py-0.5 rounded-sm inline-flex w-fit">
                                    Fund: {linkedCredit.title}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-5 whitespace-nowrap">
                              <span
                                className={`text-sm font-black ${t.type === "credit" ? "text-emerald-600" : "text-red-600"}`}
                              >
                                {t.type === "credit" ? "+ ₹" : "- ₹"}{" "}
                                {Number(t.amount).toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <DeleteTransactionButton id={t.id} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between mt-auto">
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      {currentPage > 1 ? (
                        <Link
                          href={`?page=${currentPage - 1}`}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors shadow-sm"
                        >
                          Previous
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-md text-xs font-bold text-stone-400 cursor-not-allowed"
                        >
                          Previous
                        </button>
                      )}

                      {currentPage < totalPages ? (
                        <Link
                          href={`?page=${currentPage + 1}`}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors shadow-sm"
                        >
                          Next
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-md text-xs font-bold text-stone-400 cursor-not-allowed"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
