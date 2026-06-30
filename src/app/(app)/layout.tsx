import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui";
import { Sidebar, Topbar } from "@/components/layout";
import type { Profile } from "@/types/domain";

export const metadata: Metadata = { title: "Loading…" };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const p = profile as Profile;

  // Gate: pending → pending-approval, suspended → suspended.
  if (p.status === "pending") redirect("/pending-approval");
  if (p.status === "suspended") redirect("/suspended");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-mist">
        <Sidebar profile={p} />
        <div className="flex min-h-screen flex-1 flex-col sm:ml-60">
          <Topbar profile={p} />
          <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
