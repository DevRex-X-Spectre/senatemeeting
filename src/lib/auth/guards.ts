"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { canManageRoles, canManageSenate } from "@/lib/auth/permissions";
import { actionError, type ActionResult } from "@/lib/supabase/errors";
import type { Profile } from "@/types/domain";

/** Throws if the current user is not authenticated. Returns their profile. */
export async function requireUser(): Promise<Profile> {
  return requireProfile();
}

/** Throws if the current user cannot manage senate operations. */
export async function requireAdmin(): Promise<Profile> {
  return requireSenateManager();
}

export async function requireSenateManager(): Promise<Profile> {
  const profile = await requireUser();
  if (!canManageSenate(profile)) redirect("/dashboard");
  return profile;
}

/** Throws if the current user cannot assign operational roles. */
export async function requireRoleManager(): Promise<Profile> {
  const profile = await requireUser();
  if (!canManageRoles(profile)) redirect("/admin");
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
  await requireSenateManager();
  const userId = formData.get("userId") as string;

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_member", { p_user_id: userId });
  if (error) return actionError(error, "Could not approve this member.");

  revalidatePath("/admin/members");
  return { ok: true };
}

export async function suspendMemberAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  await requireSenateManager();
  const userId = formData.get("userId") as string;

  const supabase = await createClient();
  const { error } = await supabase.rpc("suspend_member", { p_user_id: userId });
  if (error) return actionError(error, "Could not suspend this member.");

  revalidatePath("/admin/members");
  return { ok: true };
}

export async function assignMemberRoleAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  await requireRoleManager();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  if (role !== "member" && role !== "secretary") {
    return { ok: false, error: "Choose a valid role." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_member_role", {
    p_user_id: userId,
    p_role: role,
  });
  if (error) return actionError(error, "Could not update this member role.");

  revalidatePath("/admin/members");
  return { ok: true };
}
