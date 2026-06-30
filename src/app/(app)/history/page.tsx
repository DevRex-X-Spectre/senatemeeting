import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { listMeetings } from "@/lib/meetings/queries";
import { Card, CardContent, MeetingStatusBadge, Button, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
      <h1 className="text-heading font-bold tracking-tight text-midnight-navy">Meeting history</h1>

      {past.length === 0 ? (
        <EmptyState
          title="No past meetings yet"
          description="Completed meetings will show up here once they are ended or published."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {past.map((m) => (
            <Card key={m.id} className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                <div className="flex shrink-0 gap-2">
                  {m.status === "minutes_published" && (
                    <Link href={`/meetings/${m.id}/minutes`}>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        Minutes <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/meetings/${m.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      View <ArrowRight className="size-4" />
                    </Button>
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
