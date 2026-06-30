import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";

export async function getMemberDashboard(profile: Profile): Promise<{
  upcomingMeetings: any[];
  unackedMinutes: any[];
}> {
  const supabase = await createClient();

  const { data: upcomingMeetings } = await supabase
    .from("meetings")
    .select("id, title, scheduled_at, location, status, minutes_published_at")
    .in("status", ["agenda_published", "live"])
    .order("scheduled_at")
    .limit(5);

  const { data: unackedMinutes } = await supabase
    .from("minutes")
    .select("meeting:meetings(id, title, minutes_published_at), meeting_id")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(5);

  const meetingIds = (unackedMinutes ?? []).map((m: any) => m.meeting_id);
  if (meetingIds.length) {
    const { data: acks } = await supabase
      .from("minutes_acknowledgments")
      .select("meeting_id")
      .eq("user_id", profile.id)
      .in("meeting_id", meetingIds);

    const ackedIds = new Set((acks ?? []).map((a: any) => a.meeting_id));
    const unacked = (unackedMinutes ?? []).filter((m: any) => !ackedIds.has(m.meeting_id));
    return { upcomingMeetings: (upcomingMeetings ?? []) as any[], unackedMinutes: unacked as any[] };
  }

  return { upcomingMeetings: (upcomingMeetings ?? []) as any[], unackedMinutes: [] };
}

export async function getAdminDashboard(): Promise<{
  totalMeetings: number;
  activeMembers: number;
  pendingRegistrations: number;
  avgAttendance: number;
  completionRate: number;
  pendingCarryOvers: number;
  recentMeetings: any[];
}> {
  const supabase = await createClient();

  const [{ count: totalMeetings }, { count: activeMembers }, { count: pendingRegistrations }, { data: allMeetings }, { data: unack }] =
    await Promise.all([
      supabase.from("meetings").select("*", { count: "exact", head: true }).not("status", "eq", "cancelled"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("meetings")
        .select("id, title, scheduled_at, status, started_at, ended_at")
        .not("status", "eq", "cancelled")
        .order("scheduled_at", { ascending: false })
        .limit(50),
      supabase
        .from("minutes")
        .select("meeting_id")
        .not("published_at", "is", null),
    ]);

  const { data: attendanceCounts } = await supabase
    .from("attendance")
    .select("meeting_id");

  const meetingAttendance = new Map<string, number>();
  (attendanceCounts ?? []).forEach((a: any) => {
    meetingAttendance.set(a.meeting_id, (meetingAttendance.get(a.meeting_id) ?? 0) + 1);
  });

  const totalAttendance = Array.from(meetingAttendance.values()).reduce((s, n) => s + n, 0);
  const avgAttendance =
    meetingAttendance.size > 0 ? Math.round(totalAttendance / meetingAttendance.size) : 0;

  const endedMeetingIds = (allMeetings ?? [])
    .filter((m: any) => m.status === "ended" || m.status === "minutes_published")
    .map((m: any) => m.id);

  let completedItems = 0;
  let totalItems = 0;
  if (endedMeetingIds.length) {
    const { data: items } = await supabase
      .from("agenda_items")
      .select("id, status")
      .in("meeting_id", endedMeetingIds);

    totalItems = items?.length ?? 0;
    completedItems = items?.filter((i: any) => i.status === "resolved").length ?? 0;
  }

  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const { count: carryOvers } = await supabase
    .from("agenda_items")
    .select("*", { count: "exact", head: true })
    .in("status", ["deferred", "tabled"]);

  const recentMeetings = (allMeetings ?? []).slice(0, 5);

  return {
    totalMeetings: totalMeetings ?? 0,
    activeMembers: activeMembers ?? 0,
    pendingRegistrations: pendingRegistrations ?? 0,
    avgAttendance,
    completionRate,
    pendingCarryOvers: carryOvers ?? 0,
    recentMeetings: recentMeetings as any[],
  };
}
