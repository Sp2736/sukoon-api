import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

export default async function AdminIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect based on the user's authentication status
  if (user) {
    redirect("/admin/dashboard");
  } else {
    redirect("/admin/login");
  }
}
