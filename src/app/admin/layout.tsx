import { createClient } from "@/supabase/server";
import Sidebar from "@/components/Sidebar";
import AutoLogout from "@/components/AutoLogout"; // Import the new component

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated users just see the login screen without the sidebar/timers
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row font-sans text-stone-900">
      {/* Invisible Session Monitor */}
      <AutoLogout />

      {/* Navigation */}
      <Sidebar userEmail={user?.email} />

      {/* Main content */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
