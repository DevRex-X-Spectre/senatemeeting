import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireActiveMember } from "@/lib/auth/guards";
import { getMeeting, getAgendaItems, getQuorum } from "@/lib/meetings/queries";
import { getMotionsForMeeting } from "@/lib/motions/actions";
import { Card, CardContent, Badge, ItemStatusBadge, MotionStatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import { Users, Radio, Clock } from "lucide-react";
import { RaiseMotionForm } from "@/components/motions/RaiseMotionForm";
import { CheckInButton } from "@/components/meetings/CheckInButton";
import { getMyAttendance } from "@/lib/attendance/actions";
import Link from "next/link";
import { MotionVoteRow } from "@/components/live/MotionVoteRow";

export const metadata: Metadata = { title: "Live session" };

export default async function LiveSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireActiveMember();
  const meeting: any = await getMeeting(id);

  if (!meeting || meeting.status !== "live") redirect(`/meetings/${id}`);

  const [agendaItems, quorum, motions, checkedIn] = await Promise.all([
    getAgendaItems(id) as Promise<any[]>,
    getQuorum(id) as Promise<any>,
    getMotionsForMeeting(id) as Promise<any[]>,
    getMyAttendance(id, profile.id),
  ]);

  const currentItem = agendaItems.find((i) => i.status === "in_progress") ?? null;
  const itemMotions = currentItem
    ? motions.filter((m) => m.agenda_item_id === currentItem.id)
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Badge tone="info" className="w-fit gap-1.5">
            <Radio className="size-3 animate-pulse" /> Live session
          </Badge>
          <h1 className="text-heading font-bold text-midnight-navy">{meeting.title}</h1>
          <p className="text-[15px] text-slate-blue">{formatDateTime(meeting.scheduled_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <CheckInButton meetingId={id} alreadyCheckedIn={checkedIn} />
          <Link href={`/meetings/${id}`} className="text-caption text-signal-blue hover:underline">
            Back to meeting
          </Link>
        </div>
      </div>

      {/* Quorum strip */}
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 text-[14px] font-medium text-midnight-navy">
            <Users className="size-4 text-slate-blue" />
            Attendance
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-slate-blue">
              {quorum?.present ?? 0} of {quorum?.denominator ?? 0} present
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                quorum?.quorum_met
                  ? "bg-success-soft text-success"
                  : "bg-warning-soft text-warning"
              }`}
            >
              Quorum {quorum?.quorum_met ? "met" : "not met"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Agenda — active item highlighted */}
      <section>
        <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">Agenda</h2>
        <div className="flex flex-col gap-2">
          {agendaItems.map((item: any, i: number) => {
            const isActive = item.status === "in_progress";
            return (
              <Card
                key={item.id}
                className={`transition-all ${isActive ? "border-signal-blue border-2 bg-signal-blue/[0.03]" : ""}`}
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fog text-[11px] font-bold text-slate-blue">
                        {i + 1}
                      </span>
                      <span className={`text-[14px] font-medium ${isActive ? "text-signal-blue" : "text-midnight-navy"}`}>
                        {item.title}
                      </span>
                    </div>
                    <ItemStatusBadge status={item.status as any} size="sm" />
                  </div>
                  {isActive && item.description ? (
                    <p className="ml-7 mt-1 text-caption text-slate-blue">{item.description}</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Active item: motions + vote */}
      {currentItem ? (
        <section>
          <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">
            Motions — {currentItem.title}
          </h2>
          <div className="flex flex-col gap-4">
            {/* Raise a motion */}
            <Card>
              <CardContent className="py-4">
                <p className="mb-2 text-caption font-medium text-slate-blue">Raise a motion</p>
                <RaiseMotionForm agendaItemId={currentItem.id} />
              </CardContent>
            </Card>

            {/* Motion list */}
            {itemMotions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {itemMotions.map((motion: any) => (
                  <MotionVoteRow
                    key={motion.id}
                    motion={motion}
                    userId={profile.id}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-caption text-slate-blue">No motions raised on this item yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="mx-auto mb-2 size-6 text-slate-blue" />
            <p className="text-caption text-slate-blue">
              The chair will open the first agenda item. Motions can be raised once an item is in progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}