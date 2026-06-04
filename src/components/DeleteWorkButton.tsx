// src/components/DeleteWorkButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWorkAction } from '@/lib/actions';

interface Props {
    id: string;
    title: string;
}

export default function DeleteWorkButton({ id, title }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await deleteWorkAction(id);
        if (result && 'error' in result) {
            alert(result.error);
            setLoading(false);
            return;
        }
        router.refresh();
    }

    if (showConfirm) {
        return (
            <span className="flex items-center gap-2">
                <span className="text-[10px] text-stone-500 font-medium">Delete?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-red-600 text-[10px] uppercase font-black hover:underline disabled:opacity-60"
                >
                    {loading ? '...' : 'YES'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="text-stone-400 text-[10px] uppercase font-black hover:text-stone-600"
                >
                    NO
                </button>
            </span>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="text-white p-1.5 rounded-lg bg-red-500 font-bold hover:bg-red-700 cursor-pointer text-xs"
        >
            Delete
        </button>
    );
}