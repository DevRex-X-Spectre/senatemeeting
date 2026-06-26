import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { listMeetings } from "@/lib/meetings/queries";
import { Card, CardContent, MeetingStatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  await requireActiveMember();
  const meetings = await listMeetings();

  const past = meetings.filter(
    (m) =>
      m.status === "ended" ||
      m.status === "minutes_published" ||
      m.status === "cancelled",
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <h1 className="text-heading font-bold text-midnight-navy">Meeting history</h1>

      {past.length === 0 ? (
        <p className="text-slate-blue">No past meetings yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {past.map((m) => (
            <Card key={m.id} className="transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/meetings/${m.id}`}
                      className="text-[15px] font-semibold text-midnight-navy hover:underline"
                    >
                      {m.title}
                    </Link>
                    <MeetingStatusBadge status={m.status} size="sm" />
                  </div>
                  <p className="text-caption text-slate-blue">
                    {formatDateTime(m.scheduled_at)}
                    {m.location ? ` · ${m.location}` : null}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {m.status === "minutes_published" && (
                    <Link href={`/meetings/${m.id}/minutes`}>
                      <span className="text-caption font-medium text-signal-blue hover:underline">
                        Minutes →
                      </span>
                    </Link>
                  )}
                  <Link href={`/meetings/${m.id}`}>
                    <span className="text-caption font-medium text-signal-blue hover:underline">
                      View →
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}