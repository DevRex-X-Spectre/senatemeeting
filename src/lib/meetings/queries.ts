import { createClient } from "@/lib/supabase/server";
import type { Meeting, AgendaItem, QuorumSnapshot } from "@/types/domain";

export async function listMeetings(options?: {
  status?: Meeting["status"];
  limit?: number;
}): Promise<any[]> {
  const supabase = await createClient();
  let q: any = supabase
    .from("meetings")
    .select("*, created_by:profiles!meetings_created_by_fkey(full_name)")
    .order("scheduled_at", { ascending: false });

  if (options?.status) q = q.eq("status", options.status);
  if (options?.limit) q = q.limit(options.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getMeeting(meetingId: string): Promise<any | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("*, created_by:profiles!meetings_created_by_fkey(full_name)")
    .eq("id", meetingId)
    .single();

  if (error) return null;
  return data as any;
}

export async function getAgendaItems(meetingId: string): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agenda_items")
    .select("*, carried_from:agenda_items!agenda_items_carried_from_id_fkey(title)")
    .eq("meeting_id", meetingId)
    .order("order_index");

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getQuorum(meetingId: string): Promise<QuorumSnapshot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meeting_quorum")
    .select()
    .eq("meeting_id", meetingId)
    .single();

  if (error) return null;
  return data as QuorumSnapshot;
}