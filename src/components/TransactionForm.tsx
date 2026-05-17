'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations';
import { createTransactionAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function TransactionForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'credit',
            title: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
        }
    });

    const activeType = watch('type');

    const onSubmit = async (values: TransactionFormValues) => {
        setIsPending(true);
        setError(null);
        try {
            const result = await createTransactionAction(values);
            if (result && 'error' in result) {
                setError(result.error);
            } else {
                reset();
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsPending(false);
        }
    };

    const inputCls = (hasError?: boolean) =>
        `w-full rounded-sm border px-4 py-3 text-sm transition-all outline-none focus:ring-4 focus:ring-sky-100 ${hasError ? 'border-red-500 bg-red-50' : 'border-stone-200 bg-stone-50 focus:border-[#0ea5e9]'
        }`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm space-y-5">

            {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setValue('type', 'credit')}
                        className={`py-2.5 rounded-sm text-xs font-bold border transition-all ${activeType === 'credit'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-emerald-200'
                            }`}
                    >
                        Credit (+)
                    </button>
                    <select
                        {...register('type')}
                        className="hidden"
                    >
                        <option value="credit">Credit</option>
                        <option value="debit">Debit</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => setValue('type', 'debit')}
                        className={`py-2.5 rounded-sm text-xs font-bold border transition-all ${activeType === 'debit'
                            ? 'bg-red-50 border-red-500 text-red-700 ring-4 ring-red-50'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-red-200'
                            }`}
                    >
                        Debit (-)
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1">Title / Description</label>
                <input
                    {...register('title')}
                    placeholder="e.g. Sale of Plot 45"
                    className={inputCls(!!errors.title)}
                />
                {errors.title && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1">Amount (INR)</label>
                    <input
                        {...register('amount')}
                        type="number"
                        placeholder="0.00"
                        className={inputCls(!!errors.amount)}
                    />
                    {errors.amount && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.amount.message}</p>}
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1">Date</label>
                    <input
                        {...register('date')}
                        type="date"
                        className={inputCls(!!errors.date)}
                    />
                </div>
            </div>

            <button
                disabled={isPending}
                type="submit"
                className="w-full bg-[#0ea5e9] hover:bg-[#0369a1] text-white py-4 rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
                {isPending ? 'PROCESSING...' : 'ADD TRANSACTION'}
            </button>
        </form>
    );
}
