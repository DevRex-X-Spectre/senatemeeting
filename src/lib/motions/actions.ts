"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { raiseMotionSchema, voteSchema, decideMotionSchema } from "@/lib/validations/motion";
import { requireActiveMember } from "@/lib/auth/guards";
import type { Motion, Vote, VoteTally } from "@/types/domain";

export async function raiseMotionAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();

  const parsed = raiseMotionSchema.safeParse({
    agendaItemId: formData.get("agendaItemId"),
    text: formData.get("text"),
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  const { data: item } = await supabase
    .from("agenda_items")
    .select("id, meeting_id")
    .eq("id", parsed.data.agendaItemId)
    .single();

  if (!item) return { ok: false, error: "Agenda item not found." };

  const { data, error } = await supabase
    .from("motions")
    .insert({
      meeting_id: item.meeting_id,
      agenda_item_id: parsed.data.agendaItemId,
      raised_by: profile.id,
      text: parsed.data.text,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, motionId: (data as any).id };
}

export async function secondMotionAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const motionId = formData.get("motionId") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("motions")
    .update({ seconded_by: profile.id })
    .eq("id", motionId)
    .eq("status", "raised")
    .is("seconded_by", null)
    .neq("raised_by", profile.id);

  if (error) return { ok: false, error: error.message };

  const adminClient = createAdminClient();
  const { data: motion } = await adminClient
    .from("motions")
    .select("id, text, meeting_id")
    .eq("id", motionId)
    .single();

  if (motion) {
    const { data: members } = await adminClient
      .from("profiles")
      .select("id")
      .eq("status", "active");

    if (members?.length) {
      await adminClient.from("notifications").insert(
        members.map((m: any) => ({
          user_id: m.id,
          kind: "motion_seconded",
          title: "Motion seconded",
          body: `Motion "${motion.text.slice(0, 60)}" has been seconded and will move to vote.`,
          meeting_id: motion.meeting_id,
        })),
      );
    }
  }

  return { ok: true };
}

export async function withdrawMotionAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const motionId = formData.get("motionId") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("motions")
    .update({ status: "withdrawn" })
    .eq("id", motionId)
    .eq("raised_by", profile.id)
    .in("status", ["raised", "seconded"]);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function openVoteAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const motionId = formData.get("motionId") as string;
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("motions")
    .update({
      status: "voting_open",
      opened_at: new Date().toISOString(),
    })
    .eq("id", motionId)
    .in("status", ["raised", "seconded"]);

  if (error) return { ok: false, error: error.message };

  const { data: motion } = await adminClient
    .from("motions")
    .select("text, meeting_id")
    .eq("id", motionId)
    .single();

  if (motion) {
    const { data: members } = await adminClient
      .from("profiles")
      .select("id")
      .eq("status", "active");

    if (members?.length) {
      await adminClient.from("notifications").insert(
        members.map((m: any) => ({
          user_id: m.id,
          kind: "vote_opened",
          title: "Vote opened",
          body: `A motion, "${motion.text.slice(0, 60)}", is open for voting. Cast your vote now.`,
          meeting_id: motion.meeting_id,
        })),
      );
    }
  }

  return { ok: true };
}

export async function voteAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();

  const parsed = voteSchema.safeParse({
    motionId: formData.get("motionId"),
    choice: formData.get("choice"),
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  const { error } = await supabase
    .from("votes")
    .upsert({
      motion_id: parsed.data.motionId,
      user_id: profile.id,
      choice: parsed.data.choice,
      voted_at: new Date().toISOString(),
    });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function decideMotionAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  if (profile.role !== "admin") return { ok: false, error: "Admin access required." };

  const parsed = decideMotionSchema.safeParse({
    motionId: formData.get("motionId"),
    outcome: formData.get("outcome"),
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("motions")
    .update({
      status: parsed.data.outcome,
      closed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.motionId)
    .eq("status", "voting_open");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getMotionsForMeeting(meetingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("motions")
    .select(
      `*, raised_by:profiles!motions_raised_by_fkey(full_name), seconded_by:profiles!motions_seconded_by_fkey(full_name)`,
    )
    .eq("meeting_id", meetingId)
    .order("created_at");

  if (error) throw error;
  return (data ?? []) as (Motion & {
    raised_by: { full_name: string };
    seconded_by: { full_name: string } | null;
  })[];
}

export async function getVoteTally(motionId: string, userId: string): Promise<VoteTally | null> {
  const supabase = await createClient();

  const { data: votes, error } = await supabase
    .from("votes")
    .select("choice, user_id")
    .eq("motion_id", motionId);

  if (error) return null;

  const yes = votes?.filter((v) => v.choice === "yes").length ?? 0;
  const no = votes?.filter((v) => v.choice === "no").length ?? 0;
  const abstain = votes?.filter((v) => v.choice === "abstain").length ?? 0;
  const myChoice = votes?.find((v) => v.user_id === userId)?.choice ?? null;

  return { motion_id: motionId, yes, no, abstain, total: yes + no + abstain, my_choice: myChoice };
}