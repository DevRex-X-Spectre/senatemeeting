import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getMeetingOverview } from "@/lib/meetings/queries";
import {
  Card, CardContent,
  Button, MeetingStatusBadge,
} from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import {
  ArrowLeft, CalendarPlus, Radio, FileText,
  Play, Square, Send,
} from "lucide-react";
import { StatusActionButton } from "@/components/admin/meetings/StatusActionButton";
import { AgendaChecklistControls } from "@/components/admin/meetings/AgendaChecklistControls";

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
  const { meeting, agendaItems } = await getMeetingOverview(id);
  if (!meeting) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      {/* Header */}
      <div>
        <Link href="/admin/meetings" className="mb-3 inline-flex items-center gap-1.5 text-signal-blue hover:underline">
          <ArrowLeft className="size-4" /> Back to meetings
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <MeetingStatusBadge status={meeting.status} className="mb-2" />
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
            <Link href={`/admin/meetings/${meeting.id}/agenda`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarPlus className="size-4" /> Build agenda checklist
              </Button>
            </Link>
            <StatusActionButton
              actionType="publishAgenda"
              meetingId={meeting.id}
              label="Publish agenda to members"
              variant="primary"
              icon={<Send className="size-4" />}
              confirm="Publish this meeting agenda so approved senate members can view it?"
            />
          </>
        )}
        {meeting.status === "agenda_published" && (
          <StatusActionButton
            actionType="startMeeting"
            meetingId={meeting.id}
            label="Start meeting session"
            variant="primary"
            icon={<Play className="size-4" />}
            confirm="Start the meeting session? Members will be notified."
          />
        )}
        {meeting.status === "live" && (
          <>
            <Link href={`/admin/meetings/${meeting.id}/live`}>
              <Button variant="primary" size="sm" className="gap-1.5">
                <Radio className="size-4 animate-pulse" /> Advanced live controls
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
              <FileText className="size-4" /> Post-meeting record
            </Button>
          </Link>
        )}
      </div>

      {/* Agenda */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-subheading font-semibold text-midnight-navy">Agenda checklist</h2>
            <p className="mt-1 text-caption text-slate-blue">
              Publish this checklist for senate members, then mark each item as accomplished as the meeting covers it.
            </p>
          </div>
          {meeting.status === "draft" && (
            <Link href={`/admin/meetings/${meeting.id}/agenda`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarPlus className="size-4" /> Edit checklist
              </Button>
            </Link>
          )}
        </div>
        {agendaItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-caption text-slate-blue">
                No checklist items yet.{" "}
                <Link href={`/admin/meetings/${meeting.id}/agenda`} className="text-signal-blue hover:underline">
                  Build the agenda checklist
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <AgendaChecklistControls
            key={agendaItems.map((item) => `${item.id}:${item.status}:${item.order_index}`).join("|")}
            meetingStatus={meeting.status}
            initialItems={agendaItems}
          />
        )}
      </section>
    </div>
  );
}
