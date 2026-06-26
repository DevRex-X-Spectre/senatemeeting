import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ProfileRow } from "@/types/database";

export const metadata: Metadata = { title: "Email confirmed" };

export default async function AuthCallbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile to know where to redirect.
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single() as { data: ProfileRow | null };

  if (profile?.status === "pending") redirect("/pending-approval");
  redirect("/dashboard");
}