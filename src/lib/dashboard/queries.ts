import { createClient } from "@/lib/supabase/server";
import { throwFriendlyError, withTimeout } from "@/lib/supabase/errors";
import type { Meeting, Profile } from "@/types/domain";

type DashboardMeeting = Pick<Meeting, "id" | "title" | "scheduled_at" | "location" | "status" | "minutes_published_at">;

type UnackedMinute = {
  meeting_id: string;
  published_at: string | null;
  meeting:
    | {
    id: string;
    title: string;
    minutes_published_at: string | null;
      }
    | null;
};

export async function getMemberDashboard(profile: Profile): Promise<{
  upcomingMeetings: DashboardMeeting[];
  unackedMinutes: UnackedMinute[];
}> {
  const supabase = await createClient();

  const [
    { data: upcomingMeetings, error: upcomingError },
    { data: unackedMinutes, error: minutesError },
  ] = await Promise.all([
    withTimeout(
      supabase
        .from("meetings")
        .select("id, title, scheduled_at, location, status, minutes_published_at")
        .in("status", ["agenda_published", "live"])
        .order("scheduled_at")
        .limit(5),
      "Member dashboard meetings",
    ),
    withTimeout(
      supabase
        .from("minutes")
        .select("meeting_id,published_at,meeting:meetings(id,title,minutes_published_at)")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(10),
      "Member dashboard minutes",
    ),
  ]);

  if (upcomingError) throwFriendlyError(upcomingError, "Could not load upcoming meetings.");
  if (minutesError) throwFriendlyError(minutesError, "Could not load minutes for review.");

  const normalizedMinutes = (unackedMinutes ?? []).map((minute) => ({
    meeting_id: minute.meeting_id,
    published_at: minute.published_at,
    meeting: Array.isArray(minute.meeting) ? (minute.meeting[0] ?? null) : minute.meeting,
  })) as UnackedMinute[];

  const meetingIds = normalizedMinutes.map((minute) => minute.meeting_id);
  if (meetingIds.length) {
    const { data: acks, error: ackError } = await withTimeout(
      supabase
        .from("minutes_acknowledgments")
        .select("meeting_id")
        .eq("user_id", profile.id)
        .in("meeting_id", meetingIds),
      "Minutes acknowledgment lookup",
    );

    if (ackError) throwFriendlyError(ackError, "Could not load minutes acknowledgments.");

    const ackedIds = new Set((acks ?? []).map((ack) => ack.meeting_id));
    const unacked = normalizedMinutes.filter((minute) => !ackedIds.has(minute.meeting_id));
    return { upcomingMeetings: (upcomingMeetings ?? []) as DashboardMeeting[], unackedMinutes: unacked.slice(0, 5) };
  }

  return { upcomingMeetings: (upcomingMeetings ?? []) as DashboardMeeting[], unackedMinutes: [] };
}

export async function getAdminDashboard(): Promise<{
  totalMeetings: number;
  activeMembers: number;
  pendingRegistrations: number;
  avgAttendance: number;
  completionRate: number;
  pendingCarryOvers: number;
  recentMeetings: Pick<Meeting, "id" | "title" | "scheduled_at" | "status" | "started_at" | "ended_at">[];
}> {
  const supabase = await createClient();

  const [
    { count: totalMeetings, error: totalMeetingsError },
    { count: activeMembers, error: activeMembersError },
    { count: pendingRegistrations, error: pendingRegistrationsError },
    { data: allMeetings, error: meetingsError },
  ] = await Promise.all([
      withTimeout(supabase.from("meetings").select("id", { count: "exact", head: true }).not("status", "eq", "cancelled"), "Total meetings count"),
      withTimeout(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"), "Active members count"),
      withTimeout(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending"), "Pending registrations count"),
      withTimeout(
        supabase
          .from("meetings")
          .select("id, title, scheduled_at, status, started_at, ended_at")
          .not("status", "eq", "cancelled")
          .order("scheduled_at", { ascending: false })
          .limit(50),
        "Admin dashboard meetings",
      ),
    ]);

  if (totalMeetingsError) throwFriendlyError(totalMeetingsError, "Could not load meeting count.");
  if (activeMembersError) throwFriendlyError(activeMembersError, "Could not load member count.");
  if (pendingRegistrationsError) throwFriendlyError(pendingRegistrationsError, "Could not load pending registrations.");
  if (meetingsError) throwFriendlyError(meetingsError, "Could not load recent meetings.");

  const { data: attendanceCounts, error: attendanceError } = await withTimeout(
    supabase
      .from("attendance")
      .select("meeting_id"),
    "Attendance count lookup",
  );

  if (attendanceError) throwFriendlyError(attendanceError, "Could not load attendance stats.");

  const meetingAttendance = new Map<string, number>();
  (attendanceCounts ?? []).forEach((attendance) => {
    meetingAttendance.set(attendance.meeting_id, (meetingAttendance.get(attendance.meeting_id) ?? 0) + 1);
  });

  const totalAttendance = Array.from(meetingAttendance.values()).reduce((s, n) => s + n, 0);
  const avgAttendance =
    meetingAttendance.size > 0 ? Math.round(totalAttendance / meetingAttendance.size) : 0;

  const endedMeetingIds = (allMeetings ?? [])
    .filter((meeting) => meeting.status === "ended" || meeting.status === "minutes_published")
    .map((meeting) => meeting.id);

  let completedItems = 0;
  let totalItems = 0;
  if (endedMeetingIds.length) {
    const { data: items, error: itemsError } = await withTimeout(
      supabase
        .from("agenda_items")
        .select("id, status")
        .in("meeting_id", endedMeetingIds),
      "Agenda completion lookup",
    );

    if (itemsError) throwFriendlyError(itemsError, "Could not load agenda completion stats.");

    totalItems = items?.length ?? 0;
    completedItems = items?.filter((item) => item.status === "resolved").length ?? 0;
  }

  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const { count: carryOvers, error: carryOverError } = await withTimeout(
    supabase
      .from("agenda_items")
      .select("id", { count: "exact", head: true })
      .in("status", ["deferred", "tabled"]),
    "Carry-over count",
  );

  if (carryOverError) throwFriendlyError(carryOverError, "Could not load carry-over stats.");

  const recentMeetings = (allMeetings ?? []).slice(0, 5);

  return {
    totalMeetings: totalMeetings ?? 0,
    activeMembers: activeMembers ?? 0,
    pendingRegistrations: pendingRegistrations ?? 0,
    avgAttendance,
    completionRate,
    pendingCarryOvers: carryOvers ?? 0,
    recentMeetings,
  };
}
