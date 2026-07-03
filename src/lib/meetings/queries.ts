import { createClient } from "@/lib/supabase/server";
import { throwFriendlyError, withTimeout } from "@/lib/supabase/errors";
import type { Meeting, AgendaItem, QuorumSnapshot } from "@/types/domain";

type MeetingWithCreator = Meeting & {
  created_by: { full_name: string | null } | null;
};

export async function listMeetings(options?: {
  status?: Meeting["status"];
  limit?: number;
}): Promise<MeetingWithCreator[]> {
  const supabase = await createClient();
  let query = supabase
    .from("meetings")
    .select("id,title,description,location,scheduled_at,duration_min,status,created_by,agenda_published_at,started_at,ended_at,minutes_published_at,created_at,updated_at,created_by:profiles!meetings_created_by_fkey(full_name)")
    .order("scheduled_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await withTimeout(query, "Meetings list");
  if (error) throwFriendlyError(error, "Could not load meetings.");
  return (data ?? []) as MeetingWithCreator[];
}

export async function getMeeting(meetingId: string): Promise<MeetingWithCreator | null> {
  const supabase = await createClient();
  const { data, error } = await withTimeout(
    supabase
    .from("meetings")
      .select("id,title,description,location,scheduled_at,duration_min,status,created_by,agenda_published_at,started_at,ended_at,minutes_published_at,created_at,updated_at,created_by:profiles!meetings_created_by_fkey(full_name)")
    .eq("id", meetingId)
      .maybeSingle(),
    "Meeting lookup",
  );

  if (error) return null;
  return (data as MeetingWithCreator | null) ?? null;
}

export async function getAgendaItems(meetingId: string): Promise<AgendaItem[]> {
  const supabase = await createClient();
  const { data, error } = await withTimeout(
    supabase
    .from("agenda_items")
      .select("id,meeting_id,title,description,allocated_min,order_index,status,outcome_notes,carried_from_id,started_at,ended_at,created_at,updated_at")
    .eq("meeting_id", meetingId)
      .order("order_index"),
    "Agenda item lookup",
  );

  if (error) throwFriendlyError(error, "Could not load agenda items.");
  return (data ?? []) as AgendaItem[];
}

export async function getQuorum(meetingId: string): Promise<QuorumSnapshot | null> {
  const supabase = await createClient();
  const { data, error } = await withTimeout(
    supabase
    .from("meeting_quorum")
      .select("meeting_id,denominator,present,quorum_met")
    .eq("meeting_id", meetingId)
      .maybeSingle(),
    "Quorum lookup",
  );

  if (error) return null;
  return (data as QuorumSnapshot | null) ?? null;
}

export async function getMeetingOverview(meetingId: string) {
  const [meeting, agendaItems, quorum] = await Promise.all([
    getMeeting(meetingId),
    getAgendaItems(meetingId),
    getQuorum(meetingId),
  ]);

  return { meeting, agendaItems, quorum };
}
