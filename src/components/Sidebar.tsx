'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/lib/actions';

export default function Sidebar({ userEmail }: { userEmail: string | undefined }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: <DashIcon /> },
        { href: '/admin/properties/new', label: 'Add Property', icon: <PlusIcon /> },
        { href: '/admin/accounts', label: 'Accounts', icon: <WalletIcon /> },
    ];

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Top Bar - Mobile Only */}
            <div className="lg:hidden flex items-center justify-between bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-40">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={100} height={40} className="h-8 w-auto" />
                </Link>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Backdrop - Mobile Only */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMenu}
                />
            )}

            {/* Sidebar / Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="px-6 py-8 border-b border-stone-100 hidden lg:flex items-center justify-center">
                    <Link href="/admin/dashboard">
                        <Image src="/logo.png" alt="Logo" width={160} height={60} className="h-auto w-full max-w-[140px]" priority />
                    </Link>
                </div>

                {/* Mobile Header in Drawer */}
                <div className="p-6 border-b border-stone-100 flex lg:hidden items-center justify-between">
                    <span className="font-bold text-stone-800 uppercase tracking-widest text-xs">Menu</span>
                    <button onClick={closeMenu} className="text-stone-400 hover:text-stone-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${pathname === item.href
                                    ? 'bg-sky-50 text-[#0ea5e9]'
                                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                                }`}
                        >
                            {item.icon} {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-stone-100 bg-stone-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 uppercase">
                            {userEmail?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-stone-800 truncate">{userEmail}</p>
                            <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">Administrator</p>
                        </div>
                    </div>
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full bg-white border border-stone-200 text-stone-600 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-100 hover:text-red-600 transition-all shadow-sm active:scale-95"
                        >
                            Sign out →
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}

function DashIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );
}

function WalletIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );
}
