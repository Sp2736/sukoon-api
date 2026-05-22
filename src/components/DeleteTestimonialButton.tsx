"use client";

import { deleteReviewAction } from "@/lib/actions";

export default function DeleteButton({ id }: { id: string }) {
    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this testimonial?");
        if (!confirmed) return;

        try {
            await deleteReviewAction(id);
        } catch (error) {
            alert("Failed to delete testimonial. Please try again.");
            console.error(error);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
        >
            Delete
        </button>
    );
}