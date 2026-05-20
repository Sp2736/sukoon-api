// src/app/admin/dashboard/page.tsx
import type { Metadata } from 'next';
import { getPropertiesAdmin } from '@/lib/actions';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = { title: 'Dashboard - Admin' };

// Force dynamic rendering to ensure the dashboard always has fresh data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const properties = await getPropertiesAdmin();

    return (
        <DashboardClient properties={properties} />
    );
}