import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { getMeetingOverview } from "@/lib/meetings/queries";
import { getMyAttendance } from "@/lib/attendance/actions";
import {
  Card,
  CardContent,
  Button,
  MeetingStatusBadge,
  Badge,
} from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import { CheckCircle2, Radio } from "lucide-react";
import { CheckInButton } from "@/components/meetings/CheckInButton";
import { PublishedAgendaList } from "@/components/meetings/PublishedAgendaList";

export const metadata: Metadata = { title: "Meeting" };

function notFound(): never {
  throw new Error("Meeting not found");
}

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireActiveMember();
  const { meeting, agendaItems, quorum } = await getMeetingOverview(id);
  if (!meeting) notFound();

  const checkedIn = await getMyAttendance(id, profile.id);

  const isLive = meeting.status === "live";
  const canCheckIn = meeting.status === "live" || meeting.status === "agenda_published";

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <MeetingStatusBadge status={meeting.status} />
            {meeting.status === "live" ? (
              <Badge tone="success" className="gap-1.5">
                <Radio className="size-3 animate-pulse" /> Live now
              </Badge>
            ) : null}
          </div>
          <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">
            {meeting.title}
          </h1>
          <p className="text-[16px] leading-[1.5] text-steel">
            {formatDateTime(meeting.scheduled_at)}
            {meeting.location ? ` · ${meeting.location}` : null}
            {meeting.duration_min ? ` · ${meeting.duration_min} min` : null}
          </p>
        </div>
        {isLive ? (
          <Link href={`/meetings/${id}/live`} className="w-full lg:w-auto">
            <Button size="lg" className="gap-2 w-full lg:w-auto">
              <Radio className="size-4" /> Join live session
            </Button>
          </Link>
        ) : null}
      </div>

      {canCheckIn && meeting.status !== "live" ? (
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-steel" />
              <div>
                <p className="text-[14px] font-medium text-graphite">Check in to this meeting</p>
                <p className="text-[14px] leading-[1.43] text-steel">
                  {quorum
                    ? `${quorum.present} of ${quorum.denominator} members present · quorum ${quorum.quorum_met ? "met" : "not met"}`
                    : "Let the admin know you are attending."}
                </p>
              </div>
            </div>
            <CheckInButton meetingId={id} alreadyCheckedIn={checkedIn} />
          </CardContent>
        </Card>
      ) : null}

      {meeting.description ? (
        <Card>
          <CardContent className="py-4 sm:py-5">
            <p className="whitespace-pre-wrap text-[16px] leading-[1.5] text-steel">{meeting.description}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">Published agenda checklist</h2>
          <p className="mt-1 text-[14px] leading-[1.43] text-steel">
            Follow the agenda items the VC has published for this senate meeting. Progress updates as items are covered.
          </p>
        </div>
        {meeting.status === "draft" ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-[14px] leading-[1.43] text-steel">The VC has not published this agenda yet.</p>
            </CardContent>
          </Card>
        ) : (
          <PublishedAgendaList meetingId={id} initialItems={agendaItems} />
        )}
      </section>
    </div>
  );
}
