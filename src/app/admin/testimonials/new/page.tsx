import type { Metadata } from 'next';
import TestimonialForm from '@/components/TestimonialForm';

export const metadata: Metadata = { title: 'Add Testimonial - Admin' };

export default function NewTestimonialPage() {
    return (
        <TestimonialForm />
    );
}