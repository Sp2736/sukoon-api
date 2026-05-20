import type { Metadata } from 'next';
import PropertyForm from '@/components/PropertyForm';
import { getPropertiesAdmin } from '@/lib/actions';

export const metadata: Metadata = { title: 'Add Property - Admin' };

export default async function NewPropertyPage() {
    const allProperties = await getPropertiesAdmin();
    
    return (
        <div className="relative z-10">
            <PropertyForm mode="create" allProperties={allProperties} />
        </div>
    );
}