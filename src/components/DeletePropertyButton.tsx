'use client';
// components/DeletePropertyButton.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePropertyAction } from '@/lib/actions';

interface Props {
    id: string;
    title: string;
}

export default function DeletePropertyButton({ id, title }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await deletePropertyAction(id);
        if ('error' in result) {
            alert(result.error);
            setLoading(false);
            return;
        }
        router.refresh();
    }

    if (showConfirm) {
        return (
            <span className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Delete &ldquo;{title.slice(0, 20)}…&rdquo;?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-red-600 text-xs font-semibold hover:underline disabled:opacity-60"
                >
                    {loading ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="text-stone-400 text-xs hover:text-stone-600"
                >
                    Cancel
                </button>
            </span>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="text-red-500 font-medium hover:underline text-sm"
        >
            Delete
        </button>
    );
}