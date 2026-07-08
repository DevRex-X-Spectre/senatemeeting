"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  changePasswordSchema,
  createMemberCredentialsSchema,
  loginSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireSenateManager } from "@/lib/auth/guards";
import { requireProfile } from "@/lib/auth/session";
import {
  actionError,
  mapSupabaseError,
  validationError,
  withTimeout,
  SUPABASE_AUTH_TIMEOUT_MS,
  type ActionResult,
} from "@/lib/supabase/errors";

const STAFF_AUTH_DOMAIN = "members.unisenate.local";

export async function loginAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const loginEmail = await resolveLoginEmail(parsed.data.identifier);
  if (!loginEmail) {
    return validationError({
      identifier: ["This staff ID is not registered."],
    });
  }

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase.auth.signInWithPassword({
      email: loginEmail,
      password: parsed.data.password,
    }),
    "Sign in",
    SUPABASE_AUTH_TIMEOUT_MS,
  ).catch((error: unknown) => ({
    data: { user: null, session: null },
    error,
  }));

  if (error) {
    return validationError({ identifier: [mapSupabaseError(error, "Could not sign in. Please try again.").message] });
  }

  redirect("/dashboard");
}

export async function createMemberCredentialsAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const manager = await requireSenateManager();

  const parsed = createMemberCredentialsSchema.safeParse({
    fullName: formData.get("fullName"),
    staffId: formData.get("staffId"),
    password: formData.get("password"),
    title: formData.get("title") || undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const staffId = normalizeStaffId(parsed.data.staffId);
  const internalEmail = internalStaffEmail(staffId);
  const adminClient = createAdminClient();

  const { data: existingProfile, error: existingProfileError } = await withTimeout(
    adminClient
      .from("profiles")
      .select("id")
      .eq("staff_id", staffId)
      .maybeSingle(),
    "Staff ID lookup",
  );

  if (existingProfileError) {
    return actionError(existingProfileError, "Could not verify this staff ID.");
  }

  if (existingProfile) {
    return validationError({ staffId: ["This staff ID is already registered."] });
  }

  const { data: createdUser, error: createError } = await withTimeout(
    adminClient.auth.admin.createUser({
      email: internalEmail,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.fullName,
        staff_id: staffId,
      },
      app_metadata: {
        role: "member",
        status: "pending",
      },
    }),
    "Create staff credentials",
    SUPABASE_AUTH_TIMEOUT_MS,
  );

  if (createError || !createdUser.user) {
    return validationError({
      staffId: [mapSupabaseError(createError, "Could not create this member credential.").message],
    });
  }

  const { error: profileError } = await withTimeout(
    adminClient
      .from("profiles")
      .update({
        email: internalEmail,
        staff_id: staffId,
        full_name: parsed.data.fullName,
        title: parsed.data.title ?? null,
        approved_by: manager.id,
      })
      .eq("id", createdUser.user.id),
    "Update staff profile",
  );

  if (profileError) {
    return actionError(profileError, "The auth account was created, but the member profile could not be prepared.");
  }

  const supabase = await createClient();
  const { error: approvalError } = await withTimeout(
    supabase.rpc("approve_member", { p_user_id: createdUser.user.id }),
    "Activate staff credential",
  );

  if (approvalError) {
    return actionError(approvalError, "The member was created, but could not be activated.");
  }

  revalidatePath("/admin/members");
  return { ok: true };
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

export async function changePasswordAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error: verifyError } = await withTimeout(
    supabase.auth.signInWithPassword({
      email: profile.email,
      password: parsed.data.currentPassword,
    }),
    "Verify current password",
    SUPABASE_AUTH_TIMEOUT_MS,
  ).catch((error: unknown) => ({
    data: { user: null, session: null },
    error,
  }));

  if (verifyError) {
    return validationError({
      currentPassword: ["Current password is incorrect."],
    });
  }

  const { error } = await withTimeout(
    supabase.auth.updateUser({ password: parsed.data.newPassword }),
    "Change password",
    SUPABASE_AUTH_TIMEOUT_MS,
  );

  if (error) {
    return actionError(error, "Could not change your password.");
  }

  return { ok: true };
}

async function resolveLoginEmail(identifier: string) {
  const value = identifier.trim();
  if (value.includes("@")) return value.toLowerCase();

  const staffId = normalizeStaffId(value);
  if (!staffId) return null;

  const adminClient = createAdminClient();
  const { data: profile, error } = await withTimeout(
    adminClient
      .from("profiles")
      .select("email,status")
      .eq("staff_id", staffId)
      .maybeSingle(),
    "Staff ID login lookup",
  ).catch((error: unknown) => ({ data: null, error }));

  if (error || !profile) return null;
  return profile.email;
}

function normalizeStaffId(staffId: string) {
  const normalized = staffId.trim().replace(/\s+/g, "").toUpperCase();
  return normalized.startsWith("NAUB") ? normalized : `NAUB-${normalized}`;
}

function internalStaffEmail(staffId: string) {
  return `${staffId.toLowerCase()}@${STAFF_AUTH_DOMAIN}`;
}
