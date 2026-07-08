import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getAgendaItems, getMeeting, getQuorum } from "@/lib/meetings/queries";
import { getMotionsForMeeting } from "@/lib/motions/actions";
import { LiveAdminClient } from "./LiveAdminClient";
import type { AgendaItem, Meeting, QuorumSnapshot } from "@/types/domain";

export const metadata: Metadata = {
  title: "Live agenda controls | NaubSenate",
};

type MotionWithPeople = Awaited<ReturnType<typeof getMotionsForMeeting>>[number];

export default async function LiveAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: meetingId } = await params;
  await requireAdmin();

  const [meeting, agendaItems, quorum, motions] = await Promise.all([
    getMeeting(meetingId) as Promise<(Meeting & { created_by: { full_name: string | null } | null }) | null>,
    getAgendaItems(meetingId) as Promise<AgendaItem[]>,
    getQuorum(meetingId) as Promise<QuorumSnapshot | null>,
    getMotionsForMeeting(meetingId) as Promise<MotionWithPeople[]>,
  ]);

  return (
    <LiveAdminClient
      meetingId={meetingId}
      meetingTitle={meeting?.title ?? "Live session"}
      initialAgendaItems={agendaItems}
      initialQuorum={quorum}
      initialMotions={motions}
    />
  );
}
