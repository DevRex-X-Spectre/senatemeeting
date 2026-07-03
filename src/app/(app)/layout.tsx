import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui";
import { Sidebar, Topbar } from "@/components/layout";
import { requireProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Loading…" };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const p = await requireProfile();

  // Gate: pending → pending-approval, suspended → suspended.
  if (p.status === "pending") redirect("/pending-approval");
  if (p.status === "suspended") redirect("/suspended");

  return (
    <ToastProvider>
      <div className="app-grid-shell min-h-screen">
        <Sidebar profile={p} />
        <div className="flex min-h-screen min-w-0 flex-col sm:pl-60">
          <Topbar profile={p} />
          <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
