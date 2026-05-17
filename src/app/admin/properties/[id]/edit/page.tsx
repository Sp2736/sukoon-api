// app/admin/properties/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPropertyAdmin, getPropertiesAdmin } from '@/lib/actions';
import PropertyForm from '@/components/PropertyForm';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { id } = await params;
        const p = await getPropertyAdmin(id);
        return { title: `Edit — ${p.title}` };
    } catch {
        return { title: 'Edit Property' };
    }
}

export default async function EditPropertyPage({ params }: Props) {
    const { id } = await params;

    let property;
    let allProperties;
    try {
        property = await getPropertyAdmin(id);
        allProperties = await getPropertiesAdmin();
    } catch {
        notFound();
    }

    return (
        <div className="">
            <PropertyForm mode="edit" property={property} allProperties={allProperties} />
        </div>
    );
}