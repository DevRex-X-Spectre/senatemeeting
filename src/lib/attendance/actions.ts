"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/guards";
import { actionError, throwFriendlyError, withTimeout } from "@/lib/supabase/errors";

export async function checkInAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const meetingId = formData.get("meetingId") as string;

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase
    .from("attendance")
    .upsert({
      meeting_id: meetingId,
      user_id: profile.id,
      checked_in_at: new Date().toISOString(),
    }),
    "Meeting check-in",
  );

  if (error) return actionError(error, "Could not check you in to this meeting.");
  return { ok: true };
}

export async function getAttendanceForMeeting(meetingId: string) {
  const supabase = await createClient();
  const { data, error } = await withTimeout(
    supabase
    .from("attendance")
      .select("meeting_id,user_id,checked_in_at,user:profiles!attendance_user_id_fkey(id, full_name, avatar_url)")
    .eq("meeting_id", meetingId)
      .order("checked_in_at"),
    "Meeting attendance lookup",
  );

  if (error) throwFriendlyError(error, "Could not load attendance.");
  return data ?? [];
}

export async function getMyAttendance(meetingId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await withTimeout(
    supabase
    .from("attendance")
      .select("meeting_id")
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
      .maybeSingle(),
    "My attendance lookup",
  ).catch(() => ({ data: null }));

  return !!data;
}
