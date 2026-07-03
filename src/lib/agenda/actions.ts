"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createAgendaItemSchema,
  reorderAgendaItemsSchema,
  closeItemSchema,
  updateItemStatusSchema,
} from "@/lib/validations/agenda-item";
import { requireActiveMember } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { actionError, validationError, withTimeout } from "@/lib/supabase/errors";

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
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase.from("agenda_items").insert({
      meeting_id: parsed.data.meetingId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      allocated_min: parsed.data.allocatedMin,
      order_index: parsed.data.orderIndex,
    }),
    "Create agenda item",
  );

  if (error) return actionError(error, "Could not create this agenda item.");
  revalidatePath(`/admin/meetings/${parsed.data.meetingId}`);
  revalidatePath(`/admin/meetings/${parsed.data.meetingId}/agenda`);
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
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const adminClient = createAdminClient();
  const updates = parsed.data.orderedIds.map((id, index) =>
    adminClient
      .from("agenda_items")
      .update({ order_index: index })
      .eq("id", id)
      .eq("meeting_id", parsed.data.meetingId),
  );

  const results = await withTimeout(Promise.all(updates), "Reorder agenda items");
  const firstError = results.find((r) => r.error);
  if (firstError?.error) return actionError(firstError.error, "Could not reorder agenda items.");

  revalidatePath(`/admin/meetings/${parsed.data.meetingId}`);
  revalidatePath(`/admin/meetings/${parsed.data.meetingId}/agenda`);
  return { ok: true };
}

export async function startAgendaItemAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const itemId = formData.get("itemId") as string;
  const adminClient = createAdminClient();

  const { data: item, error } = await withTimeout(
    adminClient
    .from("agenda_items")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", itemId)
      .select("meeting_id")
      .single(),
    "Start agenda item",
  );

  if (error) return actionError(error, "Could not start this agenda item.");
  if (item?.meeting_id) {
    revalidatePath(`/admin/meetings/${item.meeting_id}`);
    revalidatePath(`/meetings/${item.meeting_id}`);
  }
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
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const adminClient = createAdminClient();

  const { data: item, error } = await withTimeout(
    adminClient
    .from("agenda_items")
    .update({
      status: parsed.data.status,
      outcome_notes: parsed.data.outcomeNotes ?? null,
      ended_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.itemId)
      .select("id, title, meeting_id")
      .single(),
    "Close agenda item",
  );

  if (error) return actionError(error, "Could not close this agenda item.");

  if (item) {
    const { data: members } = await adminClient
      .from("profiles")
      .select("id")
      .eq("status", "active");

    if (members?.length) {
      await adminClient.from("notifications").insert(
        members.map((member: { id: string }) => ({
          user_id: member.id,
          kind: "item_resolved",
          title: "Item resolved",
          body: `Agenda item "${item.title}" has been marked ${parsed.data.status}.`,
          meeting_id: item.meeting_id,
        })),
      );
    }
  }

  if (item) {
    revalidatePath(`/admin/meetings/${item.meeting_id}`);
    revalidatePath(`/meetings/${item.meeting_id}`);
  }

  return { ok: true };
}

export async function updateAgendaItemStatusAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = updateItemStatusSchema.safeParse({
    itemId: formData.get("itemId"),
    status: formData.get("status"),
    outcomeNotes: formData.get("outcomeNotes") || undefined,
  });
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const adminClient = createAdminClient();
  const now = new Date().toISOString();
  const completed = parsed.data.status === "resolved" || parsed.data.status === "deferred" || parsed.data.status === "tabled";

  const updatePayload: {
    status: typeof parsed.data.status;
    outcome_notes: string | null;
    started_at?: string | null;
    ended_at: string | null;
  } = {
    status: parsed.data.status,
    outcome_notes: parsed.data.outcomeNotes ?? null,
    ended_at: completed ? now : null,
  };

  if (parsed.data.status === "in_progress") {
    updatePayload.started_at = now;
  }

  if (parsed.data.status === "pending") {
    updatePayload.started_at = null;
  }

  const { data: item, error } = await withTimeout(
    adminClient
    .from("agenda_items")
    .update(updatePayload)
    .eq("id", parsed.data.itemId)
    .select("id, title, meeting_id")
      .single(),
    "Update agenda item status",
  );

  if (error) return actionError(error, "Could not update this agenda item.");

  if (item && completed) {
    const { data: members } = await adminClient
      .from("profiles")
      .select("id")
      .eq("status", "active");

    if (members?.length) {
      await adminClient.from("notifications").insert(
        members.map((member: { id: string }) => ({
          user_id: member.id,
          kind: "item_resolved",
          title: "Agenda updated",
          body: `Agenda item "${item.title}" has been marked ${parsed.data.status}.`,
          meeting_id: item.meeting_id,
        })),
      );
    }
  }

  if (item) {
    revalidatePath(`/admin/meetings/${item.meeting_id}`);
    revalidatePath(`/meetings/${item.meeting_id}`);
  }

  return { ok: true };
}

export async function deleteAgendaItemAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const itemId = formData.get("itemId") as string;
  const supabase = await createClient();
  const { data: item, error } = await withTimeout(
    supabase.from("agenda_items").delete().eq("id", itemId).select("meeting_id").single(),
    "Delete agenda item",
  );
  if (error) return actionError(error, "Could not delete this agenda item.");
  if (item?.meeting_id) {
    revalidatePath(`/admin/meetings/${item.meeting_id}`);
    revalidatePath(`/admin/meetings/${item.meeting_id}/agenda`);
  }
  return { ok: true };
}
