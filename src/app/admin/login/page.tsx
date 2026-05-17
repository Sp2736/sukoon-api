'use client';
// app/admin/login/page.tsx — Supabase Auth login (Client Component for form UX)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/supabase/client';
import { loginSchema } from '@/lib/validations';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        router.push('/admin/dashboard');
        router.refresh();
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-12">
                    <Image
                        src="/logo.svg"
                        alt="Sukoon Developer Logo"
                        width={200}
                        height={80}
                        className="h-auto w-48 mb-2"
                        priority
                    />
                    <p className="text-stone-400 tracking-[0.3em] uppercase text-[10px] font-bold">Admin Portal</p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(14,165,233,0.1)] border border-stone-100 p-10">
                    <h1 className="font-display text-3xl font-bold text-stone-800 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-stone-500 text-sm mb-10">Secure access to the Sukoon Admin Panel</p>

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@sukoon.com"
                                required
                                autoComplete="email"
                                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition bg-stone-50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition bg-stone-50"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs font-medium px-4 py-3 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[--color-brand] text-white py-4 rounded-xl font-bold text-sm hover:bg-[--color-brand-dark] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-200"
                        >
                            {loading ? 'Signing in…' : 'Sign In to Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}