import { createClient } from "@/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no authenticated user, render the children directly (hides the sidebar on the login page)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row font-sans text-stone-900">
      {/* Navigation (Responsive) */}
      <Sidebar userEmail={user?.email} />

      {/* Main content */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
