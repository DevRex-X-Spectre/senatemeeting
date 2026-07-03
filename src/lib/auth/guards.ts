"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { actionError, type ActionResult } from "@/lib/supabase/errors";
import type { Profile } from "@/types/domain";

/** Throws if the current user is not authenticated. Returns their profile. */
export async function requireUser(): Promise<Profile> {
  return requireProfile();
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

export async function approveMemberAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const userId = formData.get("userId") as string;

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_member", { p_user_id: userId });
  if (error) return actionError(error, "Could not approve this member.");

  revalidatePath("/admin/members");
  return { ok: true };
}

export async function suspendMemberAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const userId = formData.get("userId") as string;

  const supabase = await createClient();
  const { error } = await supabase.rpc("suspend_member", { p_user_id: userId });
  if (error) return actionError(error, "Could not suspend this member.");

  revalidatePath("/admin/members");
  return { ok: true };
}
