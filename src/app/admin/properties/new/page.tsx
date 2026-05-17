import type { Metadata } from 'next';
import PropertyForm from '@/components/PropertyForm';
import { getPropertiesAdmin } from '@/lib/actions';

export const metadata: Metadata = { title: 'Add Property' };

export default async function NewPropertyPage() {
    const allProperties = await getPropertiesAdmin();
    return (
        <div className="">
            <PropertyForm mode="create" allProperties={allProperties} />
        </div>
    );
}