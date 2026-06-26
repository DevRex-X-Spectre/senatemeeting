"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/guards";

export async function checkInAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const meetingId = formData.get("meetingId") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance")
    .upsert({
      meeting_id: meetingId,
      user_id: profile.id,
      checked_in_at: new Date().toISOString(),
    });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getAttendanceForMeeting(meetingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("*, user:profiles!attendance_user_id_fkey(id, full_name, avatar_url)")
    .eq("meeting_id", meetingId)
    .order("checked_in_at");

  if (error) throw error;
  return data ?? [];
}

export async function getMyAttendance(meetingId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select()
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
}