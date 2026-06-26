"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/guards";
import { carryOverSchema } from "@/lib/validations/meeting";

export async function getCarryOverCandidates() {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return [];

  const supabase = await createClient();

  // Find agenda items that are deferred/tabled and have not been carried
  // to a resolved meeting (i.e., no child exists with status != pending).
  const { data, error } = await supabase
    .from("agenda_items")
    .select(
      `
      id,
      title,
      description,
      allocated_min,
      status,
      meeting:meetings!inner(id, title, scheduled_at)
      `,
    )
    .in("status", ["deferred", "tabled"])
    .order("meeting.scheduled_at", { ascending: false });

  if (error || !data) return [];

  // Filter: only items that haven't been successfully carried yet.
  // An item is "carried" if there's a child agenda_item pointing to it
  // whose parent meeting is not draft.
  const candidates = data.filter(async (item) => {
    if (!item.id) return true;
    const { data: child } = await supabase
      .from("agenda_items")
      .select("id, meeting:meetings!inner(status)")
      .eq("carried_from_id", item.id)
      .neq("meetings.status", "draft")
      .limit(1)
      .single();
    return !child;
  });

  return candidates;
}

export async function carryOverToMeetingAction(input: { meetingId: string; itemIds: string[] }) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = carryOverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  // Get current max order_index in the target meeting.
  const { data: maxRow } = await supabase
    .from("agenda_items")
    .select("order_index")
    .eq("meeting_id", parsed.data.meetingId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const startIndex = (maxRow?.order_index ?? -1) + 1;

  // Fetch source items.
  const { data: sourceItems, error: sourceError } = await supabase
    .from("agenda_items")
    .select("id, title, description, allocated_min")
    .in("id", parsed.data.itemIds);

  if (sourceError || !sourceItems?.length) {
    return { ok: false, error: sourceError?.message ?? "Items not found." };
  }

  const inserts = sourceItems.map((item, i) => ({
    meeting_id: parsed.data.meetingId,
    title: item.title,
    description: item.description ?? null,
    allocated_min: item.allocated_min,
    order_index: startIndex + i,
    status: "pending" as const,
    carried_from_id: item.id,
  }));

  const { error: insertError } = await supabase
    .from("agenda_items")
    .insert(inserts);

  if (insertError) return { ok: false, error: insertError.message };
  return { ok: true };
}