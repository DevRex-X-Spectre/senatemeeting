import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-heading font-bold text-midnight-navy">Meetings</h1>
        <p className="mt-1 text-[15px] text-slate-blue">
          Upcoming and past senate meetings.
        </p>
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-6" />}
          title="No meetings yet"
          description="When an admin schedules a meeting, it'll appear here."
        />
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-subheading font-semibold text-midnight-navy">Upcoming</h2>
              <div className="flex flex-col gap-3">
                {upcoming.map((m) => (
                  <MeetingRow key={m.id} meeting={m} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-subheading font-semibold text-midnight-navy">Past</h2>
              <div className="flex flex-col gap-3">
                {past.map((m) => (
                  <MeetingRow key={m.id} meeting={m} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MeetingRow({ meeting }: { meeting: Awaited<ReturnType<typeof listMeetings>>[number] }) {
  const isLive = meeting.status === "live";
  return (
    <Card className="transition-shadow hover:shadow-card-hover">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/meetings/${meeting.id}`} className="text-[15px] font-semibold text-midnight-navy hover:underline">
              {meeting.title}
            </Link>
            <MeetingStatusBadge status={meeting.status} size="sm" />
          </div>
          <p className="text-caption text-slate-blue">
            {formatDateTime(meeting.scheduled_at)}
            {meeting.location ? ` · ${meeting.location}` : null}
          </p>
        </div>
        <Link href={`/meetings/${meeting.id}`}>
          <Button variant={isLive ? "primary" : "outline"} size="sm">
            {isLive ? "Join live" : "View"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}