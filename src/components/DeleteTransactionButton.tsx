'use client';

import { deleteTransactionAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteTransactionButton({ id }: { id: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        
        setIsDeleting(true);
        try {
            await deleteTransactionAction(id);
            router.refresh();
        } catch (err) {
            alert('Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-stone-300 hover:text-red-500 transition-colors disabled:opacity-30"
            title="Delete transaction"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    );
}
