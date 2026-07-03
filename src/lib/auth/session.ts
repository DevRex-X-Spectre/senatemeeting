import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapSupabaseError, SUPABASE_AUTH_TIMEOUT_MS, withTimeout } from "@/lib/supabase/errors";
import type { Profile } from "@/types/domain";

const PROFILE_COLUMNS =
  "id,email,full_name,role,status,title,avatar_url,approved_by,approved_at,created_at,updated_at";

export const getCurrentUserAndProfile = cache(async (): Promise<{ userId: string; profile: Profile } | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await withTimeout(
    supabase.auth.getUser(),
    "Supabase auth lookup",
    SUPABASE_AUTH_TIMEOUT_MS,
  ).catch((error: unknown) => ({
    data: { user: null },
    error,
  }));

  if (userError) {
    console.warn("Supabase auth lookup failed:", mapSupabaseError(userError).message);
    return null;
  }

  if (!user) return null;

  const { data: profile, error: profileError } = await withTimeout(
    supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle(),
    "Profile lookup",
  );

  if (profileError) {
    console.warn("Profile lookup failed:", mapSupabaseError(profileError).message);
    return null;
  }

  if (!profile) return null;
  return { userId: user.id, profile: profile as Profile };
});

export async function requireProfile() {
  const session = await getCurrentUserAndProfile();
  if (!session) redirect("/login");
  return session.profile;
}
