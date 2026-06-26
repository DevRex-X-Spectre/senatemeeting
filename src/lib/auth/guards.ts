"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { Profile } from "@/types/domain";

/** Throws if the current user is not authenticated. Returns their profile. */
export async function requireUser(): Promise<Profile> {
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
  return profile as Profile;
}

/** Throws if the current user is not an admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}

/** Throws if the current user is not an active (approved) member. */
export async function requireActiveMember(): Promise<Profile> {
  const profile = await requireUser();
  if (profile.status !== "active") {
    redirect(profile.status === "pending" ? "/pending-approval" : "/suspended");
  }
  return profile;
}

export async function approveMemberAction(_prev: unknown, formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get("userId") as string;
  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { role: "member", status: "active" },
  });
  if (authError) return { ok: false, error: authError.message };

  const { error: dbError } = await adminClient
    .from("profiles")
    .update({
      status: "active",
      approved_by: admin.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (dbError) return { ok: false, error: dbError.message };

  await adminClient.from("notifications").insert({
    user_id: userId,
    kind: "approval_granted",
    title: "You're approved",
    body: "Your account has been activated. You can now participate in meetings.",
  });

  return { ok: true };
}

export async function suspendMemberAction(_prev: unknown, formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get("userId") as string;
  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { role: "member", status: "suspended" },
  });
  if (authError) return { ok: false, error: authError.message };

  const { error: dbError } = await adminClient
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", userId);

  if (dbError) return { ok: false, error: dbError.message };
  return { ok: true };
}