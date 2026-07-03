import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const { data: profile } = (await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single()) as { data: Pick<ProfileRow, "status"> | null };

  if (profile?.status === "pending") {
    return NextResponse.redirect(new URL("/pending-approval", requestUrl.origin));
  }

  if (profile?.status === "suspended") {
    return NextResponse.redirect(new URL("/suspended", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
