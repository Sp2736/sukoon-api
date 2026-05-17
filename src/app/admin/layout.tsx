import { createClient } from "@/supabase/server";
import Sidebar from '@/components/Sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Authentication is handled by middleware.ts
    if (!user) return <>{children}</>;

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col lg:flex-row">
            {/* Navigation (Responsive) */}
            <Sidebar userEmail={user?.email} />

            {/* Main content */}
            <main className="flex-1 min-w-0 h-screen overflow-y-auto">
                {children}
            </main>
        </div>
    );
}