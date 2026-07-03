import type { Metadata } from "next";
import { AgendaBuilderClient } from "./AgendaBuilderClient";
import { getAgendaItems } from "@/lib/meetings/queries";

export const metadata: Metadata = {
  title: "Build agenda | UniSenate",
};

export default async function AgendaBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: meetingId } = await params;
  const agendaItems = await getAgendaItems(meetingId);
  const agendaVersion = agendaItems.map((item) => `${item.id}:${item.order_index}`).join("|");

  return <AgendaBuilderClient key={agendaVersion} meetingId={meetingId} initialItems={agendaItems} />;
}
