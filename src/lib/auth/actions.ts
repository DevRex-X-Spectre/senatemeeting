"use server";

import { redirect } from "next/navigation";
import { loginSchema, registerSchema, updateProfileSchema } from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import {
  actionError,
  mapSupabaseError,
  validationError,
  withTimeout,
  SUPABASE_AUTH_TIMEOUT_MS,
  type ActionResult,
} from "@/lib/supabase/errors";

export async function loginAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    }),
    "Sign in",
    SUPABASE_AUTH_TIMEOUT_MS,
  ).catch((error: unknown) => ({
    data: { user: null, session: null },
    error,
  }));

  if (error) {
    return validationError({ email: [mapSupabaseError(error, "Could not sign in. Please try again.").message] });
  }

  redirect("/dashboard");
}

export async function registerAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await withTimeout(
    supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
      },
    }),
    "Register account",
    SUPABASE_AUTH_TIMEOUT_MS,
  ).catch((error: unknown) => ({
    data: { user: null, session: null },
    error,
  }));

  if (error) {
    return validationError({ email: [mapSupabaseError(error, "Could not create your account. Please try again.").message] });
  }

  if (data.user) {
    await notifyAdminsAboutRegistration({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
    });
  }

  redirect("/pending-approval?registered=1");
}

export async function logoutAction() {
  const supabase = await createClient();
  await withTimeout(supabase.auth.signOut(), "Sign out", SUPABASE_AUTH_TIMEOUT_MS).catch(() => null);
  redirect("/login");
}

export async function updateProfileAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    title: formData.get("title") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      title: parsed.data.title ?? null,
      avatar_url: parsed.data.avatarUrl ? parsed.data.avatarUrl : null,
    })
      .eq("id", profile.id),
    "Update profile",
  );

  if (error) {
    return actionError(error, "Could not update your profile.");
  }
  return { ok: true };
}

async function notifyAdminsAboutRegistration(member: { fullName: string; email: string }) {
  const adminClient = createAdminClient();
  const { data: admins } = await withTimeout(
    adminClient
    .from("profiles")
    .select("id")
    .in("role", ["admin", "secretary"])
      .eq("status", "active"),
    "Admin notification recipient lookup",
  ).catch(() => ({ data: null }));

  if (!admins?.length) return;

  await withTimeout(adminClient.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      kind: "approval_pending",
      title: "New member registration",
      body: `${member.fullName} (${member.email}) is waiting for approval.`,
    })),
  ), "Admin registration notification insert").catch(() => null);
}
