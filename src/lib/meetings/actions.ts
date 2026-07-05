"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMeetingSchema, updateMeetingSchema } from "@/lib/validations/meeting";
import { requireActiveMember } from "@/lib/auth/guards";
import { canManageSenate } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { actionError, validationError, withTimeout, type ActionResult } from "@/lib/supabase/errors";

export async function createMeetingAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const profile = await requireActiveMember();
  if (!canManageSenate(profile)) return { ok: false, error: "Senate manager access required." };

  const parsed = createMeetingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    durationMin: Number(formData.get("durationMin")),
  });
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const supabase = await createClient();
  const { data, error } = await withTimeout(
    supabase
    .from("meetings")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      location: parsed.data.location ?? null,
      scheduled_at: parsed.data.scheduledAt,
      duration_min: parsed.data.durationMin,
      created_by: profile.id,
    })
      .select("id")
      .single(),
    "Create meeting",
  );

  if (error) return actionError(error, "Could not create this meeting.");
  revalidatePath("/admin/meetings");
  redirect(`/admin/meetings/${data.id}`);
}

export async function updateMeetingAction(
  meetingId: string,
  input: {
    title?: string;
    description?: string;
    location?: string;
    scheduledAt?: string;
    durationMin?: number;
  },
): Promise<ActionResult> {
  const profile = await requireActiveMember();
  if (!canManageSenate(profile)) return { ok: false, error: "Senate manager access required." };

  const parsed = updateMeetingSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase
    .from("meetings")
    .update({
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description ?? null }),
      ...(parsed.data.location !== undefined && { location: parsed.data.location ?? null }),
      ...(parsed.data.scheduledAt !== undefined && { scheduled_at: parsed.data.scheduledAt }),
      ...(parsed.data.durationMin !== undefined && { duration_min: parsed.data.durationMin }),
    })
      .eq("id", meetingId),
    "Update meeting",
  );

  if (error) return actionError(error, "Could not update this meeting.");
  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath("/admin/meetings");
  return { ok: true };
}

export async function publishAgendaAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const profile = await requireActiveMember();
  if (!canManageSenate(profile)) return { ok: false, error: "Senate manager access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  const { count, error: countError } = await withTimeout(
    adminClient
    .from("agenda_items")
      .select("id", { count: "exact", head: true })
      .eq("meeting_id", meetingId),
    "Agenda item count",
  );

  if (countError) return actionError(countError, "Could not verify agenda items.");

  if (!count || count < 1) {
    return { ok: false, error: "Cannot publish agenda with no items." };
  }

  const { data: meeting, error } = await withTimeout(
    adminClient
    .from("meetings")
    .update({
      status: "agenda_published",
      agenda_published_at: new Date().toISOString(),
    })
      .eq("id", meetingId)
      .select("title")
      .single(),
    "Publish agenda",
  );

  if (error) return actionError(error, "Could not publish this agenda.");

  const { data: members, error: membersError } = await withTimeout(
    adminClient
    .from("profiles")
    .select("id")
      .eq("status", "active"),
    "Active member lookup",
  );

  if (membersError) return actionError(membersError, "Agenda was published, but member notifications could not be prepared.");

  if (members?.length) {
    const { error: notificationError } = await withTimeout(
      adminClient.from("notifications").insert(
      members.map((member: { id: string }) => ({
        user_id: member.id,
        kind: "agenda_published",
        title: "Agenda published",
        body: `The agenda for "${meeting?.title ?? "an upcoming meeting"}" is ready to review.`,
        meeting_id: meetingId,
      })),
      ),
      "Agenda notification insert",
    );
    if (notificationError) return actionError(notificationError, "Agenda was published, but notifications could not be sent.");
  }

  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath(`/meetings/${meetingId}`);
  revalidatePath("/meetings");
  return { ok: true };
}

export async function startMeetingAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const profile = await requireActiveMember();
  if (!canManageSenate(profile)) return { ok: false, error: "Senate manager access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  const { data: meeting, error } = await withTimeout(
    adminClient
    .from("meetings")
    .update({
      status: "live",
      started_at: new Date().toISOString(),
    })
    .eq("id", meetingId)
      .eq("status", "agenda_published")
      .select("title")
      .single(),
    "Start meeting",
  );

  if (error) return actionError(error, "Could not start this meeting.");

  const { data: members, error: membersError } = await withTimeout(
    adminClient
    .from("profiles")
    .select("id")
      .eq("status", "active"),
    "Active member lookup",
  );

  if (membersError) return actionError(membersError, "Meeting started, but member notifications could not be prepared.");

  if (members?.length) {
    const { error: notificationError } = await withTimeout(
      adminClient.from("notifications").insert(
      members.map((member: { id: string }) => ({
        user_id: member.id,
        kind: "meeting_starting",
        title: "Meeting is live",
        body: `"${meeting?.title ?? "A meeting"}" has started, check in and join.`,
        meeting_id: meetingId,
      })),
      ),
      "Meeting start notification insert",
    );
    if (notificationError) return actionError(notificationError, "Meeting started, but notifications could not be sent.");
  }

  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath(`/meetings/${meetingId}`);
  revalidatePath("/meetings");
  return { ok: true };
}

export async function endMeetingAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const profile = await requireActiveMember();
  if (!canManageSenate(profile)) return { ok: false, error: "Senate manager access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  const { count, error: countError } = await withTimeout(
    adminClient
    .from("agenda_items")
      .select("id", { count: "exact", head: true })
    .eq("meeting_id", meetingId)
      .eq("status", "in_progress"),
    "Active agenda item count",
  );

  if (countError) return actionError(countError, "Could not check active agenda items.");

  if (count && count > 0) {
    return { ok: false, error: "Cannot end meeting while an agenda item is in progress." };
  }

  const { error } = await withTimeout(
    adminClient
    .from("meetings")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
    })
      .eq("id", meetingId),
    "End meeting",
  );

  if (error) return actionError(error, "Could not end this meeting.");

  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath(`/meetings/${meetingId}`);
  revalidatePath("/history");
  return { ok: true };
}

export async function cancelMeetingAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const profile = await requireActiveMember();
  if (!canManageSenate(profile)) return { ok: false, error: "Senate manager access required." };

  const meetingId = formData.get("meetingId") as string;
  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase
    .from("meetings")
    .update({ status: "cancelled" })
    .eq("id", meetingId)
      .eq("status", "draft"),
    "Cancel meeting",
  );

  if (error) return actionError(error, "Could not cancel this meeting.");
  revalidatePath("/admin/meetings");
  revalidatePath(`/admin/meetings/${meetingId}`);
  return { ok: true };
}
