"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMeetingSchema, updateMeetingSchema } from "@/lib/validations/meeting";
import { requireActiveMember } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import type { Meeting } from "@/types/domain";

export async function createMeetingAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = createMeetingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    durationMin: Number(formData.get("durationMin")),
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      location: parsed.data.location ?? null,
      scheduled_at: parsed.data.scheduledAt,
      duration_min: parsed.data.durationMin,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, meetingId: (data as any).id };
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
) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = updateMeetingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("meetings")
    .update({
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description ?? null }),
      ...(parsed.data.location !== undefined && { location: parsed.data.location ?? null }),
      ...(parsed.data.scheduledAt !== undefined && { scheduled_at: parsed.data.scheduledAt }),
      ...(parsed.data.durationMin !== undefined && { duration_min: parsed.data.durationMin }),
    })
    .eq("id", meetingId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function publishAgendaAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  const { count } = await adminClient
    .from("agenda_items")
    .select("*", { count: "exact", head: true })
    .eq("meeting_id", meetingId);

  if (!count || count < 1) {
    return { ok: false, error: "Cannot publish agenda with no items." };
  }

  const { error } = await adminClient
    .from("meetings")
    .update({
      status: "agenda_published",
      agenda_published_at: new Date().toISOString(),
    })
    .eq("id", meetingId);

  if (error) return { ok: false, error: error.message };

  const { data: members } = await adminClient
    .from("profiles")
    .select("id")
    .eq("status", "active");

  if (members?.length) {
    const { data: meeting } = await adminClient
      .from("meetings")
      .select("title")
      .eq("id", meetingId)
      .single();

    await adminClient.from("notifications").insert(
      members.map((m: any) => ({
        user_id: m.id,
        kind: "agenda_published",
        title: "Agenda published",
        body: `The agenda for "${meeting?.title ?? "an upcoming meeting"}" is ready to review.`,
        meeting_id: meetingId,
      })),
    );
  }

  return { ok: true };
}

export async function startMeetingAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("meetings")
    .update({
      status: "live",
      started_at: new Date().toISOString(),
    })
    .eq("id", meetingId)
    .eq("status", "agenda_published");

  if (error) return { ok: false, error: error.message };

  const { data: meeting } = await adminClient
    .from("meetings")
    .select("title")
    .eq("id", meetingId)
    .single();

  const { data: members } = await adminClient
    .from("profiles")
    .select("id")
    .eq("status", "active");

  if (members?.length) {
    await adminClient.from("notifications").insert(
      members.map((m: any) => ({
        user_id: m.id,
        kind: "meeting_starting",
        title: "Meeting is live",
        body: `"${meeting?.title ?? "A meeting"}" has started — check in and join.`,
        meeting_id: meetingId,
      })),
    );
  }

  return { ok: true };
}

export async function endMeetingAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  const { count } = await adminClient
    .from("agenda_items")
    .select("*", { count: "exact", head: true })
    .eq("meeting_id", meetingId)
    .eq("status", "in_progress");

  if (count && count > 0) {
    return { ok: false, error: "Cannot end meeting while an agenda item is in progress." };
  }

  const { error } = await adminClient
    .from("meetings")
    .update({
      status: "ended",
      ended_at: new Date().toISOString(),
    })
    .eq("id", meetingId);

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function cancelMeetingAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const meetingId = formData.get("meetingId") as string;
  const supabase = await createClient();
  const { error } = await supabase
    .from("meetings")
    .update({ status: "cancelled" })
    .eq("id", meetingId)
    .eq("status", "draft");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}