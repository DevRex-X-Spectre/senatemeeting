"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveMember } from "@/lib/auth/guards";
import { updateMinutesSchema } from "@/lib/validations/minutes";
import { formatDateTime } from "@/lib/utils/dates";

export async function generateMinutesAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  // Fetch all meeting data.
  const [{ data: meeting }, { data: agendaItems }, { data: attendance }, { data: motions }, { data: quorum }] =
    await Promise.all([
      adminClient.from("meetings").select("*, created_by:profiles(full_name)").eq("id", meetingId).single(),
      adminClient.from("agenda_items").select("*").eq("meeting_id", meetingId).order("order_index"),
      adminClient.from("attendance").select("*, user:profiles(full_name)").eq("meeting_id", meetingId),
      adminClient.from("motions").select("*, raised_by:profiles(full_name), seconded_by:profiles(full_name)").eq("meeting_id", meetingId),
      adminClient.from("meeting_quorum").select().eq("meeting_id", meetingId).single(),
    ]);

  if (!meeting) return { ok: false, error: "Meeting not found." };

  const lines: string[] = [];
  lines.push(`# ${meeting.title}`);
  lines.push(`**Date:** ${formatDateTime(meeting.scheduled_at)}`);
  if (meeting.location) lines.push(`**Location:** ${meeting.location}`);
  lines.push(`**Duration:** ${meeting.duration_min} minutes`);
  const present = quorum?.present ?? attendance?.length ?? 0;
  const denom = quorum?.denominator ?? 0;
  lines.push(
    `**Attendance:** ${present}/${denom} members present — quorum ${quorum?.quorum_met ? "**met**" : "_not met_"}`,
  );
  lines.push("");

  // Agenda items.
  lines.push("## Agenda");
  if (agendaItems?.length) {
    agendaItems.forEach((item, i) => {
      lines.push(`### ${i + 1}. ${item.title}`);
      if (item.description) lines.push(item.description);
      lines.push(`**Status:** ${item.status}`);
      if (item.outcome_notes) lines.push(`**Outcome:** ${item.outcome_notes}`);
      lines.push("");
    });
  } else {
    lines.push("No agenda items recorded.\n");
  }

  // Motions.
  const meetingMotions = (motions ?? []).filter((m) => m.status !== "withdrawn");
  if (meetingMotions.length) {
    lines.push("## Motions");
    meetingMotions.forEach((m) => {
      lines.push(`- **${m.text}** — raised by ${m.raised_by?.full_name ?? "Unknown"}, seconded by ${m.seconded_by?.full_name ?? "None"}, status: **${m.status}**`);
    });
    lines.push("");
  }

  // Resolutions.
  const passed = meetingMotions.filter((m) => m.status === "passed");
  if (passed.length) {
    lines.push("## Resolutions Passed");
    passed.forEach((m) => lines.push(`- ${m.text}`));
    lines.push("");
  }

  // Carried items.
  const carried = (agendaItems ?? []).filter((i) => i.status === "deferred" || i.status === "tabled");
  if (carried.length) {
    const status = carried.every((i) => i.status === "deferred") ? "Deferred" : carried.every((i) => i.status === "tabled") ? "Tabled" : "Deferred / Tabled";
    lines.push(`## Items Carried Forward (${status})`);
    carried.forEach((i) => lines.push(`- ${i.title}`));
    lines.push("");
  }

  const body = lines.join("\n");

  const { error } = await adminClient
    .from("minutes")
    .upsert({
      meeting_id: meetingId,
      body,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateMinutesAction(input: { meetingId: string; body: string }) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = updateMinutesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("minutes")
    .update({ body: parsed.data.body })
    .eq("meeting_id", parsed.data.meetingId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function publishMinutesAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const meetingId = formData.get("meetingId") as string;
  const adminClient = createAdminClient();

  const { error: minutesError } = await adminClient
    .from("minutes")
    .update({
      published_at: new Date().toISOString(),
      published_by: profile.id,
    })
    .eq("meeting_id", meetingId);

  if (minutesError) return { ok: false, error: minutesError.message };

  const { error: meetingError } = await adminClient
    .from("meetings")
    .update({
      status: "minutes_published",
      minutes_published_at: new Date().toISOString(),
    })
    .eq("id", meetingId);

  if (meetingError) return { ok: false, error: meetingError.message };

  const { data: meeting } = await adminClient.from("meetings").select("title").eq("id", meetingId).single();
  const { data: members } = await adminClient.from("profiles").select("id").eq("status", "active");

  if (members?.length) {
    await adminClient.from("notifications").insert(
      members.map((m: any) => ({
        user_id: m.id,
        kind: "minutes_published",
        title: "Minutes published",
        body: `Minutes for "${meeting?.title ?? "a meeting"}" are ready to review and acknowledge.`,
        meeting_id: meetingId,
      })),
    );
  }

  return { ok: true };
}

export async function acknowledgeMinutesAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const meetingId = formData.get("meetingId") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("minutes_acknowledgments")
    .upsert({
      meeting_id: meetingId,
      user_id: profile.id,
      acknowledged_at: new Date().toISOString(),
    });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getMinutes(meetingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("minutes")
    .select("*, published_by:profiles(full_name)")
    .eq("meeting_id", meetingId)
    .maybeSingle();

  return data ?? null;
}

export async function getMyAcknowledgment(meetingId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("minutes_acknowledgments")
    .select()
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
}