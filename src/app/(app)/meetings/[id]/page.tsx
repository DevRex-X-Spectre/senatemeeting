import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/guards";
import { getMeeting, getAgendaItems, getQuorum } from "@/lib/meetings/queries";
import { getMyAttendance } from "@/lib/attendance/actions";
import {
  Card,
  CardContent,
  Button,
  ItemStatusBadge,
  MeetingStatusBadge,
  Badge,
} from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import { CheckCircle2, Radio } from "lucide-react";
import { CheckInButton } from "@/components/meetings/CheckInButton";
import type { Meeting, AgendaItem, QuorumSnapshot } from "@/types/domain";

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
  const meeting = (await getMeeting(id)) as (Meeting & { created_by: { full_name: string } }) | null;
  if (!meeting) notFound();

  const [agendaItems, quorum, checkedIn] = await Promise.all([
    getAgendaItems(id) as Promise<AgendaItem[]>,
    getQuorum(id) as Promise<QuorumSnapshot | null>,
    getMyAttendance(id, profile.id),
  ]);

  const isLive = meeting.status === "live";
  const canCheckIn = meeting.status === "live" || meeting.status === "agenda_published";

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MeetingStatusBadge status={meeting.status} />
            {meeting.status === "live" && (
              <Badge tone="success" className="gap-1.5">
                <Radio className="size-3 animate-pulse" /> Live now
              </Badge>
            )}
          </div>
          <h1 className="text-heading font-bold text-midnight-navy">{meeting.title}</h1>
          <p className="text-[15px] text-slate-blue">
            {formatDateTime(meeting.scheduled_at)}
            {meeting.location ? ` · ${meeting.location}` : null}
            {meeting.duration_min ? ` · ${meeting.duration_min} min` : null}
          </p>
        </div>
        {isLive ? (
          <Link href={`/meetings/${id}/live`}>
            <Button size="lg" className="shrink-0 gap-2">
              <Radio className="size-4" /> Join live session
            </Button>
          </Link>
        ) : null}
      </div>

      {/* Check-in */}
      {canCheckIn && meeting.status !== "live" && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-slate-blue" />
              <div>
                <p className="text-[14px] font-medium text-midnight-navy">Check in to this meeting</p>
                <p className="text-caption text-slate-blue">
                  {quorum
                    ? `${quorum.present} of ${quorum.denominator} members present · quorum ${quorum.quorum_met ? "met" : "not met"}`
                    : "Let the admin know you're attending."}
                </p>
              </div>
            </div>
            <CheckInButton meetingId={id} alreadyCheckedIn={checkedIn} />
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {meeting.description ? (
        <Card>
          <CardContent className="py-4">
            <p className="text-[15px] text-slate-blue whitespace-pre-wrap">{meeting.description}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Agenda */}
      <section>
        <h2 className="mb-4 text-subheading font-semibold text-midnight-navy">Agenda</h2>
        {agendaItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-[14px] text-slate-blue">
                {meeting.status === "draft"
                  ? "The agenda hasn't been published yet."
                  : "No agenda items for this meeting."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {agendaItems.map((item, i) => (
              <Card
                key={item.id}
                className={item.status === "in_progress" ? "border-signal-blue border-2" : ""}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fog text-[11px] font-bold text-slate-blue">
                          {i + 1}
                        </span>
                        <p className="text-[15px] font-medium text-midnight-navy">{item.title}</p>
                      </div>
                      {item.description ? (
                        <p className="ml-7 text-caption text-slate-blue">{item.description}</p>
                      ) : null}
                      {item.outcome_notes ? (
                        <p className="ml-7 mt-1 rounded-md bg-fog px-2.5 py-1.5 text-caption text-slate-blue">
                          Outcome: {item.outcome_notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <ItemStatusBadge status={item.status} size="sm" />
                      <span className="text-caption text-slate-blue">{item.allocated_min} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}