import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { listMeetings } from "@/lib/meetings/queries";
import { Card, CardContent, Button, EmptyState, MeetingStatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export const metadata: Metadata = { title: "Meetings" };

export default async function MeetingsPage() {
  await requireActiveMember();
  const meetings = await listMeetings();

  const upcoming = meetings.filter(
    (m) => m.status === "agenda_published" || m.status === "live",
  );
  const past = meetings.filter(
    (m) => m.status === "ended" || m.status === "minutes_published",
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">Meetings</h1>
        <p className="max-w-2xl text-[16px] leading-[1.5] text-steel">
          Browse upcoming sessions, live meetings, and past meeting records.
        </p>
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-6" />}
          title="No meetings yet"
          description="When a meeting is scheduled, it will appear here."
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">Upcoming</h2>
              <div className="flex flex-col gap-3">
                {upcoming.map((m) => (
                  <MeetingRow key={m.id} meeting={m} />
                ))}
              </div>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">Past meetings</h2>
              <div className="flex flex-col gap-3">
                {past.map((m) => (
                  <MeetingRow key={m.id} meeting={m} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MeetingRow({ meeting }: { meeting: Awaited<ReturnType<typeof listMeetings>>[number] }) {
  const isLive = meeting.status === "live";
  return (
    <Card className="transition-colors duration-150 hover:border-graphite/20">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/meetings/${meeting.id}`} className="text-[16px] font-semibold text-graphite hover:underline">
              {meeting.title}
            </Link>
            <MeetingStatusBadge status={meeting.status} size="sm" />
          </div>
          <p className="text-[14px] leading-[1.43] text-steel">
            {formatDateTime(meeting.scheduled_at)}
            {meeting.location ? ` · ${meeting.location}` : null}
          </p>
        </div>
        <Link href={`/meetings/${meeting.id}`} className="w-full sm:w-auto">
          <Button variant={isLive ? "primary" : "outline"} size="sm" fullWidth className="sm:w-auto">
            {isLive ? "Join live" : "View meeting"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}