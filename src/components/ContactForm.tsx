'use client';
// components/ContactForm.tsx — Inquiry submission form

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inquirySchema, type InquiryFormValues } from '@/lib/validations';
import { submitInquiryAction } from '@/lib/actions';

interface Props {
    propertyId: string;
}

export default function ContactForm({ propertyId }: Props) {
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<InquiryFormValues>({
        resolver: zodResolver(inquirySchema) as any,
        defaultValues: { property_id: propertyId },
    });

    const onSubmit = async (values: InquiryFormValues) => {
        setServerError(null);
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => {
            if (v) fd.append(k, v as string);
        });
        const result = await submitInquiryAction(fd);
        if ('error' in result) {
            setServerError(result.error ?? 'An unexpected error occurred.');
            return;
        }
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-display text-lg font-semibold text-stone-800 mb-1">
                    Inquiry Received!
                </h3>
                <p className="text-stone-500 text-sm">
                    Our team will contact you within 24 hours.
                </p>
            </div>
        );
    }

    const inputCls = (hasError?: boolean) =>
        `w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition ${hasError ? 'border-red-400 bg-red-50' : 'border-stone-300'}`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <input type="hidden" {...register('property_id')} />

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                    Full Name *
                </label>
                <input
                    {...register('name')}
                    placeholder="Your name"
                    className={inputCls(!!errors.name)}
                />
                {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                    Phone Number *
                </label>
                <input
                    {...register('phone')}
                    type="tel"
                    placeholder="+92 300 0000000"
                    className={inputCls(!!errors.phone)}
                />
                {errors.phone && (
                    <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                    Email Address *
                </label>
                <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={inputCls(!!errors.email)}
                />
                {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                    Message (optional)
                </label>
                <textarea
                    {...register('message')}
                    rows={3}
                    placeholder="I'm interested in this property…"
                    className={inputCls(!!errors.message)}
                />
            </div>

            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                    {serverError}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[--color-gold] text-[--color-brand] font-bold py-3 rounded-lg hover:bg-[--color-gold-lt] disabled:opacity-60 transition-colors text-sm"
            >
                {isSubmitting ? 'Submitting…' : 'Express Interest'}
            </button>
        </form>
    );
}