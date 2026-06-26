import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getMeeting, getAgendaItems } from "@/lib/meetings/queries";
import {
  Card, CardContent,
  Button, MeetingStatusBadge, ItemStatusBadge, Badge,
} from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import {
  ArrowLeft, CalendarPlus, Radio, FileText,
  Play, Square, Send,
} from "lucide-react";
import { StatusActionButton } from "@/components/admin/meetings/StatusActionButton";

export const metadata: Metadata = { title: "Meeting" };

function notFound(): never {
  throw new Error("Meeting not found");
}

export default async function AdminMeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();
  const meeting: any = await getMeeting(id);
  if (!meeting) notFound();

  const agendaItems: any[] = await getAgendaItems(id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      {/* Header */}
      <div>
        <Link href="/admin/meetings" className="mb-3 inline-flex items-center gap-1.5 text-signal-blue hover:underline">
          <ArrowLeft className="size-4" /> Back to meetings
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <MeetingStatusBadge status={meeting.status as any} className="mb-2" />
            <h1 className="text-heading font-bold text-midnight-navy">{meeting.title}</h1>
            <p className="mt-1 text-[15px] text-slate-blue">
              {formatDateTime(meeting.scheduled_at)}
              {meeting.location ? ` · ${meeting.location}` : null}
              {meeting.duration_min ? ` · ${meeting.duration_min} min` : null}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {meeting.status === "draft" && (
          <>
            <StatusActionButton
              actionType="publishAgenda"
              meetingId={meeting.id}
              label="Publish agenda"
              variant="primary"
              icon={<Send className="size-4" />}
              confirm="Publish the agenda to notify all members?"
            />
            <Link href={`/admin/meetings/${meeting.id}/agenda`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarPlus className="size-4" /> Build agenda
              </Button>
            </Link>
          </>
        )}
        {meeting.status === "agenda_published" && (
          <StatusActionButton
            actionType="startMeeting"
            meetingId={meeting.id}
            label="Start meeting"
            variant="primary"
            icon={<Play className="size-4" />}
            confirm="Start the live session? Members will be notified."
          />
        )}
        {meeting.status === "live" && (
          <>
            <Link href={`/admin/meetings/${meeting.id}/live`}>
              <Button variant="primary" size="sm" className="gap-1.5">
                <Radio className="size-4 animate-pulse" /> Open live controls
              </Button>
            </Link>
            <StatusActionButton
              actionType="endMeeting"
              meetingId={meeting.id}
              label="End meeting"
              variant="destructive"
              icon={<Square className="size-4" />}
              confirm="End the meeting? This will stop the live session."
            />
          </>
        )}
        {(meeting.status === "ended" || meeting.status === "live") && !meeting.minutes_published_at && (
          <Link href={`/admin/meetings/${meeting.id}/minutes`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="size-4" /> Manage minutes
            </Button>
          </Link>
        )}
      </div>

      {/* Agenda */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-subheading font-semibold text-midnight-navy">Agenda</h2>
          {meeting.status === "draft" && (
            <Link href={`/admin/meetings/${meeting.id}/agenda`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarPlus className="size-4" /> Edit agenda
              </Button>
            </Link>
          )}
        </div>
        {agendaItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-caption text-slate-blue">
                No agenda items yet.{" "}
                <Link href={`/admin/meetings/${meeting.id}/agenda`} className="text-signal-blue hover:underline">
                  Build the agenda
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {agendaItems.map((item: any, i: number) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fog text-[11px] font-bold text-slate-blue">
                      {i + 1}
                    </span>
                    <p className="text-[14px] font-medium text-midnight-navy">{item.title}</p>
                    {item.carried_from_id ? (
                      <Badge tone="warning" size="sm">Carried</Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-slate-blue">{item.allocated_min} min</span>
                    <ItemStatusBadge status={item.status as any} size="sm" />
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