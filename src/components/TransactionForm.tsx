"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/lib/validations";
import { createTransactionAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import type { TransactionRow } from "@/types/database";

export interface CreditWithRemaining extends TransactionRow {
  remaining: number;
}

interface Props {
  availableCredits?: CreditWithRemaining[];
}

export default function TransactionForm({ availableCredits = [] }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "credit",
      title: "",
      source: "",
      linked_credit_id: "",
      amount: "",
      date: "",
    },
  });

  useEffect(() => {
    setValue("date", new Date().toISOString().split("T")[0]);
  }, [setValue]);

  const activeType = watch("type");
  const selectedSource = watch("source");

  // Reset source and linked mapping when toggling types
  const handleTypeChange = (type: "credit" | "debit") => {
    setValue("type", type);
    setValue("source", "");
    setValue("linked_credit_id", "");
  };

  // Prepare dropdown data for debits
  const uniqueSources = Array.from(
    new Set(availableCredits.map((c) => c.source)),
  );
  const creditsForSelectedSource = availableCredits.filter(
    (c) => c.source === selectedSource,
  );

  const onSubmit = async (values: TransactionFormValues) => {
    setIsPending(true);
    setError(null);
    try {
      const payload = {
        ...values,
        linked_credit_id:
          values.type === "debit" ? values.linked_credit_id : null,
      };
      const result = await createTransactionAction(payload);
      if (result && "error" in result) {
        setError(result.error);
      } else {
        reset();
        setValue("date", new Date().toISOString().split("T")[0]);
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    `w-full rounded-sm border px-4 py-3 text-sm transition-all outline-none focus:ring-4 focus:ring-sky-100 ${
      hasError
        ? "border-red-500 bg-red-50"
        : "border-stone-200 bg-stone-50 focus:border-[#0ea5e9]"
    }`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-sm border border-stone-200 shadow-sm space-y-5 flex flex-col h-full"
    >
      {error && (
        <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </p>
      )}

      <div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("credit")}
            className={`py-2.5 rounded-sm text-xs font-bold border transition-all ${
              activeType === "credit"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50"
                : "bg-white border-stone-200 text-stone-500 hover:border-emerald-200"
            }`}
          >
            Credit (+)
          </button>
          <select {...register("type")} className="hidden">
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <button
            type="button"
            onClick={() => handleTypeChange("debit")}
            className={`py-2.5 rounded-sm text-xs font-bold border transition-all ${
              activeType === "debit"
                ? "bg-red-50 border-red-500 text-red-700 ring-4 ring-red-50"
                : "bg-white border-stone-200 text-stone-500 hover:border-red-200"
            }`}
          >
            Debit (-)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
            Title / Description
          </label>
          <input
            {...register("title")}
            placeholder={
              activeType === "credit"
                ? "e.g. Sale of Plot 45"
                : "e.g. Material Purchase"
            }
            className={inputCls(!!errors.title)}
          />
          {errors.title && (
            <p className="text-[10px] text-red-500 mt-1 ml-1">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
            Source / Individual
          </label>
          {activeType === "credit" ? (
            <input
              {...register("source")}
              placeholder="e.g. Aman Gupta"
              className={`capitalize ${inputCls(!!errors.source)}`}
            />
          ) : (
            <select
              {...register("source")}
              className={`capitalize ${inputCls(!!errors.source)}`}
            >
              <option value="">Choose</option>
              {uniqueSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          {errors.source && (
            <p className="text-[10px] text-red-500 mt-1 ml-1">
              {errors.source.message}
            </p>
          )}
        </div>
      </div>

      {/* Sub-dropdown to pick exact fund for Debit */}
      {activeType === "debit" && selectedSource && (
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-sm">
          <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">
            Utilize Exact Fund
          </label>
          <select
            {...register("linked_credit_id")}
            className={inputCls(!!errors.linked_credit_id)}
          >
            <option value="">Select specific credit balance</option>
            {creditsForSelectedSource.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} — Available: ₹ {c.remaining.toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-auto pt-2">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
            Amount (INR)
          </label>
          <input
            {...register("amount")}
            type="number"
            placeholder="0.00"
            className={inputCls(!!errors.amount)}
          />
          {errors.amount && (
            <p className="text-[10px] text-red-500 mt-1 ml-1">
              {errors.amount.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
            Date
          </label>
          <input
            {...register("date")}
            type="date"
            className={inputCls(!!errors.date)}
          />
        </div>
      </div>

      <button
        disabled={
          isPending || (activeType === "debit" && uniqueSources.length === 0)
        }
        type="submit"
        className="w-full bg-[#0ea5e9] hover:bg-[#0369a1] text-white py-4 rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
      >
        {isPending ? "PROCESSING..." : "ADD TRANSACTION"}
      </button>
    </form>
  );
}
