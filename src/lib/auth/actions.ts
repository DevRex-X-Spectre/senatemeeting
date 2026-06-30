"use server";

import { redirect } from "next/navigation";
import { loginSchema, registerSchema, updateProfileSchema } from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function authConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("fetch failed") || message.includes("Connect Timeout")) {
    return "Cannot reach Supabase right now. Check your internet connection and try again.";
  }
  return message || "Authentication failed. Please try again.";
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth
    .signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })
    .catch((error: unknown) => ({
      data: { user: null, session: null },
      error: new Error(authConnectionError(error)),
    }));

  if (error) {
    return { ok: false, errors: { email: [error.message] } };
  }

  redirect("/dashboard");
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth
    .signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
      },
    })
    .catch((error: unknown) => ({
      data: { user: null, session: null },
      error: new Error(authConnectionError(error)),
    }));

  if (error) {
    return { ok: false, errors: { email: [error.message] } };
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
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfileAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    title: formData.get("title") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join(", ") || "Invalid input." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      title: parsed.data.title ?? null,
      avatar_url: parsed.data.avatarUrl ? parsed.data.avatarUrl : null,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

async function notifyAdminsAboutRegistration(member: { fullName: string; email: string }) {
  const adminClient = createAdminClient();
  const { data: admins } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .eq("status", "active");

  if (!admins?.length) return;

  await adminClient.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      kind: "approval_pending",
      title: "New member registration",
      body: `${member.fullName} (${member.email}) is waiting for approval.`,
    })),
  );
}
