"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAgendaItemSchema, reorderAgendaItemsSchema, closeItemSchema } from "@/lib/validations/agenda-item";
import { requireActiveMember } from "@/lib/auth/guards";

export async function createAgendaItemAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = createAgendaItemSchema.safeParse({
    meetingId: formData.get("meetingId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    allocatedMin: Number(formData.get("allocatedMin")),
    orderIndex: Number(formData.get("orderIndex")),
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("agenda_items").insert({
    meeting_id: parsed.data.meetingId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    allocated_min: parsed.data.allocatedMin,
    order_index: parsed.data.orderIndex,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reorderAgendaItemsAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const orderedIds = (formData.get("orderedIds") as string | null)?.split(",") ?? [];
  const parsed = reorderAgendaItemsSchema.safeParse({
    meetingId: formData.get("meetingId"),
    orderedIds,
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const adminClient = createAdminClient();
  const updates = parsed.data.orderedIds.map((id, index) =>
    adminClient
      .from("agenda_items")
      .update({ order_index: index })
      .eq("id", id)
      .eq("meeting_id", parsed.data.meetingId),
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) return { ok: false, error: firstError.error.message };

  return { ok: true };
}

export async function startAgendaItemAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const itemId = formData.get("itemId") as string;
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("agenda_items")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", itemId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function closeAgendaItemAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = closeItemSchema.safeParse({
    itemId: formData.get("itemId"),
    status: formData.get("status"),
    outcomeNotes: formData.get("outcomeNotes") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("agenda_items")
    .update({
      status: parsed.data.status,
      outcome_notes: parsed.data.outcomeNotes ?? null,
      ended_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.itemId);

  if (error) return { ok: false, error: error.message };

  const { data: item } = await adminClient
    .from("agenda_items")
    .select("id, title, meeting_id")
    .eq("id", parsed.data.itemId)
    .single();

  if (item) {
    const { data: members } = await adminClient
      .from("profiles")
      .select("id")
      .eq("status", "active");

    if (members?.length) {
      await adminClient.from("notifications").insert(
        members.map((m: any) => ({
          user_id: m.id,
          kind: "item_resolved",
          title: "Item resolved",
          body: `Agenda item "${item.title}" has been marked ${parsed.data.status}.`,
          meeting_id: item.meeting_id,
        })),
      );
    }
  }

  return { ok: true };
}

export async function deleteAgendaItemAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const itemId = formData.get("itemId") as string;
  const supabase = await createClient();
  const { error } = await supabase.from("agenda_items").delete().eq("id", itemId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}